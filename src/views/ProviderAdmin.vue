<template>
    <div class="page-shell">

        <!-- 初始加载 -->
        <div v-if="pageLoading || (!selectedUuid && myProviders.length)" class="admin-loading" role="status"><span class="admin-loading-spinner" />正在加载提供商权限…</div>

        <!-- 无提供商权限 -->
        <div v-else-if="myProviders.length === 0" class="no-permission-card">
            <div class="no-perm-icon" aria-hidden="true"><i class="fa-solid fa-lock"></i></div>
            <h2>您不是管理员</h2>
            <p>当前账号未绑定任何提供商权限，无法访问此页面。</p>
            <button class="primary-button" @click="$router.push('/')">返回主页</button>
        </div>

        <!-- 主界面 -->
        <div v-else-if="selectedUuid" class="page-stack provider-admin-stack">
            <nav class="admin-path" aria-label="当前位置">
                <RouterLink to="/me">我的</RouterLink><span>/</span>
                <span>提供商管理</span><span>/</span>
                <strong>{{ selectedProviderName }}</strong><span>/</span>
                <strong>{{ tabs.find(tab => tab.key === activeTab)?.label }}</strong>
            </nav>
            <section class="hero-card provider-header">
                <div>
                    <span class="page-eyebrow">提供商管理</span>
                    <h1 class="page-title">{{ selectedProviderName }}</h1>
                    <p class="page-subtitle">管理当前提供商的固件目录与激活脚本</p>
                </div>
                <label v-if="myProviders.length > 1" class="provider-picker">
                    <span>切换提供商</span>
                    <select :value="selectedUuid" @change="switchProvider($event.target.value)" aria-label="切换提供商">
                        <option v-for="provider in myProviders" :key="provider.uuid" :value="provider.uuid">{{ provider.name }}</option>
                    </select>
                </label>
            </section>

            <nav class="provider-nav" aria-label="提供商管理页面">
                <RouterLink v-for="tab in tabs" :key="tab.key"
                    :to="providerPath(selectedUuid, tab.key)"
                    :class="['provider-nav-link', { active: activeTab === tab.key }]"
                    :aria-current="activeTab === tab.key ? 'page' : undefined">
                    <i :class="tab.icon" aria-hidden="true"></i>{{ tab.label }}
                </RouterLink>
            </nav>

            <!-- ── 固件目录 ── -->
            <div v-if="activeTab === 'catalog'">
                <div class="catalog-topbar">
                    <div class="catalog-topbar-info">
                        <h2 class="section-title">
                            <i class="fa-solid fa-boxes-stacked" aria-hidden="true"></i>固件目录
                        </h2>
                        <p class="section-desc">共 {{ groups.length }} 个分组 · {{ totalFirmwareCount }} 个固件，点击分组头上的按钮进行管理。</p>
                    </div>
                    <button class="primary-button small-btn" @click="openAddGroupModal">
                        <i class="fa-solid fa-plus" aria-hidden="true"></i>创建新分组
                    </button>
                </div>

                <div v-if="loadingCatalog" class="admin-loading" role="status"><span class="admin-loading-spinner" />正在加载固件目录…</div>

                <div v-else-if="groups.length === 0" class="catalog-empty">
                    <div class="catalog-empty-icon" aria-hidden="true"><i class="fa-solid fa-folder-open"></i></div>
                    <p class="catalog-empty-title">还没有任何固件分组</p>
                    <p class="catalog-empty-desc">分组用于归类固件并配置激活定价，先创建一个吧。</p>
                    <button class="primary-button small-btn" @click="openAddGroupModal">
                        <i class="fa-solid fa-plus" aria-hidden="true"></i>创建第一个分组
                    </button>
                </div>

                <div v-else class="group-stack">
                    <section v-for="(group, gi) in groups" :key="group.id ?? ('new-' + gi)" class="group-block" :data-gi="gi">
                        <!-- 分组头 -->
                        <header class="group-header">
                            <div class="group-identity">
                                <span class="group-avatar" aria-hidden="true">{{ groupInitial(gi) }}</span>
                                <div class="group-meta">
                                    <div class="group-title-row">
                                        <strong class="group-label">{{ group.label }}</strong>
                                        <span class="tag tag-count">
                                            <i class="fa-solid fa-microchip" aria-hidden="true"></i>{{ group.firmwares.length }} 个固件
                                        </span>
                                    </div>
                                    <div class="group-tags">
                                        <span class="tag tag-id"><i class="fa-solid fa-key" aria-hidden="true"></i>激活编号 {{ group.activation_id || '未设置' }}</span>
                                        <span class="tag tag-pts"><i class="fa-solid fa-coins" aria-hidden="true"></i>{{ group.points }} 积分</span>
                                        <span class="tag tag-sort"><i class="fa-solid fa-arrow-down-short-wide" aria-hidden="true"></i>排序 {{ group.sort_order }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="group-actions">
                                <button class="action-btn" @click="openAddFirmwareModal(gi)">
                                    <i class="fa-solid fa-plus" aria-hidden="true"></i>新增固件
                                </button>
                                <button class="icon-btn" @click="openGroupSettingsModal(gi)" title="分组设置" aria-label="分组设置">
                                    <i class="fa-solid fa-sliders" aria-hidden="true"></i>
                                </button>
                                <button class="icon-btn danger" @click="deleteGroup(gi)" title="删除分组" aria-label="删除分组">
                                    <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                                </button>
                            </div>
                        </header>

                        <!-- 固件列表 -->
                        <div class="firmware-list">
                            <div v-if="group.firmwares.length === 0 && !slotEnd(gi)" class="fw-list-empty">
                                <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
                                此分组暂无固件，点击右上角「新增固件」或从其他分组拖入固件
                            </div>
                            <template v-for="(fw, fi) in group.firmwares" :key="fw.firmware_id + '-' + fi">
                                <div v-if="slotBefore(gi, fi)" class="fw-drop-slot" :data-gi="gi" :data-ins="fi" aria-hidden="true">
                                    <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>放置到此处
                                </div>
                                <div class="fw-item"
                                    :class="{ 'fw-item-drag-src': drag && drag.sgi === gi && drag.sfi === fi, 'fw-item-flash': flashFwId === fw.firmware_id && !drag }"
                                    :data-gi="gi" :data-fi="fi">
                                    <button class="drag-handle" type="button"
                                        title="按住拖动，调整固件顺序（可跨分组）"
                                        aria-label="按住拖动，调整固件顺序"
                                        @pointerdown="onHandleDown($event, gi, fi)"
                                        @contextmenu.prevent>
                                        <i class="fa-solid fa-grip-vertical" aria-hidden="true"></i>
                                    </button>
                                    <div class="fw-thumb">
                                        <img v-if="fw.image_display_url" :src="resolveDisplayUrl(fw.image_display_url)"
                                            class="fw-img" :alt="fw.name || fw.firmware_id" />
                                        <div v-else class="fw-img-placeholder" aria-hidden="true"><i class="fa-solid fa-microchip"></i></div>
                                    </div>
                                    <div class="fw-info">
                                        <div class="fw-title-row">
                                            <span class="fw-name">{{ fw.name || '（未命名）' }}</span>
                                            <span class="fw-id mono">{{ fw.firmware_id }}</span>
                                        </div>
                                        <div v-if="fw.description" class="fw-desc">{{ fw.description }}</div>
                                        <div class="fw-tags">
                                            <span v-if="fw.screen_size" class="tag tag-sort">
                                                <i class="fa-solid fa-mobile-screen-button" aria-hidden="true"></i>{{ fw.screen_size }}
                                            </span>
                                            <span class="tag" :class="fw.image_filename ? 'tag-ok' : 'tag-empty'">
                                                <i class="fa-solid" :class="fw.image_filename ? 'fa-circle-check' : 'fa-circle-xmark'" aria-hidden="true"></i>封面{{ fw.image_filename ? '已上传' : '未上传' }}
                                            </span>
                                            <span class="tag" :class="fw.download_filename ? 'tag-ok' : 'tag-empty'">
                                                <i class="fa-solid" :class="fw.download_filename ? 'fa-circle-check' : 'fa-circle-xmark'" aria-hidden="true"></i>固件{{ fw.download_filename ? '已上传' : '未上传' }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="fw-actions">
                                        <button class="icon-btn" @click="openEditFirmwareModal(gi, fi)" title="编辑" aria-label="编辑固件">
                                            <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                                        </button>
                                        <button class="icon-btn danger" @click="deleteFirmware(gi, fi)" title="删除" aria-label="删除固件">
                                            <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>
                            </template>
                            <div v-if="slotEnd(gi)" class="fw-drop-slot" :data-gi="gi"
                                :data-ins="group.firmwares.length" aria-hidden="true">
                                <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>放置到此处
                            </div>
                        </div>
                    </section>
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
                    <div v-if="loadingScript" class="admin-loading" role="status"><span class="admin-loading-spinner" />正在加载激活脚本…</div>
                    <div v-else>
                        <div class="script-editor-shell">
                            <Codemirror v-model="scriptContent" placeholder="在这里编写 Node.js ESM 激活脚本"
                                :style="scriptEditorStyle" :autofocus="true" :indent-with-tab="true" :tab-size="2"
                                :extensions="scriptEditorExtensions" />
                        </div>
                        <div class="button-row script-actions">
                            <button class="secondary-button" @click="formatScript"
                                :disabled="formattingScript || savingScript">
                                {{ formattingScript ? '美化中…' : '美化代码' }}
                            </button>
                            <button class="primary-button" @click="saveScript" :disabled="savingScript">
                                {{ savingScript ? '保存中…' : '保存脚本' }}
                            </button>
                        </div>
                    </div>

                    <div class="script-doc-panel">
                        <div class="section-header script-doc-header">
                            <div>
                                <h3 class="script-doc-title">说明文档</h3>
                                <p class="section-desc">读取网站 <code class="inline-code">/provider.md</code> 内容。</p>
                            </div>
                            <div class="doc-toolbar">
                                <button class="secondary-button small-btn" @click="copyProviderMarkdown"
                                    :disabled="!providerDocContent || loadingProviderDoc">
                                    复制为 Markdown
                                </button>
                            </div>
                        </div>
                        <div v-if="loadingProviderDoc" class="admin-loading" role="status"><span class="admin-loading-spinner" />正在加载说明文档…</div>
                        <div v-else-if="providerDocError" class="state-text error">{{ providerDocError }}</div>
                        <MdPreview v-else editor-id="provider-doc-preview" :model-value="providerDocContent"
                            preview-theme="github" class="provider-doc-preview" />
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
                            <h2 class="modal-title">
                                <i class="fa-solid" :class="editingGroupIdx === null ? 'fa-folder-plus' : 'fa-sliders'" aria-hidden="true"></i>
                                {{ editingGroupIdx === null ? '创建新分组' : '分组设置' }}
                            </h2>
                            <button class="popup-close-btn" @click="closeGroupModal" aria-label="关闭">
                                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                            </button>
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
                                <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i>{{ saving ? '保存中…' : '确认保存' }}
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
                            <h2 class="modal-title">
                                <i class="fa-solid" :class="editingFirmwareIdx === null ? 'fa-file-circle-plus' : 'fa-file-pen'" aria-hidden="true"></i>
                                {{ editingFirmwareIdx === null ? '新增固件' : '编辑固件' }}
                            </h2>
                            <button class="popup-close-btn" @click="closeFirmwareModal" aria-label="关闭">
                                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                            </button>
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
                                    <span class="field-label"><i class="fa-regular fa-image" aria-hidden="true"></i>封面图</span>
                                    <div class="upload-btn-row">
                                        <button type="button" class="upload-btn" :disabled="!!uploading"
                                            @click="triggerImageUpload">
                                            <i class="fa-solid fa-image" aria-hidden="true"></i>{{ uploading === 'image' ? '上传中…' : '选择图片' }}
                                        </button>
                                        <button v-if="fwForm.image_filename" type="button" class="clear-file-btn"
                                            @click="clearImage">
                                            <i class="fa-solid fa-xmark" aria-hidden="true"></i>清除
                                        </button>
                                    </div>
                                </div>
                                <div v-if="fwForm.image_display_url" class="image-preview-wrap">
                                    <img :src="resolveDisplayUrl(fwForm.image_display_url)" class="preview-img" :alt="fwForm.name || '封面图'" />
                                </div>
                                <div v-else class="no-file-hint">
                                    <i class="fa-regular fa-circle-question" aria-hidden="true"></i>未上传封面图
                                </div>
                            </div>

                            <!-- 固件文件上传 -->
                            <div class="upload-section">
                                <div class="upload-section-header">
                                    <span class="field-label"><i class="fa-solid fa-file-zipper" aria-hidden="true"></i>固件文件</span>
                                    <div class="upload-btn-row">
                                        <button type="button" class="upload-btn" :disabled="!!uploading"
                                            @click="triggerFirmwareUpload">
                                            <i class="fa-solid fa-file-arrow-up" aria-hidden="true"></i>{{ uploading === 'firmware' ? '上传中…' : '选择固件' }}
                                        </button>
                                        <button v-if="fwForm.download_filename" type="button" class="clear-file-btn"
                                            @click="clearFirmware">
                                            <i class="fa-solid fa-xmark" aria-hidden="true"></i>清除
                                        </button>
                                    </div>
                                </div>
                                <div v-if="fwForm.download_filename" class="file-name-hint">
                                    <i class="fa-solid fa-file" aria-hidden="true"></i>{{ fwForm.download_filename }}
                                </div>
                                <div v-else class="no-file-hint">
                                    <i class="fa-regular fa-circle-question" aria-hidden="true"></i>未上传固件文件
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="secondary-button" @click="closeFirmwareModal">取消</button>
                            <button class="primary-button" @click="saveFirmwareModal" :disabled="saving || !!uploading">
                                <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i>{{ saving ? '保存中…' : '确认保存' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- ── 拖拽幽灵卡片（跟随指针，紧凑轻量） ── -->
        <Teleport to="body">
            <div v-if="drag" class="fw-ghost-card" :style="ghostStyle">
                <div class="fw-thumb">
                    <img v-if="drag.fw.image_display_url" :src="resolveDisplayUrl(drag.fw.image_display_url)"
                        class="fw-img" alt="" />
                    <div v-else class="fw-img-placeholder" aria-hidden="true"><i class="fa-solid fa-microchip"></i></div>
                </div>
                <div class="fw-info">
                    <div class="fw-title-row">
                        <span class="fw-name">{{ drag.fw.name || '（未命名）' }}</span>
                        <span class="fw-id mono">{{ drag.fw.firmware_id }}</span>
                    </div>
                </div>
            </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { MdPreview } from 'md-editor-v3'
import * as prettier from 'prettier/standalone'
import * as babelParser from 'prettier/plugins/babel'
import * as estreePlugin from 'prettier/plugins/estree'
import { useAuth } from '../composables/useAuth.js'
import { useToast } from '../composables/useToast.js'
import { APP_BASE_PATH, buildApiUrl } from '../config/app.js'
import 'md-editor-v3/lib/style.css'

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
        } else {
            showToast(data.message || '获取提供商列表失败', 'error', 3000)
        }
    } catch (e) {
        showToast(e.message || '网络错误', 'error', 3000)
    } finally {
        pageLoading.value = false
    }
}

async function resetAndSelectProvider(uuid, tab = 'catalog') {
    groups.value = []
    scriptContent.value = null
    activeTab.value = 'catalog'
    selectedUuid.value = uuid
    await loadCatalog()
    if (tab === 'script') await applyTab('script')
}

async function syncProviderRoute() {
    if (!myProviders.value.length) return
    const requestedId = route.params.id || route.query.id
    const requestedTab = route.params.tab || route.query.tab
    const nextId = myProviders.value.some(p => p.uuid === requestedId) ? requestedId : myProviders.value[0].uuid
    const nextTab = requestedTab === 'script' ? 'script' : 'catalog'
    const nextPath = providerPath(nextId, nextTab)
    if (route.path !== nextPath || Object.keys(route.query).length) {
        await router.replace(nextPath)
        return
    }
    if (selectedUuid.value !== nextId) await resetAndSelectProvider(nextId, nextTab)
    else if (activeTab.value !== nextTab) await applyTab(nextTab)
}

watch(() => [route.params.id, route.params.tab, route.query.id, route.query.tab], syncProviderRoute)

// ── 标签页 ────────────────────────────────────────────────────────────────────
const tabs = [
    { key: 'catalog', label: '固件目录', icon: 'fa-solid fa-boxes-stacked' },
    { key: 'script', label: '激活脚本', icon: 'fa-solid fa-code' },
]
const activeTab = ref('catalog')

function providerPath(uuid, tab = 'catalog') {
    return `/me/provideradmin/${encodeURIComponent(uuid)}/${tab}/`
}

async function applyTab(key) {
    activeTab.value = key
    if (key === 'script') {
        if (scriptContent.value === null) await loadScript()
        if (!providerDocLoaded.value && !loadingProviderDoc.value) await loadProviderDoc()
    }
}

function switchProvider(uuid) {
    if (uuid === selectedUuid.value) return
    router.push(providerPath(uuid, activeTab.value))
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

const totalFirmwareCount = computed(() =>
    groups.value.reduce((sum, g) => sum + (g.firmwares?.length ?? 0), 0)
)

/** 分组头像用的序号（1/2/3…），循环取 A-Z 备用 */
function groupInitial(index) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return letters[index % letters.length]
}

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

// ── 拖拽排序（支持跨分组） ────────────────────────────────────────────────────
// drag = 拖拽会话状态；tIns 采用“原数组下标”语义：插到原下标 fi 之前（或 len 表示追加）
const drag = ref(null)
const flashFwId = ref(null)
let flashTimer = 0
const autoScrollState = { speed: 0, x: 0, y: 0 }
let autoScrollTimer = 0

const ghostStyle = computed(() => {
    const d = drag.value
    if (!d) return {}
    return {
        width: `${Math.min(d.w, 340)}px`,
        transform: `translate3d(${d.x - d.dx}px, ${d.y - d.dy}px, 0)`,
    }
})

function slotBefore(gi, fi) {
    const d = drag.value
    return !!d && d.tgi === gi && d.tIns === fi
}

function slotEnd(gi) {
    const d = drag.value
    return !!d && d.tgi === gi && d.tIns === (groups.value[gi]?.firmwares.length ?? 0)
}

function onHandleDown(e, gi, fi) {
    if (drag.value || e.button !== 0) return
    const itemEl = e.currentTarget.closest('.fw-item')
    if (!itemEl) return
    const rect = itemEl.getBoundingClientRect()
    const fw = groups.value[gi]?.firmwares[fi]
    if (!fw) return
    const isTouch = e.pointerType === 'touch'
    drag.value = {
        pointerId: e.pointerId,
        fw: { ...fw },
        sgi: gi, sfi: fi,
        x: e.clientX, y: e.clientY,
        dx: e.clientX - rect.left,
        dy: e.clientY - rect.top - (isTouch ? 58 : 0), // 触屏时卡片上提，避免被手指挡住
        w: rect.width, h: rect.height,
        tgi: gi, tIns: fi,
    }
    autoScrollState.x = e.clientX
    autoScrollState.y = e.clientY
    // 拖拽期间关闭全局 smooth 滚动：否则每帧 scrollBy 的平滑动画不断被重启，
    // 实际滚速会被压缩成龟速，且永远达不到反比公式要求的高速
    document.documentElement.style.scrollBehavior = 'auto'
    document.body.style.userSelect = 'none'
    document.documentElement.style.cursor = 'grabbing'
    window.addEventListener('pointermove', onDragMove)
    window.addEventListener('pointerup', onDragEnd)
    window.addEventListener('pointercancel', onDragCancel)
    window.addEventListener('lostpointercapture', onLostCapture)
    window.addEventListener('keydown', onDragKeydown)
    window.addEventListener('scroll', onDragScroll, { passive: true })
    // 捕获指针：移出浏览器窗口后 move/up 事件仍会送达，避免拖拽会话悬挂
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* 部分指针类型捕获失败时由 window 监听兜底 */ }
    e.preventDefault()
}

function onDragMove(e) {
    const d = drag.value
    if (!d || e.pointerId !== d.pointerId) return
    e.preventDefault()
    d.x = e.clientX
    d.y = e.clientY
    autoScrollState.x = e.clientX
    autoScrollState.y = e.clientY
    updateDropTarget(e.clientX, e.clientY)
    updateAutoScroll(e.clientX, e.clientY)
}

/** 判断指针落点对应的插入位置（跨分组通用） */
function updateDropTarget(x, y) {
    const d = drag.value
    if (!d) return
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return
    const el = document.elementFromPoint(x, y)
    const groupEl = el ? el.closest('.group-block') : null
    if (!groupEl || groupEl.dataset.gi === undefined) return
    const gi = Number(groupEl.dataset.gi)
    const group = groups.value[gi]
    if (!group) return
    let tIns
    const slotEl = el.closest('.fw-drop-slot')
    const itemEl = el.closest('.fw-item')
    if (slotEl && slotEl.dataset.gi !== undefined && Number(slotEl.dataset.gi) === gi) {
        tIns = Number(slotEl.dataset.ins)
    } else if (itemEl && itemEl.parentElement.classList.contains('firmware-list') && itemEl.dataset.fi !== undefined) {
        const fi = Number(itemEl.dataset.fi)
        const r = itemEl.getBoundingClientRect()
        tIns = fi + ((y - r.top) > r.height / 2 ? 1 : 0)
    } else {
        // 悬停在分组其它区域（如分组头）→ 追加到该分组末尾
        tIns = group.firmwares.length
    }
    tIns = Math.max(0, Math.min(tIns, group.firmwares.length))
    if (d.tgi !== gi || d.tIns !== tIns) {
        d.tgi = gi
        d.tIns = tIns
    }
}

function updateAutoScroll(x, y) {
    const edge = 170
    // 钳制到窗口范围内：指针捕获后事件在窗口外仍会派发，
    // 原始 y 可能为负或超过视口高，直接代入会算出方向颠倒的速度
    const cy = Math.min(Math.max(y, 0), window.innerHeight)
    let speed = 0
    // 严格反比：速度 = 560 / 距边缘距离
    // 刚进入判定区域（~170px）时仅 ≈3px/帧 缓慢漂移，
    // 距离减半速度翻倍，在边缘处可达每帧上百像素，趋近无限快
    if (cy < edge) speed = -(560 / (cy + 4))
    else if (cy > window.innerHeight - edge) speed = 560 / (window.innerHeight - cy + 4)
    autoScrollState.speed = speed
    if (speed && !autoScrollTimer) {
        autoScrollTimer = setInterval(onAutoScrollTick, 8)
    } else if (!speed && autoScrollTimer) {
        clearInterval(autoScrollTimer)
        autoScrollTimer = 0
    }
}

function onAutoScrollTick() {
    if (!drag.value || !autoScrollState.speed) return
    window.scrollBy(0, autoScrollState.speed)
    updateDropTarget(autoScrollState.x, autoScrollState.y)
}

function onDragScroll() {
    if (!drag.value) return
    updateDropTarget(autoScrollState.x, autoScrollState.y)
}

function onDragEnd(e) {
    const d = drag.value
    if (!d || (e && e.pointerId !== undefined && e.pointerId !== d.pointerId)) return
    cleanupDrag()
    commitDrag(d)
}

function onDragCancel() {
    if (!drag.value) return
    cleanupDrag()
}

function onDragKeydown(e) {
    if (e.key === 'Escape' && drag.value) {
        e.preventDefault()
        cleanupDrag()
        showToast('已取消拖拽', 'info', 1600)
    }
}

/** 指针捕获意外丢失（如手柄被重渲染移除）时按取消处理，防止会话悬挂 */
function onLostCapture(e) {
    if (drag.value && e.pointerId === drag.value.pointerId) cleanupDrag()
}

function cleanupDrag() {
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', onDragEnd)
    window.removeEventListener('pointercancel', onDragCancel)
    window.removeEventListener('lostpointercapture', onLostCapture)
    window.removeEventListener('keydown', onDragKeydown)
    window.removeEventListener('scroll', onDragScroll)
    if (autoScrollTimer) {
        clearInterval(autoScrollTimer)
        autoScrollTimer = 0
    }
    autoScrollState.speed = 0
    document.documentElement.style.scrollBehavior = ''
    document.body.style.userSelect = ''
    document.documentElement.style.cursor = ''
    document.querySelectorAll('.drag-handle').forEach(el => el.blur())
    drag.value = null
}

/** 落点生效：先移除原条目，再插入目标位置；仅位置变化时保存 */
function commitDrag(d) {
    const srcGroup = groups.value[d.sgi]
    const srcFw = srcGroup?.firmwares[d.sfi]
    // 数据被并发操作（如重新加载）改变时放弃提交
    if (!srcFw || srcFw.firmware_id !== d.fw.firmware_id) return
    const moved = groups.value[d.sgi].firmwares.splice(d.sfi, 1)[0]
    let ins = d.tIns
    if (d.tgi === d.sgi && d.tIns > d.sfi) ins -= 1
    groups.value[d.tgi].firmwares.splice(ins, 0, moved)
    const movedPos = d.tgi === d.sgi && ins === d.sfi
    if (movedPos) return // 回到原位，无需保存
    flashFwId.value = moved.firmware_id
    clearTimeout(flashTimer)
    flashTimer = setTimeout(() => { flashFwId.value = null }, 1200)
    const msg = d.tgi !== d.sgi
        ? `固件「${moved.name || moved.firmware_id}」已移动到「${groups.value[d.tgi].label}」`
        : '固件顺序已更新'
    saveReorder(msg)
}

async function saveReorder(msg) {
    const success = await saveAll()
    if (success) showToast(msg, 'success', 2400)
    else await loadCatalog() // 回滚
}

onUnmounted(() => {
    if (drag.value) cleanupDrag()
    clearTimeout(flashTimer)
})

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
const formattingScript = ref(false)
const scriptEditorExtensions = [javascript(), oneDark]
const scriptEditorStyle = { height: '520px' }
const providerDocContent = ref('')
const loadingProviderDoc = ref(false)
const providerDocLoaded = ref(false)
const providerDocError = ref('')

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

async function formatScript() {
    formattingScript.value = true
    try {
        scriptContent.value = await prettier.format(scriptContent.value || '', {
            parser: 'babel',
            plugins: [babelParser, estreePlugin],
            printWidth: 100,
        })
        showToast('代码已美化', 'success', 2000)
    } catch (e) {
        showToast(e.message ? `格式化失败：${e.message}` : '格式化失败', 'error', 3000)
    } finally {
        formattingScript.value = false
    }
}

function buildPublicAssetUrl(path) {
    const base = APP_BASE_PATH.endsWith('/') ? APP_BASE_PATH.slice(0, -1) : APP_BASE_PATH
    const nextPath = path.startsWith('/') ? path : `/${path}`
    return `${base}${nextPath}` || nextPath
}

async function loadProviderDoc() {
    loadingProviderDoc.value = true
    providerDocError.value = ''
    try {
        const res = await fetch(buildPublicAssetUrl('/provider.md'), { cache: 'no-cache' })
        if (!res.ok) throw new Error(`说明文档加载失败（${res.status}）`)
        providerDocContent.value = await res.text()
        providerDocLoaded.value = true
    } catch (e) {
        providerDocError.value = e.message || '说明文档加载失败'
        showToast(providerDocError.value, 'error', 3000)
    } finally {
        loadingProviderDoc.value = false
    }
}

async function copyProviderMarkdown() {
    if (!providerDocContent.value) return
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(providerDocContent.value)
        } else {
            copyTextByTextarea(providerDocContent.value)
        }
        showToast('Markdown 已复制', 'success', 2000)
    } catch (e) {
        showToast(e.message || '复制失败', 'error', 3000)
    }
}

function copyTextByTextarea(text) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (!copied) throw new Error('复制失败')
}

// ── 初始化 ────────────────────────────────────────────────────────────────────
onMounted(async () => {
    await loadMyProviders()
    await syncProviderRoute()
})
</script>

<style scoped>
.provider-admin-stack { width: min(1120px, 100%); }

.admin-path {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    color: var(--secondary-text-color);
    font-size: 13px;
}

.admin-path a { color: var(--theme-color); text-decoration: none; }
.admin-path a:hover { text-decoration: underline; }
.admin-path strong { color: var(--text-color); font-weight: 600; }

.provider-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
}

.provider-header .page-title { margin-top: 12px; }

.provider-picker { display: flex; flex-direction: column; gap: 7px; min-width: 210px; }
.provider-picker span { color: var(--secondary-text-color); font-size: 12px; font-weight: 600; }
.provider-picker select {
    min-height: 42px;
    padding: 0 36px 0 12px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: rgba(var(--card-background-rgb), .9);
    color: var(--text-color);
    font: inherit;
    cursor: pointer;
}
.provider-picker select:focus-visible { outline: 2px solid var(--theme-color); outline-offset: 2px; }

.admin-loading {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid rgba(var(--theme-color-rgb), 0.16);
    border-radius: 14px;
    background: rgba(var(--theme-color-rgb), 0.08);
    color: var(--theme-color);
    font-size: 13px;
    font-weight: 600;
}

.admin-loading-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(var(--theme-color-rgb), 0.2);
    border-top-color: var(--theme-color);
    border-radius: 50%;
    animation: admin-spin .75s linear infinite;
}

@keyframes admin-spin { to { transform: rotate(360deg); } }

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
    width: 74px;
    height: 74px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(var(--warning-color-rgb), 0.12);
    color: var(--warning-color);
    font-size: 30px;
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

/* ── 页面导航 ── */
.provider-nav {
    display: flex;
    gap: 6px;
    padding: 5px;
    border: 1px solid var(--border-color);
    border-radius: 13px;
    background: rgba(var(--card-background-rgb), .7);
}

.provider-nav-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-width: 130px;
    padding: 11px 18px;
    border-radius: 9px;
    color: var(--secondary-text-color);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    transition: background .18s ease, color .18s ease;
}

.provider-nav-link i { font-size: 14px; }

.provider-nav-link.active {
    background: rgba(var(--theme-color-rgb), .13);
    color: var(--theme-color);
    font-weight: 700;
}

.provider-nav-link:hover, .provider-nav-link:focus-visible {
    background: rgba(var(--theme-color-rgb), .09);
    color: var(--theme-color);
    outline: none;
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

.catalog-topbar-info { min-width: 0; }

.catalog-topbar .section-title {
    display: inline-flex;
    align-items: center;
    gap: 9px;
}

.catalog-topbar .section-title i { color: var(--theme-color); font-size: 16px; }

/* ── 空状态 ── */
.catalog-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 52px 20px;
    border: 1px dashed rgba(var(--text-color-rgb), 0.16);
    border-radius: 18px;
    background: rgba(var(--text-color-rgb), 0.02);
    text-align: center;
}

.catalog-empty-icon {
    width: 62px;
    height: 62px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    background: rgba(var(--theme-color-rgb), 0.1);
    color: var(--theme-color);
    font-size: 26px;
    margin-bottom: 8px;
}

.catalog-empty-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--text-color);
}

.catalog-empty-desc {
    margin: 0 0 14px;
    font-size: 13px;
    color: var(--secondary-text-color);
}

/* ── 分组块 ── */
.group-stack { display: flex; flex-direction: column; gap: 14px; }

.group-block {
    border: 1px solid rgba(var(--text-color-rgb), 0.08);
    border-radius: 16px;
    overflow: hidden;
    background: rgba(var(--card-background-rgb), 0.55);
    transition: box-shadow .2s ease, border-color .2s ease;
}

.group-block:hover {
    border-color: rgba(var(--theme-color-rgb), 0.28);
    box-shadow: 0 8px 24px rgba(12, 24, 48, 0.07);
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: linear-gradient(90deg, rgba(var(--theme-color-rgb), 0.075), rgba(var(--theme-color-rgb), 0.02) 55%, transparent);
    border-bottom: 1px solid rgba(var(--text-color-rgb), 0.06);
    gap: 12px;
    flex-wrap: wrap;
}

.group-identity {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
}

.group-avatar {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(var(--theme-color-rgb), 0.85), rgba(var(--theme-color-rgb), 0.62));
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: .02em;
    box-shadow: 0 4px 10px rgba(var(--theme-color-rgb), 0.22);
}

.group-meta {
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
    min-width: 0;
}

.group-title-row {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
}

.group-label {
    font-size: 16px;
    color: var(--text-color);
    font-weight: 700;
}

.tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 9px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}

.tag i { font-size: 10px; opacity: .85; }

.tag-count { background: rgba(var(--text-color-rgb), 0.07); color: var(--secondary-text-color); }

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

.tag-ok {
    background: rgba(34, 197, 94, 0.12);
    color: #15803d;
}

.tag-empty {
    background: rgba(var(--text-color-rgb), 0.04);
    color: rgba(var(--text-color-rgb), 0.35);
}

body.dark-theme .tag-pts,
body.dark-theme .tag-ok { color: #4ade80; }

.group-actions {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
    flex-wrap: wrap;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    border-radius: 9px;
    border: 1px solid rgba(var(--theme-color-rgb), 0.3);
    background: rgba(var(--theme-color-rgb), 0.08);
    color: var(--theme-color);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.action-btn i { font-size: 11px; }

.action-btn:hover {
    background: rgba(var(--theme-color-rgb), 0.18);
    transform: translateY(-1px);
}

.icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(var(--text-color-rgb), 0.1);
    background: rgba(var(--text-color-rgb), 0.04);
    color: var(--secondary-text-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    transition: all 0.2s ease;
}

.icon-btn:hover {
    background: rgba(var(--theme-color-rgb), 0.12);
    border-color: rgba(var(--theme-color-rgb), 0.3);
    color: var(--theme-color);
}

.icon-btn.danger:hover {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.35);
    color: #ef4444;
}

.icon-btn:disabled { opacity: .45; cursor: not-allowed; }

/* ── 固件列表 ── */
.firmware-list {
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.fw-list-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 18px 16px;
    border: 1px dashed rgba(var(--text-color-rgb), 0.14);
    border-radius: 10px;
    color: var(--secondary-text-color);
    font-size: 13px;
}

.fw-list-empty i { color: rgba(var(--text-color-rgb), 0.3); font-size: 14px; }

.fw-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(var(--text-color-rgb), 0.06);
    background: rgba(var(--text-color-rgb), 0.02);
    transition: border-color .18s ease, background .18s ease;
}

.fw-item:hover {
    border-color: rgba(var(--theme-color-rgb), 0.26);
    background: rgba(var(--theme-color-rgb), 0.035);
}

.fw-thumb {
    flex-shrink: 0;
    width: 54px;
    height: 54px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(var(--text-color-rgb), 0.08);
    background: rgba(var(--theme-color-rgb), 0.07);
    color: rgba(var(--theme-color-rgb), 0.55);
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.fw-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.fw-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.fw-title-row {
    display: flex;
    align-items: baseline;
    gap: 9px;
    flex-wrap: wrap;
    min-width: 0;
}

.fw-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-color);
}

.fw-id {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    color: var(--theme-color);
    font-weight: 600;
    word-break: break-all;
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

/* ── 拖拽排序 ── */
.drag-handle {
    flex-shrink: 0;
    align-self: stretch;
    width: 20px;
    margin: -10px 0 -10px -7px;
    padding: 0 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: rgba(var(--text-color-rgb), 0.22);
    cursor: grab;
    touch-action: none;
    -webkit-touch-callout: none;
    user-select: none;
    border-radius: 8px;
    transition: color .18s ease, background .18s ease, transform .18s ease;
}

.drag-handle i {
    font-size: 12px;
    pointer-events: none;
}

.drag-handle:hover,
.drag-handle:focus-visible {
    color: var(--theme-color);
    background: rgba(var(--theme-color-rgb), 0.1);
    outline: none;
    transform: scale(1.08);
}

.drag-handle:active {
    cursor: grabbing;
    color: var(--theme-color);
    transform: scale(0.94);
}

.fw-item:hover .drag-handle { color: rgba(var(--text-color-rgb), 0.4); }
.fw-item:hover .drag-handle:hover { color: var(--theme-color); }

/* 拖拽中的原始位置条目：隐藏，让位给虚线占位框 */
.fw-item-drag-src { display: none; }

/* 蓝色虚线预放置框 */
.fw-drop-slot {
    min-height: 62px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 1.6px dashed rgba(var(--theme-color-rgb), 0.6);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(var(--theme-color-rgb), 0.1), rgba(var(--theme-color-rgb), 0.045));
    color: rgba(var(--theme-color-rgb), 0.78);
    font-size: 12px;
    font-weight: 700;
    animation: dropSlotIn .16s ease;
    transform-origin: center top;
}

.fw-drop-slot i {
    font-size: 11px;
    animation: slotBob 1.15s ease-in-out infinite;
}

@keyframes dropSlotIn {
    from { opacity: 0; transform: scaleY(.82); }
    to { opacity: 1; transform: scaleY(1); }
}

@keyframes slotBob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(2.5px); }
}

/* 跟随指针的幽灵卡片（紧凑样式，无任何形变/动画特效） */
.fw-ghost-card {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1500;
    pointer-events: none;
    user-select: none;
    will-change: transform;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border: 1px solid rgba(var(--theme-color-rgb), 0.4);
    border-radius: 11px;
    background: rgba(var(--card-background-rgb), 0.98);
    box-shadow: 0 10px 26px rgba(12, 24, 48, 0.22);
}

.fw-ghost-card .fw-thumb {
    width: 38px;
    height: 38px;
    border-radius: 9px;
    font-size: 15px;
}

.fw-ghost-card .fw-name {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.fw-ghost-card .fw-id {
    font-size: 10px;
}

/* 落点闪光反馈 */
.fw-item-flash {
    animation: fwLand 1.1s ease;
    border-color: rgba(var(--theme-color-rgb), 0.45) !important;
    background: rgba(var(--theme-color-rgb), 0.09) !important;
    box-shadow: 0 6px 18px rgba(var(--theme-color-rgb), 0.14);
}

@keyframes fwLand {
    0% { background: rgba(var(--theme-color-rgb), 0.22); }
    60% { background: rgba(var(--theme-color-rgb), 0.14); }
    100% { background: rgba(var(--theme-color-rgb), 0.09); }
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

.upload-section-header .field-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.upload-section-header .field-label i { color: var(--theme-color); font-size: 12px; }

.upload-btn-row {
    display: flex;
    gap: 6px;
    align-items: center;
}

.upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
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

.upload-btn i { font-size: 11px; }

.upload-btn:hover:not(:disabled) {
    background: rgba(var(--theme-color-rgb), 0.18);
}

.upload-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.clear-file-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
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

.clear-file-btn i { font-size: 9px; }

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
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: var(--theme-color);
    word-break: break-all;
}

.file-name-hint i,
.no-file-hint i { flex-shrink: 0; color: var(--secondary-text-color); font-size: 12px; }

.file-name-hint i { color: var(--theme-color); }

.no-file-hint {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: var(--secondary-text-color);
}

/* ── 代码编辑器 ── */
.script-editor-shell {
    margin-top: 12px;
    border-radius: 12px;
    border: 1px solid rgba(var(--text-color-rgb), 0.12);
    overflow: hidden;
    background: #282c34;
}

.script-editor-shell:focus-within {
    border-color: rgba(var(--theme-color-rgb), 0.45);
}

.script-editor-shell :deep(.cm-editor) {
    min-height: 520px;
    font-size: 13px;
}

.script-editor-shell :deep(.cm-scroller) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    line-height: 1.65;
}

.script-editor-shell :deep(.cm-content) {
    min-height: 520px;
}

.script-actions {
    justify-content: flex-end;
    margin-top: 12px;
}

.script-doc-panel {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid rgba(var(--text-color-rgb), 0.08);
}

.script-doc-header {
    align-items: flex-start;
}

.script-doc-title {
    margin: 0;
    font-size: 16px;
    color: var(--text-color);
}

.doc-toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.provider-doc-preview {
    padding: 16px 18px;
    border-radius: 12px;
    border: 1px solid rgba(var(--text-color-rgb), 0.1);
    overflow: hidden;
    background: rgba(var(--text-color-rgb), 0.02);
}

.provider-doc-preview :deep(.md-editor-preview) {
    padding: 0;
    color: var(--text-color);
    background: transparent;
}

.state-text.error {
    color: #ef4444;
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
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 18px;
    color: var(--text-color);
    font-weight: 700;
}

.modal-title i {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    background: rgba(var(--theme-color-rgb), 0.1);
    color: var(--theme-color);
    font-size: 13px;
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

.popup-close-btn i {
    font-size: 13px;
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
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
    .provider-header { align-items: stretch; flex-direction: column; }
    .provider-picker { min-width: 0; }
    .provider-nav-link { flex: 1; min-width: 0; }
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
        align-items: stretch;
    }

    .group-actions { justify-content: flex-end; }

    .fw-thumb { width: 48px; height: 48px; }

    .fw-item {
        flex-wrap: wrap;
    }

    .catalog-empty { padding: 40px 16px; }
}
</style>
