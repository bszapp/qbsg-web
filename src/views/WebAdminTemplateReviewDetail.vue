<template>
  <div class="page-shell">
    <div class="page-stack detail-stack">
      <div v-if="!isAdmin" class="no-permission-card">
        <div class="no-perm-icon">⛔</div>
        <h2>无访问权限</h2>
        <p>当前账号没有网站管理员权限。</p>
        <button class="primary-button" @click="router.push('/me/webadmin')">返回网站管理</button>
      </div>

      <template v-else>
        <div class="detail-topbar">
          <button class="secondary-button small-btn" @click="router.push('/me/webadmin')">返回审核列表</button>
          <button class="secondary-button small-btn" @click="loadDetail" :disabled="loading">
            {{ loading ? '刷新中...' : '刷新详情' }}
          </button>
        </div>

        <div v-if="loading && !item" class="callout-box">正在加载审核详情...</div>
        <div v-else-if="loadError" class="callout-box detail-error">{{ loadError }}</div>

        <template v-else-if="item">
          <section class="panel-card">
            <div class="section-header">
              <div>
                <div class="title-row">
                  <h1 class="section-title">{{ item.name || '未命名项目' }}</h1>
                  <span :class="['status-chip', item.status]">{{ item.status === 'published' ? '已上架' : '审核中' }}</span>
                  <span class="tag-chip">{{ item.tag || '其他' }}</span>
                </div>
                <p class="section-desc">{{ item.description || '暂无项目介绍' }}</p>
              </div>
            </div>

            <div class="detail-meta-grid">
              <div class="meta-card">
                <span class="meta-label">上传者</span>
                <strong class="meta-value">{{ item.username || '' }}</strong>
              </div>
              <div class="meta-card">
                <span class="meta-label">用户 ID</span>
                <strong class="meta-value">{{ item.uid }}</strong>
              </div>
              <div class="meta-card meta-card-wide">
                <span class="meta-label">社区 ID</span>
                <strong class="meta-value mono">{{ item.community_id }}</strong>
              </div>
              <div class="meta-card meta-card-wide">
                <span class="meta-label">项目 ID</span>
                <strong class="meta-value mono">{{ item.project_id }}</strong>
              </div>
              <div class="meta-card">
                <span class="meta-label">创建时间</span>
                <strong class="meta-value">{{ fmt(item.created_at) }}</strong>
              </div>
              <div class="meta-card">
                <span class="meta-label">更新时间</span>
                <strong class="meta-value">{{ fmt(item.updated_at) }}</strong>
              </div>
              <div class="meta-card">
                <span class="meta-label">审核时间</span>
                <strong class="meta-value">{{ fmt(item.reviewed_at) }}</strong>
              </div>
              <div class="meta-card">
                <span class="meta-label">上架时间</span>
                <strong class="meta-value">{{ fmt(item.published_at) }}</strong>
              </div>
            </div>

            <div v-if="item.status === 'published' && (item.preview_url || item.download_url)" class="public-links">
              <a v-if="item.preview_url" :href="resolvePublicUrl(item.preview_url)" target="_blank" rel="noopener noreferrer"
                class="secondary-button small-btn">打开公开浏览图</a>
              <a v-if="item.download_url" :href="resolvePublicUrl(item.download_url)" target="_blank" rel="noopener noreferrer"
                class="secondary-button small-btn">下载公开 ZIP</a>
            </div>
          </section>

          <section class="panel-card">
            <div class="section-header">
              <div>
                <h2 class="section-title">审核图</h2>
                <p class="section-desc">审核图包含浏览图、项目信息、元素清单和图片资源缩略图。</p>
              </div>
            </div>
            <div class="audit-image-wrap">
              <AdminTemplateMediaImage :token="token" :uid="item.uid" :project-id="item.project_id" kind="audit"
                fit="contain" :available="item.audit_available" :alt="`${item.name || '项目'} 审核图`" />
            </div>
          </section>

          <section class="panel-card">
            <div class="section-header">
              <div>
                <h2 class="section-title">审核操作</h2>
                <p class="section-desc">通过操作只对审核中的项目开放；拒绝操作需要填写理由，已上架项目拒绝后会下架。</p>
              </div>
            </div>

            <div class="action-row">
              <button v-if="item.status !== 'published'" class="primary-button" @click="approveItem" :disabled="submitting">
                {{ submitting && submittingAction === 'published' ? '处理中...' : '审核通过并上架' }}
              </button>
              <button class="warn-btn" @click="toggleRejectForm" :disabled="submitting">
                {{ showRejectForm ? '取消打回' : '打回项目' }}
              </button>
            </div>

            <div v-if="showRejectForm" class="reject-box">
              <label class="field-label" for="reject-reason">不通过理由</label>
              <textarea id="reject-reason" v-model="rejectReason" class="reject-textarea"
                placeholder="请输入审核不通过理由，用户会看到这段说明。" />
              <div class="reject-actions">
                <button class="warn-btn" @click="rejectItem" :disabled="submitting">
                  {{ submitting && submittingAction === 'rejected' ? '提交中...' : '确认打回' }}
                </button>
              </div>
            </div>
          </section>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '../composables/useToast.js'
import { useAuth } from '../composables/useAuth.js'
import { buildApiUrl } from '../config/app.js'
import { normalizeMessage } from '../services/api.js'
import { getAdminTemplateDetail, setAdminTemplateStatus } from '../services/adminTemplateReview.js'
import AdminTemplateMediaImage from '../components/AdminTemplateMediaImage.vue'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const { state, handleAuthFailure } = useAuth()

const token = computed(() => state.token)
const isAdmin = computed(() => state.user?.is_admin === true)
const communityId = computed(() => String(route.params.communityId || ''))

const item = ref(null)
const loading = ref(false)
const loadError = ref('')
const submitting = ref(false)
const submittingAction = ref('')
const showRejectForm = ref(false)
const rejectReason = ref('')

function fmt(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function resolvePublicUrl(path) {
  if (!path) return path
  return path.startsWith('/') ? buildApiUrl(path) : path
}

async function loadDetail() {
  if (!communityId.value) {
    loadError.value = '缺少 community_id'
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    const data = await getAdminTemplateDetail(token.value, communityId.value)
    if (data.type === 'success') {
      item.value = data.item || null
      return
    }

    if (handleAuthFailure(data)) {
      return
    }

    item.value = null
    loadError.value = normalizeMessage(data, '审核详情加载失败')
    showToast(loadError.value, 'error', 3400)
  } catch (error) {
    item.value = null
    loadError.value = error.message || '审核详情加载失败，请稍后重试'
    showToast(loadError.value, 'error', 3400)
  } finally {
    loading.value = false
  }
}

async function approveItem() {
  if (!item.value || item.value.status === 'published' || submitting.value) {
    return
  }

  if (!confirm(`确认通过并上架项目「${item.value.name || item.value.community_id}」？`)) {
    return
  }

  submitting.value = true
  submittingAction.value = 'published'

  try {
    const data = await setAdminTemplateStatus(token.value, {
      uid: item.value.uid,
      project_id: item.value.project_id,
      status: 'published',
    })

    if (data.type === 'success') {
      showToast(data.message || '已上架', 'success', 3200)
      await loadDetail()
      return
    }

    if (handleAuthFailure(data)) {
      return
    }

    showToast(normalizeMessage(data, '上架失败'), 'error', 3400)
  } catch (error) {
    showToast(error.message || '上架失败，请稍后重试', 'error', 3400)
  } finally {
    submitting.value = false
    submittingAction.value = ''
  }
}

function toggleRejectForm() {
  showRejectForm.value = !showRejectForm.value
  if (!showRejectForm.value) {
    rejectReason.value = ''
  }
}

async function rejectItem() {
  if (!item.value || submitting.value) {
    return
  }

  const reason = rejectReason.value.trim()
  if (!reason) {
    showToast('请填写审核不通过理由', 'warning', 2800)
    return
  }

  submitting.value = true
  submittingAction.value = 'rejected'

  try {
    const data = await setAdminTemplateStatus(token.value, {
      uid: item.value.uid,
      project_id: item.value.project_id,
      status: 'rejected',
      reason,
    })

    if (data.type === 'success') {
      showToast(data.message || '已打回', 'success', 3200)
      router.replace('/me/webadmin')
      return
    }

    if (handleAuthFailure(data)) {
      return
    }

    showToast(normalizeMessage(data, '打回失败'), 'error', 3400)
  } catch (error) {
    showToast(error.message || '打回失败，请稍后重试', 'error', 3400)
  } finally {
    submitting.value = false
    submittingAction.value = ''
  }
}

loadDetail()
</script>

<style scoped>
.detail-stack {
  gap: 16px;
}

.detail-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.detail-error {
  color: var(--error-color);
  border-color: rgba(var(--error-color-rgb), 0.18);
  background: rgba(var(--error-color-rgb), 0.08);
}

.no-permission-card {
  max-width: 480px;
  margin: 60px auto 0;
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

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.meta-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(var(--text-color-rgb), 0.03);
  border: 1px solid rgba(var(--text-color-rgb), 0.06);
}

.meta-card-wide {
  grid-column: span 2;
}

.meta-label {
  color: var(--secondary-text-color);
  font-size: 12px;
}

.meta-value {
  color: var(--text-color);
  font-size: 14px;
  word-break: break-all;
}

.status-chip,
.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-chip.reviewing {
  background: rgba(217, 119, 6, 0.12);
  color: #d97706;
}

.status-chip.published {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}

.tag-chip {
  background: rgba(var(--text-color-rgb), 0.06);
  color: var(--secondary-text-color);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.public-links {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.audit-image-wrap {
  min-height: 420px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(var(--text-color-rgb), 0.08);
  background: rgba(var(--text-color-rgb), 0.025);
}

.action-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.reject-box {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reject-textarea {
  min-height: 132px;
  width: 100%;
  resize: vertical;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(var(--text-color-rgb), 0.1);
  background: rgba(var(--text-color-rgb), 0.04);
  color: var(--text-color);
  font-size: 14px;
  box-sizing: border-box;
}

.reject-textarea:focus {
  outline: none;
  border-color: rgba(var(--theme-color-rgb), 0.4);
  box-shadow: 0 0 0 3px rgba(var(--theme-color-rgb), 0.12);
}

.reject-actions {
  display: flex;
  justify-content: flex-end;
}

.warn-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(217, 119, 6, 0.35);
  background: rgba(217, 119, 6, 0.08);
  color: #d97706;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.warn-btn:hover:not(:disabled) {
  background: rgba(217, 119, 6, 0.18);
}

.warn-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .detail-meta-grid {
    grid-template-columns: 1fr;
  }

  .meta-card-wide {
    grid-column: auto;
  }

  .audit-image-wrap {
    min-height: 280px;
  }
}
</style>
