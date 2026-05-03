<template>
  <div class="captcha-box" :class="`state-${status}`">
    <div v-if="status === 'loading'" class="captcha-placeholder">
      <span>正在加载验证组件...</span>
    </div>
    <div ref="hostRef" class="captcha-host" />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const SCRIPT_ID = 'xfltd-hcaptcha-script'
const SCRIPT_SRC = 'https://js.hcaptcha.com/1/api.js?render=explicit'

let scriptLoader = null

function loadHCaptcha() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('当前环境不支持验证组件'))
  }

  if (window.hcaptcha) {
    return Promise.resolve(window.hcaptcha)
  }

  if (scriptLoader) {
    return scriptLoader
  }

  scriptLoader = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)
    const script = existing || document.createElement('script')
    let settled = false

    const cleanup = () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }

    const finish = (callback) => {
      if (settled) {
        return
      }

      settled = true
      cleanup()
      callback()
    }

    const handleLoad = () => {
      window.clearTimeout(timeoutId)

      finish(() => {
        if (window.hcaptcha) {
          resolve(window.hcaptcha)
          return
        }

        scriptLoader = null
        reject(new Error('验证组件加载失败，请刷新页面重试'))
      })
    }

    const handleError = () => {
      window.clearTimeout(timeoutId)

      finish(() => {
        scriptLoader = null
        reject(new Error('验证组件加载失败，请刷新页面重试'))
      })
    }

    const timeoutId = window.setTimeout(() => {
      finish(() => {
        scriptLoader = null
        reject(new Error('验证组件加载失败，请刷新页面重试'))
      })
    }, 15000)

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    if (!existing) {
      script.id = SCRIPT_ID
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    } else if (window.hcaptcha) {
      handleLoad()
    }
  })

  return scriptLoader
}

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  siteKey: {
    type: String,
    default: '417639ea-bde8-403c-8afc-fca2a3364a0c',
  },
})

const emit = defineEmits(['update:modelValue', 'error', 'ready'])

const hostRef = ref(null)
const widgetId = ref(null)
const status = ref('loading')

const placeholderText = computed(() => {
  if (status.value === 'error') {
    return '验证组件加载失败，请刷新页面重试'
  }

  return '正在加载验证组件...'
})

function reset() {
  if (widgetId.value == null || !window.hcaptcha) {
    emit('update:modelValue', '')
    return
  }

  window.hcaptcha.reset(widgetId.value)
  emit('update:modelValue', '')
}

function remove() {
  if (widgetId.value != null && window.hcaptcha) {
    window.hcaptcha.remove(widgetId.value)
  }

  widgetId.value = null
  emit('update:modelValue', '')
}

async function renderWidget() {
  status.value = 'loading'
  await nextTick()

  try {
    const hcaptcha = await loadHCaptcha()

    if (!hostRef.value || widgetId.value != null) {
      return
    }

    widgetId.value = hcaptcha.render(hostRef.value, {
      sitekey: props.siteKey,
      theme: 'light',
      size: 'normal',
      callback(token) {
        emit('update:modelValue', token || '')
      },
      'expired-callback'() {
        emit('update:modelValue', '')
      },
      'error-callback'() {
        emit('update:modelValue', '')
        status.value = 'error'
        emit('error', '验证失败，请重试')
      },
    })

    status.value = 'ready'
    emit('ready')
  } catch (error) {
    status.value = 'error'
    emit('update:modelValue', '')
    emit('error', error.message || '验证组件加载失败，请刷新页面重试')
  }
}

defineExpose({
  reset,
  remove,
})

onMounted(() => {
  renderWidget()
})

onBeforeUnmount(() => {
  remove()
})
</script>

<style scoped>
.captcha-box {
  position: relative;
  min-height: 86px;
  border-radius: 18px;
  border: 1px solid rgba(var(--text-color-rgb), 0.08);
  background: rgba(var(--text-color-rgb), 0.03);
  overflow: hidden;
}

.captcha-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  font-size: 13px;
  color: var(--secondary-text-color);
  z-index: 1;
}

.captcha-box.state-error .captcha-placeholder {
  color: var(--error-color);
}

.captcha-host {
  min-height: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-box.state-ready .captcha-placeholder {
  display: none;
}
</style>
