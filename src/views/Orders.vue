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
                <option
                  v-for="provider in providers"
                  :key="provider.id"
                  :value="provider.id"
                >
                  {{ provider.id }}
                </option>
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">固件型号</label>
              <select v-model="selectedFirmwareId" class="select-input">
                <option
                  v-for="firmware in currentFirmwares"
                  :key="firmware.id"
                  :value="firmware.id"
                >
                  {{ firmware.id }}（{{ firmware.points }} 积分）
                </option>
              </select>
            </div>

            <div class="field-group full">
              <label class="field-label">设备 MAC</label>
              <input
                v-model="macValue"
                type="text"
                class="text-input"
                placeholder="这里不做前端校验，后端会接收你输入的原始内容"
              />
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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from '../composables/useToast.js'
import { useAuth } from '../composables/useAuth.js'
import { normalizeMessage, postJson } from '../services/api.js'

const { showToast } = useToast()
const { state: authState, handleAuthFailure, updateUser } = useAuth()

const providers = ref([])
const loadingList = ref(false)
const loadError = ref('')
const activating = ref(false)
const selectedProviderId = ref('')
const selectedFirmwareId = ref('')
const macValue = ref('')
const activationResult = ref(null)

const currentProvider = computed(() => providers.value.find((provider) => provider.id === selectedProviderId.value) || null)
const currentFirmwares = computed(() => currentProvider.value?.firmwares || [])
const currentFirmware = computed(() => currentFirmwares.value.find((firmware) => firmware.id === selectedFirmwareId.value) || null)

const activationPriceText = computed(() => {
  if (!currentFirmware.value) {
    return '请先选择固件类型'
  }

  return `本次激活预计扣除 ${currentFirmware.value.points} 积分，重复激活同设备同型号通常不重复扣分。`
})

watch(currentProvider, (provider) => {
  if (!provider) {
    selectedFirmwareId.value = ''
    return
  }

  if (!provider.firmwares.some((firmware) => firmware.id === selectedFirmwareId.value)) {
    selectedFirmwareId.value = provider.firmwares[0]?.id || ''
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
    selectedProviderId.value = providers.value[0]?.id || ''
    showToast('固件类型加载成功', 'success', 2400)
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

onMounted(() => {
  loadFirmwareList()
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

.result-code-box {
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(var(--success-color-rgb), 0.08), rgba(var(--card-background-rgb), 0.98));
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
