<template>
  <div class="gujian-page">
    <div v-if="loadError" class="callout-box callout-box-error">{{ loadError }}</div>
    <div v-else-if="loading && !groups.length" class="callout-box">正在加载固件列表...</div>

    <template v-else>
      <template v-if="filteredGroups.length">
        <section v-for="(group, gi) in filteredGroups" :key="gi" class="panel-card">
          <div class="section-header">
            <div>
              <div class="group-label-row">
                <span class="provider-badge">{{ group.provider }}</span>
                <h2 class="section-title">{{ group.label }}</h2>
              </div>
              <p class="section-desc">{{ group.firmwares.length }} 个固件版本</p>
            </div>
            <button v-if="group.activation_id" type="button" class="primary-button activate-group-btn"
              @click="goActivate(group)">
              获取激活码
            </button>
          </div>

          <div class="fw-grid">
            <div v-for="fw in group.firmwares" :key="fw.firmware_id" class="fw-card">
              <div class="fw-thumb">
                <img v-if="fw.image_url" :src="fw.image_url" :alt="fw.name" />
                <div v-else class="fw-thumb-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="9" y="9" width="6" height="6" />
                    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
                  </svg>
                </div>
              </div>

              <div class="fw-body">
                <span :class="['size-badge', sizeClass(fw.screen_size)]">{{ fw.screen_size }}</span>
                <p class="fw-name">{{ fw.name }}</p>
                <p class="fw-desc">{{ fw.description }}</p>
                <code class="fw-id-code">{{ fw.firmware_id }}</code>
              </div>

              <div class="fw-foot">
                <a v-if="fw.download_url" :href="fw.download_url" target="_blank" rel="noopener noreferrer"
                  class="dl-btn">下载固件</a>
                <span v-else class="no-dl">未提供下载</span>
              </div>
            </div>
          </div>
        </section>
      </template>

      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <p>未找到匹配的固件</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postJson } from '../services/api.js'
import { useToast } from '../composables/useToast.js'
import { useGujianFilter } from '../composables/useGujianFilter.js'

const { showToast } = useToast()
const router = useRouter()

const { groups, filteredGroups, sizeClass } = useGujianFilter()

const loading = ref(false)
const loadError = ref('')

onMounted(loadCatalog)

async function loadCatalog() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await postJson('/api/firmware/catalog', {})
    if (data.type === 'success') {
      groups.value = Array.isArray(data.groups) ? data.groups : []
    } else {
      loadError.value = data.message || '固件列表加载失败'
      showToast(loadError.value, 'error', 3400)
    }
  } catch (err) {
    loadError.value = err.message || '固件列表加载失败，请稍后重试'
    showToast(loadError.value, 'error', 3400)
  } finally {
    loading.value = false
  }
}

function goActivate(group) {
  router.push({
    path: '/activation',
    query: { provider: group.provider, activation_id: group.activation_id },
  })
}
</script>

<style scoped>
.gujian-page {
  width: min(1040px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-label-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.provider-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(var(--theme-color-rgb), 0.1);
  color: var(--theme-color);
  white-space: nowrap;
}

.activate-group-btn {
  white-space: nowrap;
  flex-shrink: 0;
}

.fw-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 4px;
}

.fw-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(var(--text-color-rgb), 0.07);
  background: rgba(var(--text-color-rgb), 0.02);
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.fw-card:hover {
  border-color: rgba(var(--theme-color-rgb), 0.28);
  box-shadow: 0 8px 20px rgba(var(--theme-color-rgb), 0.08);
}

.fw-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(var(--text-color-rgb), 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fw-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fw-thumb-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(var(--text-color-rgb), 0.18);
}

.fw-thumb-icon svg {
  width: 36px;
  height: 36px;
}

.fw-body {
  flex: 1;
  padding: 12px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fw-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.4;
}

.fw-desc {
  margin: 0;
  font-size: 12px;
  color: var(--secondary-text-color);
  line-height: 1.5;
}

.fw-id-code {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: rgba(var(--text-color-rgb), 0.35);
  word-break: break-all;
}

.size-badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  align-self: flex-start;
}

.size-213h {
  background: rgba(0, 112, 240, 0.12);
  color: #0070f0;
}

.size-213 {
  background: rgba(var(--text-color-rgb), 0.08);
  color: var(--secondary-text-color);
}

.size-29 {
  background: rgba(0, 160, 80, 0.12);
  color: #00a050;
}

.size-42 {
  background: rgba(150, 50, 200, 0.12);
  color: #9632c8;
}

.fw-foot {
  padding: 8px 12px 12px;
}

.dl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 7px 0;
  border-radius: 9px;
  background: rgba(var(--theme-color-rgb), 0.1);
  color: var(--theme-color);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.dl-btn:hover {
  background: rgba(var(--theme-color-rgb), 0.18);
}

.no-dl {
  display: block;
  text-align: center;
  font-size: 12px;
  color: rgba(var(--text-color-rgb), 0.28);
  padding: 6px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 24px;
  text-align: center;
  color: rgba(var(--text-color-rgb), 0.3);
  font-size: 14px;
}

.empty-state svg {
  width: 40px;
  height: 40px;
}

.callout-box-error {
  color: var(--error-color);
  border-color: rgba(var(--error-color-rgb), 0.18);
  background: rgba(var(--error-color-rgb), 0.08);
}

@media (max-width: 768px) {
  .fw-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>