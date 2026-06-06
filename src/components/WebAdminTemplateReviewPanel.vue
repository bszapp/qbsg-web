<template>
  <div class="review-panel">
    <div class="panel-card review-intro-card">
      <div class="section-header">
        <div>
          <h2 class="section-title">社区审核</h2>
          <p class="section-desc">审核中项目可进入详情页查看审核图并执行通过或打回；已上架项目也支持查看详情并执行打回。</p>
        </div>
        <button class="secondary-button small-btn" @click="loadItems" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新列表' }}
        </button>
      </div>
      <div class="review-summary-row">
        <span class="summary-pill">审核中 {{ reviewingItems.length }}</span>
        <span class="summary-pill">已上架 {{ publishedItems.length }}</span>
      </div>
    </div>

    <div v-if="loading && !items.length" class="callout-box">正在加载审核列表...</div>
    <div v-else-if="loadError" class="callout-box review-error">{{ loadError }}</div>

    <template v-else>
      <section class="review-section">
        <div class="review-section-head">
          <h3 class="review-section-title">审核中</h3>
          <span class="review-section-meta">{{ reviewingItems.length }} 个项目</span>
        </div>
        <div v-if="!reviewingItems.length" class="state-text">暂无审核中的项目</div>
        <div v-else class="review-grid">
          <article v-for="item in reviewingItems" :key="item.community_id" class="review-card">
            <div class="review-card-preview">
              <AdminTemplateMediaImage :token="token" :uid="item.uid" :project-id="item.project_id" kind="preview"
                :available="item.preview_available" :alt="item.name || '项目浏览图'" />
            </div>
            <div class="review-card-body">
              <div class="review-card-badges">
                <span class="status-chip reviewing">审核中</span>
                <span class="tag-chip">{{ item.tag || '其他' }}</span>
              </div>
              <h4 class="review-card-title">{{ item.name || '未命名项目' }}</h4>
              <p class="review-card-desc">{{ item.description || '暂无项目介绍' }}</p>
              <dl class="review-meta-list">
                <div>
                  <dt>上传者</dt>
                  <dd>{{ item.username || '' }}</dd>
                </div>
                <div>
                  <dt>社区 ID</dt>
                  <dd class="mono">{{ item.community_id }}</dd>
                </div>
                <div>
                  <dt>项目 ID</dt>
                  <dd class="mono">{{ item.project_id }}</dd>
                </div>
                <div>
                  <dt>更新时间</dt>
                  <dd>{{ fmt(item.updated_at) }}</dd>
                </div>
              </dl>
            </div>
            <div class="review-card-footer">
              <RouterLink class="primary-button small-btn" :to="detailPath(item.community_id)">查看详情</RouterLink>
            </div>
          </article>
        </div>
      </section>

      <section class="review-section">
        <div class="review-section-head">
          <h3 class="review-section-title">已上架</h3>
          <span class="review-section-meta">{{ publishedItems.length }} 个项目</span>
        </div>
        <div v-if="!publishedItems.length" class="state-text">暂无已上架项目</div>
        <div v-else class="review-grid">
          <article v-for="item in publishedItems" :key="item.community_id" class="review-card">
            <div class="review-card-preview">
              <AdminTemplateMediaImage :token="token" :uid="item.uid" :project-id="item.project_id" kind="preview"
                :available="item.preview_available" :alt="item.name || '项目浏览图'" />
            </div>
            <div class="review-card-body">
              <div class="review-card-badges">
                <span class="status-chip published">已上架</span>
                <span class="tag-chip">{{ item.tag || '其他' }}</span>
              </div>
              <h4 class="review-card-title">{{ item.name || '未命名项目' }}</h4>
              <p class="review-card-desc">{{ item.description || '暂无项目介绍' }}</p>
              <dl class="review-meta-list">
                <div>
                  <dt>上传者</dt>
                  <dd>{{ item.username || '' }}</dd>
                </div>
                <div>
                  <dt>社区 ID</dt>
                  <dd class="mono">{{ item.community_id }}</dd>
                </div>
                <div>
                  <dt>项目 ID</dt>
                  <dd class="mono">{{ item.project_id }}</dd>
                </div>
                <div>
                  <dt>上架时间</dt>
                  <dd>{{ fmt(item.published_at) }}</dd>
                </div>
              </dl>
            </div>
            <div class="review-card-footer">
              <RouterLink class="secondary-button small-btn" :to="detailPath(item.community_id)">查看详情</RouterLink>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from '../composables/useToast.js'
import { normalizeMessage } from '../services/api.js'
import { listAdminTemplates } from '../services/adminTemplateReview.js'
import AdminTemplateMediaImage from './AdminTemplateMediaImage.vue'

const props = defineProps({
  token: {
    type: String,
    default: '',
  },
})

const { showToast } = useToast()

const items = ref([])
const loading = ref(false)
const loadError = ref('')

const reviewingItems = computed(() => items.value.filter((item) => item.status === 'reviewing'))
const publishedItems = computed(() => items.value.filter((item) => item.status === 'published'))

function fmt(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function detailPath(communityId) {
  return `/me/webadmin/review/${encodeURIComponent(communityId)}`
}

async function loadItems() {
  loading.value = true
  loadError.value = ''

  try {
    const data = await listAdminTemplates(props.token)
    if (data.type === 'success') {
      items.value = Array.isArray(data.items) ? data.items : []
      return
    }

    loadError.value = normalizeMessage(data, '审核列表加载失败')
    showToast(loadError.value, 'error', 3400)
  } catch (error) {
    loadError.value = error.message || '审核列表加载失败，请稍后重试'
    showToast(loadError.value, 'error', 3400)
  } finally {
    loading.value = false
  }
}

onMounted(loadItems)
</script>

<style scoped>
.review-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-intro-card {
  gap: 14px;
}

.review-summary-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(var(--theme-color-rgb), 0.08);
  color: var(--theme-color);
  font-size: 12px;
  font-weight: 700;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.review-section-title {
  margin: 0;
  font-size: 18px;
  color: var(--text-color);
}

.review-section-meta {
  color: var(--secondary-text-color);
  font-size: 13px;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.review-card {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(var(--text-color-rgb), 0.08);
  background: rgba(var(--card-background-rgb), 0.7);
}

.review-card-preview {
  aspect-ratio: 16 / 9;
  background: rgba(var(--text-color-rgb), 0.04);
}

.review-card-body {
  padding: 14px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
}

.review-card-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.review-card-title {
  margin: 0;
  font-size: 16px;
  color: var(--text-color);
}

.review-card-desc {
  margin: 0;
  color: var(--secondary-text-color);
  font-size: 13px;
  line-height: 1.65;
}

.review-meta-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin: 0;
}

.review-meta-list div {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 8px;
}

.review-meta-list dt {
  color: var(--secondary-text-color);
  font-size: 12px;
}

.review-meta-list dd {
  margin: 0;
  color: var(--text-color);
  font-size: 12px;
  word-break: break-all;
}

.review-card-footer {
  padding: 0 14px 14px;
  display: flex;
  justify-content: flex-end;
}

.review-error {
  color: var(--error-color);
  border-color: rgba(var(--error-color-rgb), 0.18);
  background: rgba(var(--error-color-rgb), 0.08);
}

@media (max-width: 768px) {
  .review-grid {
    grid-template-columns: 1fr;
  }
}
</style>
