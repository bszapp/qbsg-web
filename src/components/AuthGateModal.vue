<template>
  <Teleport to="body">
    <Transition name="auth-popup-fade">
      <div
        v-if="show"
        class="auth-popup-overlay"
        @click.self="emitClose"
      >
        <Transition name="auth-popup-slide" appear>
          <div v-if="show" class="auth-popup-container">
            <div class="auth-popup-header">
              <div class="auth-popup-tabs">
                <button
                  type="button"
                  class="auth-popup-tab"
                  :class="{ active: mode === 'login' }"
                  @click="emit('switch-mode', 'login')"
                >
                  登录
                </button>
                <button
                  type="button"
                  class="auth-popup-tab"
                  :class="{ active: mode === 'register' }"
                  @click="emit('switch-mode', 'register')"
                >
                  注册
                </button>
              </div>

              <button class="popup-close-btn" type="button" @click="emitClose">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="auth-popup-content">
              <div class="auth-header">
                <span class="auth-badge">{{ mode === 'login' ? '欢迎回来' : '准备开始' }}</span>
                <h1 class="auth-title">{{ mode === 'login' ? '登录到签变时光' : '注册签变时光账户' }}</h1>
                <p class="auth-subtitle">
                  {{ mode === 'login' ? '登录后即可访问激活码、充值和个人设置。' : '注册完成后即可进入个人中心并使用充值与激活功能。' }}
                </p>
              </div>

              <form v-if="mode === 'login'" class="auth-form" @submit.prevent="submitLogin">
                <div class="form-group">
                  <label>用户名</label>
                  <div class="input-shell">
                    <input
                      v-model="loginForm.username"
                      type="text"
                      class="form-control"
                      placeholder="请输入用户名"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>密码</label>
                  <div class="input-shell password-shell">
                    <input
                      v-model="loginForm.password"
                      :type="showLoginPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="请输入密码"
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      @click="showLoginPassword = !showLoginPassword"
                    >
                      <svg v-if="showLoginPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-0.41 1.17-1.05 2.27-1.9 3.23" />
                        <path d="M6.61 6.61C4.62 8 3.16 9.87 2 12c1.73 4.89 6 8 10 8 1.73 0 3.39-.49 4.82-1.33" />
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <CaptchaWidget
                  ref="loginCaptchaRef"
                  v-model="loginCaptchaToken"
                  @error="handleCaptchaError"
                />

                <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
                  <span>{{ submitting ? '登录中...' : '登录' }}</span>
                </button>
              </form>

              <form v-else class="auth-form" @submit.prevent="submitRegister">
                <div class="form-group">
                  <label>用户名</label>
                  <div class="input-shell">
                    <input
                      v-model="registerForm.username"
                      type="text"
                      class="form-control"
                      placeholder="3-16 字符"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>密码</label>
                  <div class="input-shell password-shell">
                    <input
                      v-model="registerForm.password"
                      :type="showRegisterPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="6-16 字符，至少两种字符类型"
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      @click="showRegisterPassword = !showRegisterPassword"
                    >
                      <svg v-if="showRegisterPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-0.41 1.17-1.05 2.27-1.9 3.23" />
                        <path d="M6.61 6.61C4.62 8 3.16 9.87 2 12c1.73 4.89 6 8 10 8 1.73 0 3.39-.49 4.82-1.33" />
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <CaptchaWidget
                  ref="registerCaptchaRef"
                  v-model="registerCaptchaToken"
                  @error="handleCaptchaError"
                />

                <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
                  <span>{{ submitting ? '注册中...' : '注册并登录' }}</span>
                </button>
              </form>

              <div class="auth-footer">
                <p class="auth-footer-text">
                  {{ mode === 'login' ? '还没有账户？' : '已经注册过了？' }}
                </p>

                <button
                  type="button"
                  class="btn btn-secondary btn-block"
                  @click="toggleMode"
                >
                  {{ mode === 'login' ? '去注册' : '返回登录' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, ref, toRefs } from 'vue'
import { useToast } from '../composables/useToast.js'
import { useAuth } from '../composables/useAuth.js'
import CaptchaWidget from './CaptchaWidget.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'login',
  },
})

const { show, mode } = toRefs(props)
const emit = defineEmits(['close', 'switch-mode'])

const { showToast } = useToast()
const { login, register } = useAuth()

const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const submitting = ref(false)
const loginCaptchaRef = ref(null)
const registerCaptchaRef = ref(null)
const loginCaptchaToken = ref('')
const registerCaptchaToken = ref('')

const loginForm = reactive({
  username: '',
  password: '',
})

const registerForm = reactive({
  username: '',
  password: '',
})

function emitClose() {
  emit('close')
}

function toggleMode() {
  emit('switch-mode', mode.value === 'login' ? 'register' : 'login')
}

function handleCaptchaError() {
  showToast('验证组件加载失败，请刷新页面重试', 'error', 3200)
}

function ensureLoginForm() {
  if (!loginForm.username.trim()) {
    showToast('请输入用户名', 'warning', 2800)
    return false
  }

  if (!loginForm.password) {
    showToast('请输入密码', 'warning', 2800)
    return false
  }

  if (!loginCaptchaToken.value) {
    showToast('请先完成人机验证', 'warning', 2800)
    return false
  }

  return true
}

function ensureRegisterForm() {
  if (!registerForm.username.trim()) {
    showToast('请输入用户名', 'warning', 2800)
    return false
  }

  if (!registerForm.password) {
    showToast('请输入密码', 'warning', 2800)
    return false
  }

  if (!registerCaptchaToken.value) {
    showToast('请先完成人机验证', 'warning', 2800)
    return false
  }

  return true
}

async function submitLogin() {
  if (submitting.value || !ensureLoginForm()) {
    return
  }

  submitting.value = true

  const ok = await login({
    username: loginForm.username.trim(),
    password: loginForm.password,
    cf_token: loginCaptchaToken.value,
  })

  loginCaptchaRef.value?.reset()
  loginCaptchaToken.value = ''
  submitting.value = false

  if (ok) {
    emitClose()
  }
}

async function submitRegister() {
  if (submitting.value || !ensureRegisterForm()) {
    return
  }

  submitting.value = true

  const ok = await register({
    username: registerForm.username.trim(),
    password: registerForm.password,
    cf_token: registerCaptchaToken.value,
  })

  registerCaptchaRef.value?.reset()
  registerCaptchaToken.value = ''
  submitting.value = false

  if (ok) {
    emitClose()
  }
}
</script>

<style scoped>
.auth-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  backdrop-filter: blur(4px);
}

.auth-popup-container {
  width: 100%;
  max-width: 520px;
  background-color: rgba(var(--card-background-rgb), 1);
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(10, 25, 48, 0.24);
  border: 1px solid rgba(var(--theme-color-rgb), 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  animation: modal-in-03fee79b 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-popup-header {
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(var(--theme-color-rgb), 0.08), rgba(var(--card-background-rgb), 1));
}

.auth-popup-tabs {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(var(--text-color-rgb), 0.04);
}

.auth-popup-tab {
  min-width: 86px;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary-text-color);
}

.auth-popup-tab.active {
  background: linear-gradient(135deg, rgba(var(--theme-color-rgb), 1), rgba(var(--theme-color-rgb), 0.82));
  color: #fff;
  box-shadow: 0 10px 24px rgba(var(--theme-color-rgb), 0.24);
}

.popup-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--secondary-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin: -8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.popup-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
  transform: rotate(90deg);
}

.auth-popup-content {
  padding: 22px;
  overflow-y: auto;
  flex: 1;
  background: linear-gradient(to bottom, rgba(var(--theme-color-rgb), 0.05), transparent 35%, rgba(var(--card-background-rgb), 0.98));
}

.auth-header {
  margin-bottom: 24px;
}

.auth-badge {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(var(--theme-color-rgb), 0.08);
  color: var(--theme-color);
  font-size: 13px;
  font-weight: 600;
}

.auth-title {
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 16px 0 10px;
}

.auth-subtitle {
  font-size: 0.98rem;
  color: var(--secondary-text-color);
  margin: 0;
  line-height: 1.75;
}

.auth-form {
  margin-bottom: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.55rem;
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 600;
}

.input-shell {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-text-color);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.password-shell .form-control {
  padding-right: 42px;
}

.password-toggle:hover {
  color: var(--theme-color);
}

.password-toggle svg {
  width: 18px;
  height: 18px;
}

.form-control {
  box-sizing: border-box;
  width: 100%;
  padding: 0 16px;
  height: 50px;
  border-radius: 16px;
  border: 1px solid rgba(var(--text-color-rgb), 0.08);
  background-color: rgba(var(--text-color-rgb), 0.04);
  transition: all 0.3s ease;
  color: var(--text-color);
}

.form-control:focus {
  outline: none;
  border-color: var(--theme-color);
  box-shadow: 0 0 0 2px rgba(var(--theme-color-rgb), 0.2);
  background-color: rgba(var(--card-background-rgb), 0.95);
}

.form-control::placeholder {
  color: rgba(var(--text-color-rgb), 0.45);
}

.btn {
  height: 50px;
  width: 100%;
  border-radius: 16px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, rgba(var(--theme-color-rgb), 1), rgba(var(--theme-color-rgb), 0.82));
  border: none;
  color: white;
  font-weight: 600;
  box-shadow: 0 18px 34px rgba(var(--theme-color-rgb), 0.24);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-secondary {
  color: var(--text-color);
  border: 1px solid var(--border-color);
  background-color: rgba(var(--card-background-rgb), 0.6);
}

.btn-secondary:hover {
  border-color: var(--theme-color);
  background-color: rgba(var(--theme-color-rgb), 0.05);
  color: var(--theme-color);
}

.auth-footer {
  margin-top: 24px;
}

.auth-footer-text {
  margin: 0 0 12px;
  color: var(--secondary-text-color);
  font-size: 0.92rem;
  text-align: center;
}

@keyframes modal-in-03fee79b {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-popup-fade-enter-active {
  transition: opacity 0.3s ease;
}

.auth-popup-fade-leave-active {
  transition: opacity 0.5s ease;
}

.auth-popup-fade-enter-from,
.auth-popup-fade-leave-to {
  opacity: 0;
}

.auth-popup-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-popup-slide-leave-active {
  transition: all 0.2s ease-out;
}

.auth-popup-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.auth-popup-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .auth-popup-overlay {
    padding: 15px;
  }

  .auth-popup-container {
    max-width: 100%;
    max-height: 85vh;
  }

  .auth-popup-header {
    padding: 15px;
  }

  .auth-popup-content {
    padding: 15px;
  }

  .auth-title {
    font-size: 1.5rem;
  }

  .auth-popup-tab {
    min-width: 78px;
  }
}
</style>
