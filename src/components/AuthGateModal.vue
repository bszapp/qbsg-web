<template>
  <Teleport to="body">
    <Transition name="auth-popup-fade">
      <div v-if="show" class="auth-popup-overlay" @click.self="emitClose">
        <Transition name="auth-popup-slide" appear>
          <div v-if="show" class="auth-popup-container">
            <div class="auth-popup-header">
              <h2 class="popup-title">{{ mode === 'login' ? '登录' : '创建账户' }}</h2>

              <button class="popup-close-btn" type="button" @click="emitClose">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="auth-popup-content">
              <div class="auth-header">
                <div class="auth-logo">
                  <img src="/logo.png" alt="Logo" />
                </div>
                <h1 class="auth-title">{{ mode === 'login' ? '登录到签变时光' : '创建签变时光账户' }}</h1>
                <p class="auth-subtitle">
                  {{ mode === 'login' ? '登录后继续访问激活码与个人中心。' : '创建账户后继续访问激活码与个人中心。' }}
                </p>
              </div>

              <form v-if="mode === 'login'" class="auth-form" @submit.prevent="submitLogin">
                <div class="form-group">
                  <label>
                    账号
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input v-model="loginForm.username" type="text" class="form-control" placeholder="请输入用户名" />
                  </div>
                </div>

                <div class="form-group">
                  <label>
                    密码
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                    </svg>
                    <input v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'"
                      class="form-control" placeholder="请输入密码" />
                    <button type="button" class="password-toggle" @click="showLoginPassword = !showLoginPassword">
                      <svg v-if="showLoginPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-0.41 1.17-1.05 2.27-1.9 3.23" />
                        <path d="M6.61 6.61C4.62 8 3.16 9.87 2 12c1.73 4.89 6 8 10 8 1.73 0 3.39-.49 4.82-1.33" />
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="form-options">
                  <div class="remember-me">
                    <label class="checkbox-container">
                      <input v-model="loginForm.rememberMe" type="checkbox" />
                      <span class="checkmark" />
                      <span class="checkbox-label">记住我</span>
                    </label>
                  </div>

                  <button type="button" class="forgot-password" @click="showForgotPasswordToast">
                    忘记密码
                  </button>
                </div>

                <CaptchaWidget ref="loginCaptchaRef" v-model="loginCaptchaToken" @error="handleCaptchaError" />

                <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
                  <span>{{ submitting ? '登录中...' : '登录' }}</span>
                  <svg class="icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              </form>

              <form v-else class="auth-form" @submit.prevent="submitRegister">
                <div class="form-group">
                  <label>
                    账号
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input v-model="registerForm.username" type="text" class="form-control" placeholder="3-16 字符" />
                  </div>
                </div>

                <div class="form-group">
                  <label>
                    密码
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                    </svg>
                    <input v-model="registerForm.password" :type="showRegisterPassword ? 'text' : 'password'"
                      class="form-control" placeholder="6-16 字符，至少两种字符类型" />
                    <button type="button" class="password-toggle" @click="showRegisterPassword = !showRegisterPassword">
                      <svg v-if="showRegisterPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-0.41 1.17-1.05 2.27-1.9 3.23" />
                        <path d="M6.61 6.61C4.62 8 3.16 9.87 2 12c1.73 4.89 6 8 10 8 1.73 0 3.39-.49 4.82-1.33" />
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>
                    确认密码
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                    </svg>
                    <input v-model="registerForm.confirmPassword"
                      :type="showRegisterConfirmPassword ? 'text' : 'password'" class="form-control"
                      placeholder="请再次输入密码" />
                    <button type="button" class="password-toggle"
                      @click="showRegisterConfirmPassword = !showRegisterConfirmPassword">
                      <svg v-if="showRegisterConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-0.41 1.17-1.05 2.27-1.9 3.23" />
                        <path d="M6.61 6.61C4.62 8 3.16 9.87 2 12c1.73 4.89 6 8 10 8 1.73 0 3.39-.49 4.82-1.33" />
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="agreement-checkbox">
                  <label class="checkbox-container">
                    <input v-model="registerForm.agreeTerms" type="checkbox" />
                    <span class="checkmark" />
                    <span class="checkbox-label">
                      我已阅读并同意服务条款
                      <span class="required">*</span>
                    </span>
                  </label>
                </div>

                <CaptchaWidget ref="registerCaptchaRef" v-model="registerCaptchaToken" @error="handleCaptchaError" />

                <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
                  <span>{{ submitting ? '注册中...' : '创建账户' }}</span>
                  <svg class="icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              </form>

              <div class="auth-footer">
                <div class="auth-divider">
                  <span class="auth-divider-text">{{ mode === 'login' ? '还没有账户？' : '已经有账户？' }}</span>
                </div>

                <button type="button" class="btn btn-secondary btn-block" @click="toggleMode">
                  {{ mode === 'login' ? '创建账户' : '返回登录' }}
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
const showRegisterConfirmPassword = ref(false)
const submitting = ref(false)
const loginCaptchaRef = ref(null)
const registerCaptchaRef = ref(null)
const loginCaptchaToken = ref('')
const registerCaptchaToken = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
})

function emitClose() {
  emit('close')
}

function toggleMode() {
  emit('switch-mode', mode.value === 'login' ? 'register' : 'login')
}

function showForgotPasswordToast() {
  showToast('请联系管理员凭历史交易记录找回', 'info', 3000)
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

  if (!registerForm.confirmPassword) {
    showToast('请再次输入密码', 'warning', 2800)
    return false
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    showToast('两次输入的密码不一致', 'warning', 2800)
    return false
  }

  if (!registerForm.agreeTerms) {
    showToast('请先阅读并同意服务条款', 'warning', 2800)
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
  max-width: 500px;
  background-color: rgba(var(--card-background-rgb), 1);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(var(--theme-color-rgb), 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  animation: modal-in-03fee79b 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-popup-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(var(--theme-color-rgb), 0.03);
}

.popup-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
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
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  background: linear-gradient(to bottom, rgba(var(--theme-color-rgb), 0.02), transparent);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  margin-bottom: 1.5rem;
  text-align: center;
}

.auth-logo img {
  width: 60px;
  height: 60px;
  min-width: 60px;
  min-height: 60px;
  border-radius: 12px;
  object-fit: cover;
  user-select: none;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 0.5rem;
}

.auth-subtitle {
  font-size: 1rem;
  color: var(--secondary-text-color);
  margin: 0;
  line-height: 1.6;
}

.auth-form {
  margin-bottom: 1.5rem;
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

.required {
  color: #ff4d4f;
  margin-left: 4px;
  font-size: 16px;
  vertical-align: middle;
}

.input-with-icon {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-text-color);
  width: 20px;
  height: 20px;
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
  padding: 0 14px 0 40px;
  height: 45px;
  border-radius: 8px;
  border: 1px solid rgba(var(--text-color-rgb), 0.08);
  background-color: rgba(var(--text-color-rgb), 0.04);
  transition: all 0.3s ease;
  color: var(--text-color);
}

.form-control[type='password'],
.form-control[type='text'] {
  padding-right: 40px;
}

.form-control:focus {
  outline: none;
  border-color: var(--theme-color);
  box-shadow: 0 0 0 2px rgba(var(--theme-color-rgb), 0.2);
}

.form-control::placeholder {
  color: rgba(var(--text-color-rgb), 0.45);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-container input:checked~.checkmark {
  background-color: var(--theme-color);
  border-color: var(--theme-color);
}

.checkbox-container input:checked~.checkmark::after {
  display: block;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: transparent;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkmark::after {
  content: '';
  position: absolute;
  display: none;
  left: 5px;
  top: 0.5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  color: var(--secondary-text-color);
  font-size: 0.875rem;
  line-height: 1.5;
}

.forgot-password {
  color: var(--theme-color);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.3s ease, opacity 0.3s ease;
}

.forgot-password:hover {
  opacity: 0.8;
}

.agreement-checkbox {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.agreement-checkbox .checkbox-container {
  align-items: flex-start;
}

.btn {
  height: 45px;
  width: 100%;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--theme-color);
  border: none;
  color: white;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background-color: rgba(var(--theme-color-rgb), 0.92);
}

.btn-primary .icon-right {
  width: 18px;
  height: 18px;
  margin-left: 8px;
}

.btn-secondary {
  color: var(--text-color);
  border: 1px solid var(--border-color);
  background-color: transparent;
}

.btn-secondary:hover {
  border-color: var(--theme-color);
  background-color: rgba(var(--theme-color-rgb), 0.05);
  color: var(--theme-color);
}

.auth-footer {
  margin-top: 24px;
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--border-color);
}

.auth-divider-text {
  padding: 0 1rem;
  color: var(--secondary-text-color);
  font-size: 0.875rem;
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

  .popup-title {
    font-size: 16px;
  }

  .auth-popup-content {
    padding: 15px;
  }

  .auth-title {
    font-size: 1.45rem;
  }
}
</style>