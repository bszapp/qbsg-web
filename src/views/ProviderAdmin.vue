<template>
    <div class="page-shell">

        <!-- 初始加载 -->
        <div v-if="pageLoading" class="state-text">加载中…</div>

        <!-- 无提供商权限 -->
        <div v-else-if="myProviders.length === 0" class="no-permission-card">
            <div class="no-perm-icon">🔒</div>
            <h2>您不是管理员</h2>
            <p>当前账号未绑定任何提供商权限，无法访问此页面。</p>
            <button class="primary-button" @click="$router.push('/')">返回主页</button>
        </div>

        <!-- 多提供商选择界面 -->
        <div v-else-if="myProviders.length > 1 && !selectedUuid" class="page-stack">
            <section class="hero-card">
                <span class="page-eyebrow">管理后台</span>
                <h1 class="page-title">请选择要管理的提供商</h1>
            </section>
            <div class="provider-selector">
                <button v-for="p in myProviders" :key="p.uuid" class="provider-btn" @click="selectProvider(p.uuid)">
                    <span class="provider-btn-name">{{ p.name }}</span>
                    <span class="provider-btn-arrow">→</span>
                </button>
            </div>
        </div>

        <!-- 主界面 -->
        <div v-else-if="selectedUuid" class="page-stack">
            <section class="hero-card">
                <span class="page-eyebrow">管理后台</span>
                <div class="page-title-row">
                    <h1 class="page-title">{{ selectedProviderName }}</h1>
                    <button v-if="myProviders.length > 1" class="secondary-button small-btn"
                        @click="selectedUuid = null">切换提供商</button>
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
                <div class="catalog-topbar">
                    <div>
                        <h2 class="section-title">固件目录</h2>
                        <p class="section-desc">点击分组头的按钮管理分组和固件条目。</p>
                    </div>
                    <button class="primary-button small-btn" @click="openAddGroupModal">＋ 创建新分组</button>
                </div>

                <div v-if="loadingCatalog" class="state-text">加载中…</div>
                <div v-else-if="groups.length === 0" class="state-text">暂无分组，点击右上角「创建新分组」</div>

                <div v-for="(group, gi) in groups" :key="group.id ?? ('new-' + gi)" class="group-block">
                    <!-- 分组头 -->
                    <div class="group-header">
                        <div class="group-meta">
                            <strong class="group-label">{{ group.label }}</strong>
                            <div class="group-tags">
                                <span class="tag tag-id">激活编号: {{ group.activation_id || '（无）' }}</span>
                                <span class="tag tag-pts">{{ group.points }} 积分</span>
                                <span class="tag tag-sort">排序: {{ group.sort_order }}</span>
                            </div>
                        </div>
                        <div class="group-actions">
                            <button class="action-btn" @click="openAddFirmwareModal(gi)">＋ 新增固件</button>
                            <button class="icon-btn" @click="openGroupSettingsModal(gi)" title="分组设置">⚙️</button>
                            <button class="icon-btn danger" @click="deleteGroup(gi)" title="删除分组">🗑️</button>
                        </div>
                    </div>

                    <!-- 固件列表 -->
                    <div class="firmware-list">
                        <div v-if="group.firmwares.length === 0" class="state-text small">
                            此分组暂无固件，点击分组头的「＋ 新增固件」添加
                        </div>
                        <div v-for="(fw, fi) in group.firmwares" :key="fw.firmware_id + '-' + fi" class="fw-item">
                            <div class="fw-thumb">
                                <img v-if="fw.image_display_url" :src="resolveDisplayUrl(fw.image_display_url)"
                                    class="fw-img" />
                                <div v-else class="fw-img-placeholder">📦</div>
                            </div>
                            <div class="fw-info">
                                <div class="fw-id mono">{{ fw.firmware_id }}</div>
                                <div class="fw-name">{{ fw.name || '（未命名）' }}</div>
                                <div v-if="fw.description" class="fw-desc">{{ fw.description }}</div>
                                <div class="fw-tags">
                                    <span v-if="fw.screen_size" class="tag tag-sort">{{ fw.screen_size }}</span>
                                    <span class="tag" :class="fw.image_filename ? 'tag-pts' : 'tag-empty'">
                                        封面 {{ fw.image_filename ? '✓' : '未上传' }}
                                    </span>
                                    <span class="tag" :class="fw.download_filename ? 'tag-pts' : 'tag-empty'">
                                        固件 {{ fw.download_filename ? '✓' : '未上传' }}
                                    </span>
                                </div>
                            </div>
                            <div class="fw-actions">
                                <button class="icon-btn" @click="openEditFirmwareModal(gi, fi)" title="编辑">✏️</button>
                                <button class="icon-btn danger" @click="deleteFirmware(gi, fi)" title="删除">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── 激活脚本 ── -->
            <div v-if="activeTab === 'script'">
                <section class="panel-card">
                    <div class="section-header">
                        <div>
                            <h2 class="section-title">激活码生成脚本</h2>
                            <p class="section-desc">
                                Node.js ESM 脚本，运行于沙箱。可用变量：
                                <code class="inline-code">FIRMWARE_ID</code>、<code class="inline-code">MAC</code>。
                            </p>
                        </div>
                    </div>
                    <div v-if="loadingScript" class="state-text">加载中…</div>
                    <textarea v-else v-model="scriptContent" class="code-editor" rows="24"
                        spellcheck="false"></textarea>
                    <div class="button-row">
                        <button class="primary-button" @click="saveScript" :disabled="savingScript">
                            {{ savingScript ? '保存中…' : '保存脚本' }}
                        </button>
                    </div>
                </section>
            </div>
        </div>

        <!-- ── 分组设置弹窗 ── -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div v-if="showGroupModal" class="modal-overlay">
                    <div class="modal-container">
                        <div class="modal-header">
                            <h2 class="modal-title">{{ editingGroupIdx === null ? '创建新分组' : '分组设置' }}</h2>
                            <button class="popup-close-btn" @click="closeGroupModal">✕</button>
                        </div>
                        <div class="modal-body">
                            <div class="field-grid">
                                <div class="field-group">
                                    <label class="field-label">分组名称 *</label>
                                    <input v-model="groupForm.label" class="text-input" placeholder="如：5寸机型激活" />
                                </div>
                                <div class="field-group">
                                    <label class="field-label">激活编号（activation_type_id）</label>
                                    <input v-model="groupForm.activation_id" class="text-input" placeholder="留空表示仅展示" />
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
                        </div>
                        <div class="modal-footer">
                            <button class="secondary-button" @click="closeGroupModal">取消</button>
                            <button class="primary-button" @click="saveGroupModal" :disabled="saving">
                                {{ saving ? '保存中…' : '确认保存' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- ── 固件编辑弹窗 ── -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div v-if="showFirmwareModal" class="modal-overlay">
                    <div class="modal-container large-modal">
                        <div class="modal-header">
                            <h2 class="modal-title">{{ editingFirmwareIdx === null ? '新增固件' : '编辑固件' }}</h2>
                            <button class="popup-close-btn" @click="closeFirmwareModal">✕</button>
                        </div>
                        <div class="modal-body">
                            <div class="field-grid">
                                <div class="field-group">
                                    <label class="field-label">firmware_id *</label>
                                    <input v-model="fwForm.firmware_id" class="text-input" placeholder="唯一标识（必填）" />
                                </div>
                                <div class="field-group">
                                    <label class="field-label">名称</label>
                                    <input v-model="fwForm.name" class="text-input" placeholder="显示名称" />
                                </div>
                                <div class="field-group">
                                    <label class="field-label">屏幕尺寸</label>
                                    <input v-model="fwForm.screen_size" class="text-input" placeholder="如：5.0寸" />
                                </div>
                                <div class="field-group">
                                    <label class="field-label">描述</label>
                                    <input v-model="fwForm.description" class="text-input" placeholder="简短描述" />
                                </div>
                            </div>

                            <!-- 封面图上传 -->
                            <div class="upload-section">
                                <div class="upload-section-header">
                                    <span class="field-label">封面图</span>
                                    <div class="upload-btn-row">
                                        <button type="button" class="upload-btn" :disabled="!!uploading"
                                            @click="triggerImageUpload">
                                            📁 {{ uploading === 'image' ? '上传中…' : '选择图片' }}
                                        </button>
                                        <button v-if="fwForm.image_filename" type="button" class="clear-file-btn"
                                            @click="clearImage">✕ 清除</button>
                                    </div>
                                </div>
                                <div v-if="fwForm.image_display_url" class="image-preview-wrap">
                                    <img :src="resolveDisplayUrl(fwForm.image_display_url)" class="preview-img" />
                                </div>
                                <div v-else class="no-file-hint">未上传封面图</div>
                            </div>

                            <!-- 固件文件上传 -->
                            <div class="upload-section">
                                <div class="upload-section-header">
                                    <span class="field-label">固件文件</span>
                                    <div class="upload-btn-row">
                                        <button type="button" class="upload-btn" :disabled="!!uploading"
                                            @click="triggerFirmwareUpload">
                                            📁 {{ uploading === 'firmware' ? '上传中…' : '选择固件' }}
                                        </button>
                                        <button v-if="fwForm.download_filename" type="button" class="clear-file-btn"
                                            @click="clearFirmware">✕ 清除</button>
                                    </div>
                                </div>
                                <div v-if="fwForm.download_filename" class="file-name-hint">
                                    已上传：{{ fwForm.download_filename }}
                                </div>
                                <div v-else class="no-file-hint">未上传固件文件</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="secondary-button" @click="closeFirmwareModal">取消</button>
                            <button class="primary-button" @click="saveFirmwareModal" :disabled="saving || !!uploading">
                                {{ saving ? '保存中…' : '确认保存' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!--
            隐藏文件输入框 —— 必须始终存在于 DOM 中（而非动态创建），
            这是修复 iOS Safari 上点击游离 input 触发页面刷新崩溃的关键。
        -->
        <input ref="imageFileInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
            style="position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none"
            @change="handleImageFileChange" />
        <input ref="firmwareFileInput" type="file"
            style="position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none"
            @change="handleFirmwareFileChange" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useToast } from '../composables/useToast.js'
import { buildApiUrl } from '../config/app.js'

const router = useRouter()
const route = useRoute()
const { state: authState } = useAuth()
const { showToast } = useToast()

const token = computed(() => authState.token)

// ── 提供商选择 ────────────────────────────────────────────────────────────────
const myProviders = ref([])
const selectedUuid = ref(null)
const pageLoading = ref(true)

const selectedProviderName = computed(() =>
    myProviders.value.find(p => p.uuid === selectedUuid.value)?.name ?? ''
)

async function loadMyProviders() {
    pageLoading.value = true
    try {
        const data = await apiPost('/api/provider/my-providers', {})
        if (data.type === 'success') {
            myProviders.value = data.providers ?? []
            if (myProviders.value.length === 1) {
                selectedUuid.value = myProviders.value[0].uuid
                await loadCatalog()
            }
        } else {
            showToast(data.message || '获取提供商列表失败', 'error', 3000)
        }
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    } finally {
        pageLoading.value = false
    }
}

async function selectProvider(uuid) {
    selectedUuid.value = uuid
    await loadCatalog()
}

// ── 标签页 ────────────────────────────────────────────────────────────────────
const tabs = [
    { key: 'catalog', label: '固件目录' },
    { key: 'script', label: '激活脚本' },
]
const activeTab = ref('catalog')

async function switchTab(key) {
    activeTab.value = key
    if (key === 'script' && scriptContent.value === null) await loadScript()
}

// ── 通用请求封装 ──────────────────────────────────────────────────────────────
async function apiPost(path, body) {
    const res = await fetch(buildApiUrl(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, token: token.value }),
    })
    return res.json()
}

// ── 固件目录 ──────────────────────────────────────────────────────────────────
const groups = ref([])
const loadingCatalog = ref(false)

async function loadCatalog() {
    if (!selectedUuid.value) return
    loadingCatalog.value = true
    try {
        const data = await apiPost('/api/provider/catalog/load', { provider_uuid: selectedUuid.value })
        if (data.type === 'success') {
            groups.value = (data.groups ?? []).map(g => ({ ...g, firmwares: g.firmwares ?? [] }))
        } else {
            showToast(data.message || '目录加载失败', 'error', 3000)
        }
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    } finally {
        loadingCatalog.value = false
    }
}

/** 把当前 groups 全量发送给后端保存，返回是否成功 */
async function saveAll() {
    try {
        const data = await apiPost('/api/provider/catalog/save', {
            provider_uuid: selectedUuid.value,
            groups: groups.value.map(g => ({
                label: g.label,
                activation_id: g.activation_id ?? null,
                points: Number(g.points) || 0,
                sort_order: Number(g.sort_order) || 0,
                firmwares: g.firmwares.map(fw => ({
                    firmware_id: fw.firmware_id,
                    name: fw.name ?? '',
                    screen_size: fw.screen_size ?? '',
                    description: fw.description ?? '',
                    image_filename: fw.image_filename ?? null,
                    download_filename: fw.download_filename ?? null,
                })),
            })),
        })
        if (data.type !== 'success') {
            showToast(data.message || '保存失败', 'error', 3000)
            return false
        }
        return true
    } catch (e) {
        showToast(e.message || '保存时网络错误', 'error', 3000)
        return false
    }
}

// ── 删除操作 ──────────────────────────────────────────────────────────────────
async function deleteGroup(gi) {
    const g = groups.value[gi]
    if (!confirm(`确认删除分组「${g.label}」？\n\n该分组下所有固件条目及相关服务器文件将被删除，不可恢复。`)) return
    groups.value.splice(gi, 1)
    const success = await saveAll()
    if (success) showToast('分组已删除', 'success', 2500)
    else await loadCatalog() // 回滚
}

async function deleteFirmware(gi, fi) {
    const fw = groups.value[gi].firmwares[fi]
    if (!confirm(`确认删除固件「${fw.firmware_id}」？`)) return
    groups.value[gi].firmwares.splice(fi, 1)
    const success = await saveAll()
    if (success) showToast('固件已删除', 'success', 2500)
    else await loadCatalog() // 回滚
}

// ── 分组设置弹窗 ──────────────────────────────────────────────────────────────
const showGroupModal = ref(false)
const editingGroupIdx = ref(null)
const saving = ref(false)
const groupForm = ref({ label: '', activation_id: '', points: 0, sort_order: 0 })

function openAddGroupModal() {
    editingGroupIdx.value = null
    groupForm.value = { label: '', activation_id: '', points: 0, sort_order: 0 }
    showGroupModal.value = true
}

function openGroupSettingsModal(gi) {
    const g = groups.value[gi]
    editingGroupIdx.value = gi
    groupForm.value = {
        label: g.label,
        activation_id: g.activation_id ?? '',
        points: g.points ?? 0,
        sort_order: g.sort_order ?? 0,
    }
    showGroupModal.value = true
}

function closeGroupModal() { showGroupModal.value = false }

async function saveGroupModal() {
    if (!groupForm.value.label.trim()) {
        showToast('请填写分组名称', 'warning', 2500)
        return
    }
    saving.value = true
    try {
        if (editingGroupIdx.value === null) {
            groups.value.push({
                id: null,
                label: groupForm.value.label.trim(),
                activation_id: groupForm.value.activation_id.trim() || null,
                points: Number(groupForm.value.points) || 0,
                sort_order: Number(groupForm.value.sort_order) || 0,
                firmwares: [],
            })
        } else {
            const g = groups.value[editingGroupIdx.value]
            g.label = groupForm.value.label.trim()
            g.activation_id = groupForm.value.activation_id.trim() || null
            g.points = Number(groupForm.value.points) || 0
            g.sort_order = Number(groupForm.value.sort_order) || 0
        }
        const success = await saveAll()
        if (success) {
            showToast(editingGroupIdx.value === null ? '分组已创建' : '分组已更新', 'success', 2500)
            closeGroupModal()
            await loadCatalog()
        } else {
            await loadCatalog() // 回滚
        }
    } finally {
        saving.value = false
    }
}

// ── 固件编辑弹窗 ──────────────────────────────────────────────────────────────
const showFirmwareModal = ref(false)
const editingGroupIdxForFw = ref(null)
const editingFirmwareIdx = ref(null)
const uploading = ref(null) // null | 'image' | 'firmware'

const fwForm = ref({
    firmware_id: '', name: '', screen_size: '', description: '',
    image_filename: null, download_filename: null,
    image_display_url: null, download_display_url: null,
})

function openAddFirmwareModal(gi) {
    editingGroupIdxForFw.value = gi
    editingFirmwareIdx.value = null
    fwForm.value = {
        firmware_id: '', name: '', screen_size: '', description: '',
        image_filename: null, download_filename: null,
        image_display_url: null, download_display_url: null,
    }
    showFirmwareModal.value = true
}

function openEditFirmwareModal(gi, fi) {
    const fw = groups.value[gi].firmwares[fi]
    editingGroupIdxForFw.value = gi
    editingFirmwareIdx.value = fi
    fwForm.value = {
        firmware_id: fw.firmware_id,
        name: fw.name ?? '',
        screen_size: fw.screen_size ?? '',
        description: fw.description ?? '',
        image_filename: fw.image_filename ?? null,
        download_filename: fw.download_filename ?? null,
        image_display_url: fw.image_display_url ?? null,
        download_display_url: fw.download_display_url ?? null,
    }
    showFirmwareModal.value = true
}

function closeFirmwareModal() { showFirmwareModal.value = false }

async function saveFirmwareModal() {
    if (!fwForm.value.firmware_id.trim()) {
        showToast('请填写 firmware_id', 'warning', 2500)
        return
    }
    saving.value = true
    try {
        const fw = {
            firmware_id: fwForm.value.firmware_id.trim(),
            name: fwForm.value.name,
            screen_size: fwForm.value.screen_size,
            description: fwForm.value.description,
            image_filename: fwForm.value.image_filename,
            download_filename: fwForm.value.download_filename,
            image_display_url: fwForm.value.image_display_url,
            download_display_url: fwForm.value.download_display_url,
        }
        const gi = editingGroupIdxForFw.value
        if (editingFirmwareIdx.value === null) {
            groups.value[gi].firmwares.push(fw)
        } else {
            groups.value[gi].firmwares[editingFirmwareIdx.value] = fw
        }
        const success = await saveAll()
        if (success) {
            showToast(editingFirmwareIdx.value === null ? '固件已添加' : '固件已更新', 'success', 2500)
            closeFirmwareModal()
        } else {
            await loadCatalog() // 回滚
        }
    } finally {
        saving.value = false
    }
}

// ── 文件上传（ref 指向始终在 DOM 中的隐藏 input，修复 iOS Safari 崩溃问题） ──
const imageFileInput = ref(null)
const firmwareFileInput = ref(null)

function triggerImageUpload() { imageFileInput.value?.click() }
function triggerFirmwareUpload() { firmwareFileInput.value?.click() }

async function handleImageFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = '' // 重置，允许重复选同一文件
    uploading.value = 'image'
    try {
        const url = buildApiUrl(
            `/api/provider/upload-image?token=${encodeURIComponent(token.value)}&provider_uuid=${encodeURIComponent(selectedUuid.value)}&filename=${encodeURIComponent(file.name)}`
        )
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file, // 直接发送原始 File 对象，无任何文本编码
        })
        const data = await res.json()
        if (data.type === 'success') {
            fwForm.value.image_filename = data.filename
            fwForm.value.image_display_url = `/providers/${selectedUuid.value}/${data.filename}`
            showToast('封面图上传成功', 'success', 2500)
        } else {
            showToast(data.message || '上传失败', 'error', 3000)
        }
    } catch (err) {
        showToast(err.message || '上传出错', 'error', 3000)
    } finally {
        uploading.value = null
    }
}

async function handleFirmwareFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    uploading.value = 'firmware'
    try {
        const url = buildApiUrl(
            `/api/provider/upload-firmware?token=${encodeURIComponent(token.value)}&provider_uuid=${encodeURIComponent(selectedUuid.value)}&filename=${encodeURIComponent(file.name)}`
        )
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: file, // 直接流式发送，浏览器自动分段，无任何文本处理
        })
        const data = await res.json()
        if (data.type === 'success') {
            fwForm.value.download_filename = data.filename
            fwForm.value.download_display_url = `/providers/${selectedUuid.value}/${data.filename}`
            // 如果 firmware_id 或 name 为空，自动用文件名（去掉后缀）填写
            const nameWithoutExt = file.name.replace(/\.[^.]+$/, '')
            if (!fwForm.value.firmware_id.trim()) fwForm.value.firmware_id = nameWithoutExt
            if (!fwForm.value.name.trim()) fwForm.value.name = nameWithoutExt
            showToast('固件上传成功', 'success', 2500)
        } else {
            showToast(data.message || '上传失败', 'error', 3000)
        }
    } catch (err) {
        showToast(err.message || '上传出错', 'error', 3000)
    } finally {
        uploading.value = null
    }
}

function clearImage() {
    fwForm.value.image_filename = null
    fwForm.value.image_display_url = null
}

function clearFirmware() {
    fwForm.value.download_filename = null
    fwForm.value.download_display_url = null
}

function resolveDisplayUrl(url) {
    if (!url) return url
    if (url.startsWith('/providers/')) return buildApiUrl(url)
    return url
}

// ── 激活脚本 ──────────────────────────────────────────────────────────────────
const scriptContent = ref(null)
const loadingScript = ref(false)
const savingScript = ref(false)

async function loadScript() {
    if (!selectedUuid.value) return
    loadingScript.value = true
    try {
        const data = await apiPost('/api/provider/script/load', { provider_uuid: selectedUuid.value })
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
        const data = await apiPost('/api/provider/script/save', {
            provider_uuid: selectedUuid.value,
            content: scriptContent.value,
        })
        if (data.type === 'success') showToast('脚本已保存', 'success', 2500)
        else showToast(data.message || '保存失败', 'error', 3000)
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    } finally {
        savingScript.value = false
    }
}

// ── 初始化 ────────────────────────────────────────────────────────────────────
onMounted(async () => {
    await loadMyProviders()
    // 如果 URL 带有 ?id=UUID，自动选中对应提供商
    const idParam = route.query.id
    if (idParam && myProviders.value.some(p => p.uuid === idParam)) {
        selectProvider(idParam)
    }
})
</script>

<style scoped>
/* ── 无权限 ── */
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

/* ── 提供商选择 ── */
.provider-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 480px;
}

.provider-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
    border-radius: 16px;
    border: 1px solid rgba(var(--text-color-rgb), 0.1);
    background: rgba(var(--card-background-rgb), 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-color);
}

.provider-btn:hover {
    border-color: var(--theme-color);
    background: rgba(var(--theme-color-rgb), 0.06);
}

.provider-btn-name {
    font-size: 16px;
    font-weight: 700;
}

.provider-btn-arrow {
    color: var(--secondary-text-color);
    font-size: 18px;
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

/* ── 通用 ── */
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

/* ── 目录顶部栏 ── */
.catalog-topbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 16px;
}

/* ── 分组块 ── */
.group-block {
    border: 1px solid rgba(var(--text-color-rgb), 0.08);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 14px;
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 14px 16px;
    background: rgba(var(--text-color-rgb), 0.025);
    gap: 12px;
    flex-wrap: wrap;
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

.tag-empty {
    background: rgba(var(--text-color-rgb), 0.04);
    color: rgba(var(--text-color-rgb), 0.35);
}

.group-actions {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
    flex-wrap: wrap;
}

.action-btn {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(var(--theme-color-rgb), 0.3);
    background: rgba(var(--theme-color-rgb), 0.08);
    color: var(--theme-color);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.action-btn:hover {
    background: rgba(var(--theme-color-rgb), 0.18);
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

/* ── 固件列表 ── */
.firmware-list {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid rgba(var(--text-color-rgb), 0.06);
}

.fw-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(var(--text-color-rgb), 0.06);
    background: rgba(var(--text-color-rgb), 0.02);
}

.fw-thumb {
    flex-shrink: 0;
    width: 54px;
    height: 54px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(var(--text-color-rgb), 0.08);
    background: rgba(var(--text-color-rgb), 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
}

.fw-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.fw-img-placeholder {
    font-size: 22px;
}

.fw-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.fw-id {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    color: var(--theme-color);
    font-weight: 600;
}

.fw-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-color);
}

.fw-desc {
    font-size: 12px;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.fw-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 4px;
}

.fw-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
}

/* ── 上传区块 ── */
.upload-section {
    margin-top: 16px;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid rgba(var(--text-color-rgb), 0.08);
    background: rgba(var(--text-color-rgb), 0.02);
}

.upload-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.upload-btn-row {
    display: flex;
    gap: 6px;
    align-items: center;
}

.upload-btn {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid rgba(var(--theme-color-rgb), 0.3);
    background: rgba(var(--theme-color-rgb), 0.08);
    color: var(--theme-color);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
}

.upload-btn:hover:not(:disabled) {
    background: rgba(var(--theme-color-rgb), 0.18);
}

.upload-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.clear-file-btn {
    padding: 5px 9px;
    border-radius: 7px;
    border: 1px solid rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.clear-file-btn:hover {
    background: rgba(239, 68, 68, 0.18);
}

.image-preview-wrap {
    margin-top: 10px;
    max-width: 200px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(var(--text-color-rgb), 0.1);
}

.preview-img {
    width: 100%;
    display: block;
    object-fit: contain;
    max-height: 160px;
}

.file-name-hint {
    margin-top: 8px;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: var(--theme-color);
    word-break: break-all;
}

.no-file-hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--secondary-text-color);
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
    max-width: 680px;
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

/* ── 表单 ── */
.field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--secondary-text-color);
}

.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
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
    .field-grid {
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

    .group-header {
        flex-direction: column;
    }

    .fw-item {
        flex-wrap: wrap;
    }
}
</style>