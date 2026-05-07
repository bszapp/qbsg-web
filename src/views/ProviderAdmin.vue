<template>
    <div class="page-shell">
        <!-- 无权限 -->
        <div v-if="!hasProvider" class="no-permission-card">
            <div class="no-perm-icon">🔒</div>
            <h2>权限不足</h2>
            <p>当前账号未绑定任何提供商权限，无法访问此页面。</p>
            <button class="primary-button" @click="$router.push('/')">返回主页</button>
        </div>

        <!-- 有权限 -->
        <div v-else class="page-stack">
            <section class="hero-card">
                <span class="page-eyebrow">管理后台</span>
                <div class="page-title-row">
                    <h1 class="page-title">提供商：{{ providerName }}</h1>
                </div>
            </section>

            <div class="tab-bar">
                <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: activeTab === tab.key }]"
                    @click="switchTab(tab.key)">
                    {{ tab.label }}
                </button>
            </div>

            <!-- ── 固件目录 ── -->
            <div v-if="activeTab === 'catalog'">
                <section class="panel-card">
                    <div class="section-header">
                        <div>
                            <h2 class="section-title">固件目录分组</h2>
                            <p class="section-desc">每个分组对应一个激活编号，可包含多个固件条目。</p>
                        </div>
                        <button class="primary-button small-btn" @click="openAddGroup">+ 新增分组</button>
                    </div>

                    <div v-if="loadingCatalog" class="state-text">加载中…</div>
                    <div v-else-if="!groups.length" class="state-text">暂无分组，点击右上角新增</div>

                    <div v-else class="groups-list">
                        <div v-for="g in groups" :key="g.id" class="group-card">
                            <div class="group-header">
                                <div class="group-meta">
                                    <strong class="group-label">{{ g.label }}</strong>
                                    <span class="group-tags">
                                        <span class="tag tag-id">激活编号: {{ g.activation_id || '（无）' }}</span>
                                        <span class="tag tag-pts">{{ g.points }} 积分</span>
                                        <span class="tag tag-sort">排序: {{ g.sort_order }}</span>
                                    </span>
                                </div>
                                <div class="group-actions">
                                    <button class="icon-btn" @click="openEditGroup(g)" title="编辑">✏️</button>
                                    <button class="icon-btn danger" @click="confirmDeleteGroup(g)"
                                        title="删除">🗑️</button>
                                </div>
                            </div>

                            <div class="firmwares-section">
                                <div class="firmwares-toggle" @click="toggleFirmwares(g.id)">
                                    <span>固件列表（{{ g.firmwares?.length || 0 }}）</span>
                                    <span>{{ expandedGroups.has(g.id) ? '▲' : '▼' }}</span>
                                </div>
                                <div v-if="expandedGroups.has(g.id)" class="firmwares-list">
                                    <div v-if="!g.firmwares?.length" class="state-text small">此分组暂无固件条目</div>
                                    <div v-for="(fw, idx) in g.firmwares" :key="idx" class="firmware-row">
                                        <div class="fw-field"><span class="fw-key">firmware_id</span><span
                                                class="fw-val mono">{{ fw.firmware_id }}</span></div>
                                        <div class="fw-field"><span class="fw-key">名称</span><span class="fw-val">{{
                                                fw.name || '—' }}</span></div>
                                        <div class="fw-field"><span class="fw-key">尺寸</span><span class="fw-val">{{
                                                fw.screen_size || '—' }}</span></div>
                                        <div class="fw-field"><span class="fw-key">描述</span><span class="fw-val">{{
                                                fw.description || '—' }}</span></div>
                                        <div class="fw-field"><span class="fw-key">图片URL</span><span
                                                class="fw-val mono url-val">{{ fw.image_url || '—' }}</span></div>
                                        <div class="fw-field"><span class="fw-key">下载URL</span><span
                                                class="fw-val mono url-val">{{ fw.download_url || '—' }}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- ── 激活脚本 ── -->
            <div v-if="activeTab === 'script'">
                <section class="panel-card">
                    <div class="section-header">
                        <div>
                            <h2 class="section-title">激活码生成脚本</h2>
                            <p class="section-desc">
                                Node.js ESM 脚本，运行于沙箱，仅允许通过白名单规则联网，无法访问本地地址和文件系统。<br>
                                激活码直接 <code class="inline-code">console.log(code)</code> 输出即可。
                                可用变量：<code class="inline-code">FIRMWARE_ID</code>、<code
                                    class="inline-code">MAC</code>（由沙箱注入）。
                            </p>
                        </div>
                    </div>
                    <div v-if="loadingScript" class="state-text">加载中…</div>
                    <textarea v-else v-model="scriptContent" class="code-editor" rows="24" placeholder="// 在此编写激活码生成脚本（ESM 格式）
// 可用变量: FIRMWARE_ID, MAC (由沙箱自动注入)
//
// 示例：
// const resp = await fetch('https://your-api.com/activate?mac=' + MAC + '&fw=' + FIRMWARE_ID)
// const json = await resp.json()
// console.log(json.code)
" spellcheck="false"></textarea>
                    <div class="button-row">
                        <button class="primary-button" @click="saveScript" :disabled="savingScript">
                            {{ savingScript ? '保存中…' : '保存脚本' }}
                        </button>
                    </div>
                </section>
            </div>

            <!-- ── 网络白名单 ── -->
            <div v-if="activeTab === 'allowlist'">
                <section class="panel-card">
                    <div class="section-header">
                        <div>
                            <h2 class="section-title">网络访问白名单</h2>
                            <p class="section-desc">脚本中的 fetch 只能访问 URL 与以下正则匹配的地址，每行一条正则表达式。</p>
                        </div>
                    </div>
                    <div v-if="loadingAllowlist" class="state-text">加载中…</div>
                    <div v-else>
                        <div v-if="!allowlistPatterns.length" class="state-text">暂无规则，点击下方添加</div>
                        <div v-for="(p, idx) in allowlistPatterns" :key="idx" class="pattern-row">
                            <input v-model="allowlistPatterns[idx]" class="text-input"
                                placeholder="正则，如: ^https://api\.example\.com" />
                            <button class="icon-btn danger" @click="removePattern(idx)" title="删除">🗑️</button>
                        </div>
                        <button class="secondary-button" @click="addPattern">+ 添加规则</button>
                        <div class="button-row" style="margin-top: 16px;">
                            <button class="primary-button" @click="saveAllowlist" :disabled="savingAllowlist">
                                {{ savingAllowlist ? '保存中…' : '保存白名单' }}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <!-- ── 分组编辑弹窗 ── -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div v-if="showGroupModal" class="modal-overlay" @click.self="closeGroupModal">
                    <div class="modal-container large-modal">
                        <div class="modal-header">
                            <h2 class="modal-title">{{ editingGroup ? '编辑分组' : '新增分组' }}</h2>
                            <button class="popup-close-btn" @click="closeGroupModal">✕</button>
                        </div>
                        <div class="modal-body">
                            <div class="field-grid">
                                <div class="field-group">
                                    <label class="field-label">分组名称 *</label>
                                    <input v-model="groupForm.label" class="text-input" placeholder="如：5寸机型高级激活" />
                                </div>
                                <div class="field-group">
                                    <label class="field-label">激活编号（activation_type_id）</label>
                                    <input v-model="groupForm.activation_type_id" class="text-input"
                                        placeholder="留空表示仅展示、不参与激活" />
                                </div>
                                <div class="field-group">
                                    <label class="field-label">积分定价</label>
                                    <input v-model.number="groupForm.points" type="number" min="0" class="text-input"
                                        placeholder="0" />
                                </div>
                                <div class="field-group">
                                    <label class="field-label">排序值（越小越靠前）</label>
                                    <input v-model.number="groupForm.sort_order" type="number" class="text-input"
                                        placeholder="0" />
                                </div>
                            </div>

                            <div class="firmwares-editor">
                                <div class="fw-editor-header">
                                    <span class="field-label">固件条目列表</span>
                                    <button class="secondary-button small-btn" @click="addFirmwareRow">+ 添加固件</button>
                                </div>
                                <div v-if="!groupForm.firmwares.length" class="state-text small">暂无固件，点击右侧按钮添加</div>
                                <div v-for="(fw, idx) in groupForm.firmwares" :key="idx" class="fw-editor-row">
                                    <div class="fw-editor-fields">
                                        <div class="fw-input-wrap">
                                            <label class="fw-input-label">firmware_id *</label>
                                            <input v-model="fw.firmware_id" class="text-input" placeholder="唯一标识（必填）" />
                                        </div>
                                        <div class="fw-input-wrap">
                                            <label class="fw-input-label">名称</label>
                                            <input v-model="fw.name" class="text-input" placeholder="显示名称" />
                                        </div>
                                        <div class="fw-input-wrap">
                                            <label class="fw-input-label">尺寸</label>
                                            <input v-model="fw.screen_size" class="text-input" placeholder="如：5.0寸" />
                                        </div>
                                        <div class="fw-input-wrap">
                                            <label class="fw-input-label">描述</label>
                                            <input v-model="fw.description" class="text-input" placeholder="简短描述" />
                                        </div>
                                        <div class="fw-input-wrap">
                                            <label class="fw-input-label">图片 URL</label>
                                            <input v-model="fw.image_url" class="text-input"
                                                placeholder="https://..." />
                                        </div>
                                        <div class="fw-input-wrap">
                                            <label class="fw-input-label">下载 URL</label>
                                            <input v-model="fw.download_url" class="text-input"
                                                placeholder="https://..." />
                                        </div>
                                    </div>
                                    <button class="icon-btn danger" @click="removeFirmwareRow(idx)"
                                        title="删除此固件">🗑️</button>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="secondary-button" @click="closeGroupModal">取消</button>
                            <button class="primary-button" @click="saveGroup" :disabled="savingGroup">
                                {{ savingGroup ? '保存中…' : '确认保存' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useToast } from '../composables/useToast.js'
import { buildApiUrl } from '../config/app.js'

const router = useRouter()
const { state: authState } = useAuth()
const { showToast } = useToast()

const hasProvider = computed(() => !!authState.user?.provider)
const providerName = computed(() => authState.user?.provider?.name || '')
const token = computed(() => authState.token)

// ── 标签页 ────────────────────────────────────────────────────────────────────
const tabs = [
    { key: 'catalog', label: '固件目录' },
    { key: 'script', label: '激活脚本' },
    { key: 'allowlist', label: '网络白名单' },
]
const activeTab = ref('catalog')

function switchTab(key) {
    activeTab.value = key
    if (key === 'catalog') loadCatalog()
    if (key === 'script' && scriptContent.value === null) loadScript()
    if (key === 'allowlist' && !allowlistLoaded.value) loadAllowlist()
}

// ── 通用请求封装 ──────────────────────────────────────────────────────────────
async function apiGet(path) {
    const url = buildApiUrl(path) + '?token=' + encodeURIComponent(token.value)
    const res = await fetch(url, { method: 'GET', headers: { 'Authorization': 'Bearer ' + token.value } })
    return res.json()
}

async function apiPost(path, body) {
    const res = await fetch(buildApiUrl(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, token: token.value }),
    })
    return res.json()
}

async function apiPut(path, body) {
    const res = await fetch(buildApiUrl(path), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, token: token.value }),
    })
    return res.json()
}

async function apiDelete(path, body) {
    const res = await fetch(buildApiUrl(path), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, token: token.value }),
    })
    return res.json()
}

// ── 固件目录 ──────────────────────────────────────────────────────────────────
const groups = ref([])
const loadingCatalog = ref(false)
const expandedGroups = ref(new Set())

async function loadCatalog() {
    loadingCatalog.value = true
    try {
        const data = await apiGet('/api/provider/catalog')
        if (data.type === 'success') {
            groups.value = data.groups || []
        } else {
            showToast(data.message || '目录加载失败', 'error', 3000)
        }
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    } finally {
        loadingCatalog.value = false
    }
}

function toggleFirmwares(id) {
    const s = new Set(expandedGroups.value)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    expandedGroups.value = s
}

// ── 分组弹窗 ──────────────────────────────────────────────────────────────────
const showGroupModal = ref(false)
const editingGroup = ref(null)
const savingGroup = ref(false)

function emptyFirmware() {
    return { firmware_id: '', name: '', screen_size: '', description: '', image_url: '', download_url: '' }
}

const groupForm = ref({ label: '', activation_type_id: '', points: 0, sort_order: 0, firmwares: [] })

function openAddGroup() {
    editingGroup.value = null
    groupForm.value = { label: '', activation_type_id: '', points: 0, sort_order: 0, firmwares: [] }
    showGroupModal.value = true
}

function openEditGroup(g) {
    editingGroup.value = g
    groupForm.value = {
        label: g.label,
        activation_type_id: g.activation_id || '',
        points: g.points || 0,
        sort_order: g.sort_order || 0,
        firmwares: (g.firmwares || []).map(f => ({ ...f })),
    }
    showGroupModal.value = true
}

function closeGroupModal() { showGroupModal.value = false }
function addFirmwareRow() { groupForm.value.firmwares.push(emptyFirmware()) }
function removeFirmwareRow(idx) { groupForm.value.firmwares.splice(idx, 1) }

async function saveGroup() {
    if (!groupForm.value.label.trim()) {
        showToast('请填写分组名称', 'warning', 2500)
        return
    }
    savingGroup.value = true
    try {
        const payload = {
            label: groupForm.value.label.trim(),
            activation_type_id: groupForm.value.activation_type_id.trim() || null,
            points: Number(groupForm.value.points) || 0,
            sort_order: Number(groupForm.value.sort_order) || 0,
            firmwares: groupForm.value.firmwares.filter(f => f.firmware_id.trim()),
        }
        const data = editingGroup.value
            ? await apiPut(`/api/provider/catalog/${editingGroup.value.id}`, payload)
            : await apiPost('/api/provider/catalog', payload)

        if (data.type === 'success') {
            showToast(editingGroup.value ? '分组已更新' : '分组已新增', 'success', 2500)
            closeGroupModal()
            await loadCatalog()
        } else {
            showToast(data.message || '保存失败', 'error', 3000)
        }
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    } finally {
        savingGroup.value = false
    }
}

async function confirmDeleteGroup(g) {
    if (!confirm(`确认删除分组「${g.label}」？\n\n此操作不可恢复，删除后该分组的固件和激活编号将全部移除。`)) return
    try {
        const data = await apiDelete(`/api/provider/catalog/${g.id}`, {})
        if (data.type === 'success') {
            showToast('分组已删除', 'success', 2500)
            await loadCatalog()
        } else {
            showToast(data.message || '删除失败', 'error', 3000)
        }
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    }
}

// ── 激活脚本 ──────────────────────────────────────────────────────────────────
const scriptContent = ref(null)
const loadingScript = ref(false)
const savingScript = ref(false)

async function loadScript() {
    loadingScript.value = true
    try {
        const data = await apiGet('/api/provider/script')
        scriptContent.value = data.type === 'success' ? (data.content || '') : ''
        if (data.type !== 'success') showToast(data.message || '脚本加载失败', 'error', 3000)
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
        scriptContent.value = ''
    } finally {
        loadingScript.value = false
    }
}

async function saveScript() {
    savingScript.value = true
    try {
        const data = await apiPut('/api/provider/script', { content: scriptContent.value })
        if (data.type === 'success') showToast('脚本已保存', 'success', 2500)
        else showToast(data.message || '保存失败', 'error', 3000)
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    } finally {
        savingScript.value = false
    }
}

// ── 网络白名单 ────────────────────────────────────────────────────────────────
const allowlistPatterns = ref([])
const loadingAllowlist = ref(false)
const savingAllowlist = ref(false)
const allowlistLoaded = ref(false)

async function loadAllowlist() {
    loadingAllowlist.value = true
    try {
        const data = await apiGet('/api/provider/allowlist')
        if (data.type === 'success') {
            allowlistPatterns.value = [...(data.patterns || [])]
            allowlistLoaded.value = true
        } else {
            showToast(data.message || '白名单加载失败', 'error', 3000)
        }
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    } finally {
        loadingAllowlist.value = false
    }
}

function addPattern() { allowlistPatterns.value.push('') }
function removePattern(idx) { allowlistPatterns.value.splice(idx, 1) }

async function saveAllowlist() {
    const patterns = allowlistPatterns.value.map(p => p.trim()).filter(Boolean)
    savingAllowlist.value = true
    try {
        const data = await apiPut('/api/provider/allowlist', { patterns })
        if (data.type === 'success') {
            showToast('白名单已保存', 'success', 2500)
            allowlistPatterns.value = patterns
        } else {
            showToast(data.message || '保存失败', 'error', 3000)
        }
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    } finally {
        savingAllowlist.value = false
    }
}

// ── 初始化 ────────────────────────────────────────────────────────────────────
onMounted(() => {
    if (hasProvider.value) loadCatalog()
})
</script>

<style scoped>
.no-permission-card {
    max-width: 480px;
    margin: 80px auto 0;
    text-align: center;
    padding: 48px 28px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    background: rgba(var(--card-background-rgb), 0.6);
}

.no-perm-icon {
    font-size: 52px;
    margin-bottom: 16px;
}

.no-permission-card h2 {
    margin: 0 0 12px;
    font-size: 22px;
    color: var(--text-color);
}

.no-permission-card p {
    color: var(--secondary-text-color);
    margin: 0 0 24px;
    font-size: 14px;
    line-height: 1.7;
}

/* ── 标签页 ── */
.tab-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.tab-btn {
    padding: 8px 22px;
    border-radius: 999px;
    border: 1px solid rgba(var(--text-color-rgb), 0.12);
    background: transparent;
    color: var(--secondary-text-color);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tab-btn.active {
    background: var(--theme-color);
    color: #fff;
    border-color: var(--theme-color);
}

.tab-btn:hover:not(.active) {
    border-color: var(--theme-color);
    color: var(--theme-color);
}

/* ── 通用状态文字 ── */
.state-text {
    padding: 24px;
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 14px;
}

.state-text.small {
    padding: 12px 16px;
    font-size: 13px;
}

.small-btn {
    padding: 8px 14px !important;
    font-size: 13px !important;
}

/* ── 分组列表 ── */
.groups-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
}

.group-card {
    border: 1px solid rgba(var(--text-color-rgb), 0.08);
    border-radius: 16px;
    overflow: hidden;
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 14px 16px;
    background: rgba(var(--text-color-rgb), 0.025);
    gap: 12px;
}

.group-meta {
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
    min-width: 0;
}

.group-label {
    font-size: 16px;
    color: var(--text-color);
    font-weight: 700;
}

.group-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tag {
    padding: 2px 9px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
}

.tag-id {
    background: rgba(var(--theme-color-rgb), 0.1);
    color: var(--theme-color);
}

.tag-pts {
    background: rgba(34, 197, 94, 0.12);
    color: #15803d;
}

.tag-sort {
    background: rgba(var(--text-color-rgb), 0.06);
    color: var(--secondary-text-color);
}

.group-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
}

.icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(var(--text-color-rgb), 0.1);
    background: rgba(var(--text-color-rgb), 0.04);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    transition: all 0.2s ease;
}

.icon-btn:hover {
    background: rgba(var(--text-color-rgb), 0.1);
}

.icon-btn.danger:hover {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.3);
}

/* ── 固件折叠列表 ── */
.firmwares-section {
    border-top: 1px solid rgba(var(--text-color-rgb), 0.06);
}

.firmwares-toggle {
    display: flex;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 13px;
    color: var(--secondary-text-color);
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
}

.firmwares-toggle:hover {
    background: rgba(var(--text-color-rgb), 0.03);
}

.firmwares-list {
    padding: 0 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.firmware-row {
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(var(--text-color-rgb), 0.03);
    border: 1px solid rgba(var(--text-color-rgb), 0.06);
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.fw-field {
    display: flex;
    align-items: baseline;
    gap: 5px;
    flex: 1 1 200px;
    min-width: 0;
}

.fw-key {
    font-size: 11px;
    font-weight: 700;
    color: var(--secondary-text-color);
    white-space: nowrap;
    flex-shrink: 0;
}

.fw-val {
    font-size: 12px;
    color: var(--text-color);
    word-break: break-all;
}

.fw-val.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.url-val {
    color: var(--theme-color);
    font-size: 11px;
}

/* ── 代码编辑器 ── */
.code-editor {
    width: 100%;
    box-sizing: border-box;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 13px;
    line-height: 1.65;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid rgba(var(--text-color-rgb), 0.12);
    background: rgba(var(--text-color-rgb), 0.03);
    color: var(--text-color);
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
    display: block;
    margin-top: 12px;
}

.code-editor:focus {
    border-color: rgba(var(--theme-color-rgb), 0.45);
}

.inline-code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    background: rgba(var(--theme-color-rgb), 0.1);
    color: var(--theme-color);
    padding: 1px 5px;
    border-radius: 4px;
}

/* ── 白名单 ── */
.pattern-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
}

.pattern-row .text-input {
    flex: 1;
}

.secondary-button {
    padding: 8px 18px;
    border-radius: 999px;
    border: 1px solid rgba(var(--text-color-rgb), 0.18);
    background: transparent;
    color: var(--text-color);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.secondary-button:hover {
    border-color: var(--theme-color);
    color: var(--theme-color);
}

/* ── 弹窗 ── */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    backdrop-filter: blur(4px);
}

.modal-container {
    width: 100%;
    max-width: 540px;
    background: rgba(var(--card-background-rgb), 1);
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
    border: 1px solid rgba(var(--theme-color-rgb), 0.15);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    overflow: hidden;
}

.large-modal {
    max-width: 740px;
}

.modal-header {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
}

.modal-title {
    margin: 0;
    font-size: 18px;
    color: var(--text-color);
    font-weight: 700;
}

.popup-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text-color);
    font-size: 16px;
    padding: 6px 10px;
    border-radius: 8px;
    transition: all 0.2s;
}

.popup-close-btn:hover {
    background: rgba(var(--text-color-rgb), 0.08);
    color: var(--text-color);
}

.modal-body {
    padding: 20px 24px;
    overflow-y: auto;
    flex: 1;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-shrink: 0;
}

/* ── 固件编辑器 ── */
.firmwares-editor {
    margin-top: 20px;
}

.fw-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.fw-editor-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid rgba(var(--text-color-rgb), 0.08);
    background: rgba(var(--text-color-rgb), 0.02);
    margin-bottom: 10px;
}

.fw-editor-fields {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.fw-input-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.fw-input-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-weight: 600;
}

/* ── 动画 ── */
.modal-fade-enter-active {
    transition: opacity 0.25s ease;
}

.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

/* ── 响应式 ── */
@media (max-width: 600px) {
    .fw-editor-fields {
        grid-template-columns: 1fr;
    }

    .large-modal {
        max-width: 100%;
    }

    .modal-container {
        max-width: 100%;
        max-height: 92vh;
    }

    .modal-body {
        padding: 16px;
    }

    .modal-header,
    .modal-footer {
        padding: 14px 16px;
    }
}
</style>