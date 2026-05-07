<template>
  <div class="page-shell">
    <div class="page-stack">
      <section class="hero-card">
        <span class="page-eyebrow">激活码</span>
        <div class="page-title-row">
          <div>
            <h1 class="page-title">固件激活</h1>
            <p class="page-subtitle">
              选择固件类型并提交设备信息后，页面会展示后端返回的激活码。MAC 输入不做前端校验，全部交给后端处理。
            </p>
          </div>

          <div class="hero-actions">
            <button type="button" class="secondary-button" @click="loadFirmwareList" :disabled="loadingList">
              {{ loadingList ? '刷新中...' : '刷新类型' }}
            </button>
          </div>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-header">
          <div>
            <h2 class="section-title">申请激活码</h2>
            <p class="section-desc">激活成功后会在下方展示激活码，同时以 toast 提示消耗积分。</p>
          </div>
        </div>

        <div v-if="loadingList" class="callout-box">
          正在加载固件列表...
        </div>

        <div v-else-if="loadError" class="callout-box error">
          {{ loadError }}
        </div>

        <template v-else>
          <div class="field-grid">
            <div class="field-group">
              <label class="field-label">固件提供商</label>
              <select v-model="selectedProviderId" class="select-input">
                <option value="" disabled>-- 请选择 --</option>
                <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                  {{ provider.name }}
                </option>
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">固件型号</label>
              <select v-model="selectedFirmwareId" class="select-input">
                <option value="" disabled>-- 请选择 --</option>
                <option v-for="firmware in currentFirmwares" :key="firmware.id" :value="firmware.id">
                  {{ firmware.id }}
                </option>
              </select>
            </div>

            <div class="field-group full">
              <label class="field-label">设备 MAC</label>
              <input v-model="macValue" type="text" class="text-input" placeholder="这里不做前端校验，后端会接收你输入的原始内容" />
            </div>
          </div>

          <div class="callout-box activation-tip">
            {{ activationPriceText }}
          </div>

          <div class="button-row">
            <button type="button" class="primary-button" @click="submitActivation" :disabled="activating">
              {{ activating ? '请求中...' : '获取激活码' }}
            </button>
          </div>
        </template>
      </section>

      <section v-if="activationResult" class="panel-card result-card">
        <div class="section-header">
          <div>
            <h2 class="section-title">激活结果</h2>
            <p class="section-desc">下面展示本次请求返回的激活码。</p>
          </div>
        </div>

        <div class="result-code-box">
          <span class="result-label">激活码</span>
          <strong class="result-code">{{ activationResult.code }}</strong>
        </div>

        <div class="badge-row">
          <span class="soft-badge">{{ activationResult.tip }}</span>
          <span class="soft-badge">剩余积分：{{ activationResult.points }}</span>
        </div>
      </section>
      <!-- 历史激活记录 -->
      <section class="panel-card">
        <div class="section-header">
          <div>
            <h2 class="section-title">历史激活记录</h2>
            <p class="section-desc">共 {{ historyTotal }} 条，每页最多 100 条</p>
          </div>
          <button type="button" class="secondary-button" @click="loadHistory()" :disabled="historyLoading">
            {{ historyLoading ? '加载中...' : '刷新' }}
          </button>
        </div>

        <div v-if="historyLoading" class="callout-box">正在加载历史记录...</div>
        <div v-else-if="!historyRecords.length" class="callout-box">暂无激活记录</div>
        <template v-else>
          <div class="history-table-wrap">
            <table class="history-table">
              <thead>
                <tr>
                  <th>设备 MAC</th>
                  <th>固件型号</th>
                  <th>激活码</th>
                  <th>激活时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in historyRecords" :key="i">
                  <td><code>{{ r.mac }}</code></td>
                  <td><span class="fw-id-badge">{{ r.firmware_id }}</span></td>
                  <td><code class="code-cell">{{ r.code }}</code></td>
                  <td class="date-cell">{{ new Date(r.created_at).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="historyTotalPages > 1" class="pagination-row">
            <button class="page-btn" @click="changePage(historyPage - 1)" :disabled="historyPage <= 1">上一页</button>
            <span class="page-info">第 {{ historyPage }} / {{ historyTotalPages }} 页</span>
            <button class="page-btn" @click="changePage(historyPage + 1)"
              :disabled="historyPage >= historyTotalPages">下一页</button>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '../composables/useToast.js'
import { useAuth } from '../composables/useAuth.js'
import { normalizeMessage, postJson } from '../services/api.js'

const { showToast } = useToast()
const { state: authState, handleAuthFailure, updateUser } = useAuth()
const route = useRoute()

const providers = ref([])
const loadingList = ref(false)
const loadError = ref('')
const activating = ref(false)
const selectedProviderId = ref('')
const selectedFirmwareId = ref('')
const macValue = ref('')
const activationResult = ref(null)
const checkResult = ref(null)
const checkLoading = ref(false)
const historyRecords = ref([])
const historyTotal = ref(0)
const historyTotalPages = ref(1)
const historyPage = ref(1)
const historyLoading = ref(false)

const currentProvider = computed(() => providers.value.find((provider) => provider.id === selectedProviderId.value) || null)
const currentFirmwares = computed(() => currentProvider.value?.firmwares || [])
const currentFirmware = computed(() => currentFirmwares.value.find((firmware) => firmware.id === selectedFirmwareId.value) || null)

const activationPriceText = computed(() => {
  if (!currentFirmware.value) return '请先选择固件类型'
  if (!macValue.value.trim()) return `请输入设备 MAC 地址，本固件消耗 ${currentFirmware.value.points} 积分`
  if (checkLoading.value) return '正在查询激活记录...'
  if (checkResult.value) {
    if (checkResult.value.exists) return '该设备已有激活记录，本次不消耗积分'
    return `该设备无激活记录，本次将消耗 ${checkResult.value.points ?? currentFirmware.value.points} 积分`
  }
  return `本次激活预计扣除 ${currentFirmware.value.points} 积分`
})

let checkTimer = null

function triggerCheck() {
  checkResult.value = null
  clearTimeout(checkTimer)
  if (!selectedProviderId.value || !selectedFirmwareId.value || !macValue.value.trim()) return
  checkTimer = setTimeout(doCheck, 600)
}

async function doCheck() {
  checkLoading.value = true
  try {
    const data = await postJson('/api/activation/check', {
      token: authState.token,
      provider_id: selectedProviderId.value,
      firmware_id: selectedFirmwareId.value,
      mac: macValue.value.trim(),
    })
    if (data.type === 'success') checkResult.value = data
  } catch { }
  finally { checkLoading.value = false }
}

watch(macValue, triggerCheck)
watch([selectedProviderId, selectedFirmwareId], triggerCheck)

watch(currentProvider, (provider) => {
  if (!provider) {
    selectedFirmwareId.value = ''
    return
  }

  if (!provider.firmwares.some((firmware) => firmware.id === selectedFirmwareId.value)) {
    selectedFirmwareId.value = ''
  }
})

async function loadFirmwareList() {
  loadingList.value = true
  loadError.value = ''

  try {
    const data = await postJson('/api/activation/firmware-list', {})

    if (data.type !== 'success') {
      loadError.value = normalizeMessage(data, '固件列表加载失败')
      showToast(loadError.value, 'error', 3400)
      return
    }

    providers.value = Array.isArray(data.providers) ? data.providers : []
    selectedProviderId.value = ''
    // 如果是从固件页跳过来的，自动填入参数
    const providerParam = route.query.provider
    const activationIdParam = route.query.activation_id
    if (providerParam) {
      const foundProvider = providers.value.find((p) => p.name === String(providerParam))
      if (foundProvider) selectedProviderId.value = foundProvider.id
    }
    if (activationIdParam) selectedFirmwareId.value = String(activationIdParam)
  } catch (error) {
    loadError.value = error.message || '固件列表加载失败，请稍后重试'
    showToast(loadError.value, 'error', 3400)
  } finally {
    loadingList.value = false
  }
}

async function submitActivation() {
  if (!selectedProviderId.value || !selectedFirmwareId.value) {
    showToast('请先选择固件类型', 'warning', 2800)
    return
  }

  activating.value = true
  activationResult.value = null

  try {
    const data = await postJson('/api/activation/activate', {
      token: authState.token,
      provider_id: selectedProviderId.value,
      firmware_id: selectedFirmwareId.value,
      mac: macValue.value.trim(),
    })

    if (data.type === 'success') {
      const pointsText = data.free
        ? '重复激活未扣积分'
        : `消耗 ${currentFirmware.value?.points ?? '-'} 积分`

      activationResult.value = {
        code: data.code,
        points: typeof data.points !== 'undefined' ? data.points : (authState.user?.points ?? '-'),
        tip: data.free ? '重复激活，未扣积分' : `激活成功，已扣除 ${currentFirmware.value?.points ?? '-'} 积分`,
      }

      if (typeof data.points !== 'undefined') {
        updateUser({ points: data.points })
      }

      showToast(`激活成功，${pointsText}`, 'success', 3600)
      return
    }

    if (handleAuthFailure(data)) {
      return
    }

    showToast(normalizeMessage(data, '激活失败，请稍后重试'), 'error', 3400)
  } catch (error) {
    showToast(error.message || '激活失败，请稍后重试', 'error', 3400)
  } finally {
    activating.value = false
  }
}

async function loadHistory(page) {
  historyLoading.value = true
  try {
    const data = await postJson('/api/activation/records', {
      token: authState.token,
      page: page ?? historyPage.value,
    })
    if (data.type === 'success') {
      historyRecords.value = Array.isArray(data.records) ? data.records : []
      historyTotal.value = data.total ?? 0
      historyTotalPages.value = data.totalPages ?? 1
      historyPage.value = data.page ?? 1
    }
  } catch { }
  finally { historyLoading.value = false }
}

function changePage(p) {
  if (p < 1 || p > historyTotalPages.value) return
  loadHistory(p)
}

onMounted(() => {
  loadFirmwareList()
  loadHistory(1)
})
</script>

<style scoped>
.activation-tip {
  margin: 18px 0;
}

.callout-box.error {
  color: var(--error-color);
  border-color: rgba(var(--error-color-rgb), 0.18);
  background: rgba(var(--error-color-rgb), 0.08);
}

.result-card {
  gap: 16px;
}

.history-table-wrap {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.history-table th {
  padding: 10px 14px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary-text-color);
  background: rgba(var(--text-color-rgb), 0.03);
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.history-table td {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(var(--text-color-rgb), 0.05);
  color: var(--text-color);
  vertical-align: middle;
}

.history-table tbody tr:last-child td {
  border-bottom: none;
}

.history-table tbody tr:hover td {
  background: rgba(var(--theme-color-rgb), 0.03);
}

.history-table code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  background: rgba(var(--text-color-rgb), 0.05);
  padding: 2px 6px;
  border-radius: 5px;
}

.code-cell {
  display: block;
  white-space: nowrap;
}

.fw-id-badge {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--secondary-text-color);
}

.date-cell {
  white-space: nowrap;
  color: var(--secondary-text-color);
  font-size: 12px;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 14px 0 4px;
}

.page-btn {
  padding: 6px 18px;
  border-radius: 9px;
  border: 1px solid var(--border-color);
  background: rgba(var(--text-color-rgb), 0.03);
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--theme-color);
  color: var(--theme-color);
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--secondary-text-color);
}

.result-code-box {
  padding: 20px;
  border-radius: 22px;
  border: 1px solid rgba(var(--success-color-rgb), 0.2);
}

.result-label {
  display: block;
  font-size: 13px;
  color: var(--secondary-text-color);
}

.result-code {
  display: block;
  margin-top: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: clamp(22px, 3vw, 30px);
  color: var(--success-color);
  word-break: break-all;
}
</style>
