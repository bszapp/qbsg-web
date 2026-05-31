<template>
  <div class="loginonly-page">
    <div class="loginonly-card">
      <AuthPanel :mode="mode" :login-action="submitLogin" :register-action="submitRegister"
        @switch-mode="toggleMode" />
    </div>

    <ToastNotification />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AuthPanel from '../components/AuthPanel.vue'
import ToastNotification from '../components/ToastNotification.vue'
import { normalizeMessage, postJson } from '../services/api.js'
import { useToast } from '../composables/useToast.js'

const { showToast } = useToast()

const mode = ref('login')

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
}

function finishWithToken(token) {
  const finalToken = String(token ?? '')
  window.setTimeout(() => {
    console.log(`__LOGIN_SUCCESS_${finalToken}__`)
    document.body.textContent = finalToken
  }, 0)
}

async function submitLogin(payload) {
  const data = await postJson('/api/user/login', payload)

  if (data.type !== 'success') {
    showToast(normalizeMessage(data, '登录失败，请检查用户名和密码'), 'error', 3400)
    return false
  }

  if (!data.token) {
    showToast('登录成功，但返回中缺少 token', 'error', 3400)
    return false
  }

  finishWithToken(data.token)
  return true
}

async function submitRegister(payload) {
  const data = await postJson('/api/user/register', payload)

  if (data.type !== 'success') {
    showToast(normalizeMessage(data, '注册失败，请稍后重试'), 'error', 3400)
    return false
  }

  if (!data.token) {
    showToast('注册成功，但返回中缺少 token', 'error', 3400)
    return false
  }

  finishWithToken(data.token)
  return true
}
</script>

<style scoped>
.loginonly-page {
  min-height: 100vh;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, rgba(var(--theme-color-rgb), 0.1), transparent 32%),
    radial-gradient(circle at bottom right, rgba(var(--theme-color-rgb), 0.08), transparent 28%),
    linear-gradient(180deg, rgba(var(--card-background-rgb), 0.92), rgba(var(--card-background-rgb), 0.98));
}

.loginonly-card {
  width: 100%;
  max-width: 500px;
}

@media (max-width: 768px) {
  .loginonly-page {
    padding: 16px;
  }

  .loginonly-card {
    max-width: 100%;
  }
}
</style>
