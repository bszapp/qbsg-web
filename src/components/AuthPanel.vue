<template>
  <div class="auth-panel">
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
          <input v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'" class="form-control"
            placeholder="请输入密码" />
          <button type="button" class="password-toggle" @click="showLoginPassword = !showLoginPassword">
            <svg v-if="showLoginPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
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

      <div class="form-options" :class="{ 'form-options--compact': !enableRememberMe }">
        <div v-if="enableRememberMe" class="remember-me">
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
          <input v-model="registerForm.password" :type="showRegisterPassword ? 'text' : 'password'" class="form-control"
            placeholder="6-16 字符，至少两种字符类型" />
          <button type="button" class="password-toggle" @click="showRegisterPassword = !showRegisterPassword">
            <svg v-if="showRegisterPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
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
          <input v-model="registerForm.confirmPassword" :type="showRegisterConfirmPassword ? 'text' : 'password'"
            class="form-control" placeholder="请再次输入密码" />
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
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useToast } from '../composables/useToast.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'login',
  },
  enableRememberMe: {
    type: Boolean,
    default: false,
  },
  rememberStorageKey: {
    type: String,
    default: 'login_remember_me',
  },
  loginAction: {
    type: Function,
    required: true,
  },
  registerAction: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['switch-mode', 'auth-success'])

const { showToast } = useToast()

const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)
const submitting = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

onMounted(() => {
  if (!props.enableRememberMe) {
    return
  }

  try {
    const saved = localStorage.getItem(props.rememberStorageKey)
    if (!saved) {
      return
    }

    const parsed = JSON.parse(saved)
    loginForm.username = parsed.username || ''
    loginForm.password = parsed.password || ''
    loginForm.rememberMe = true
  } catch {
    // 忽略解析错误
  }
})

function toggleMode() {
  emit('switch-mode', props.mode === 'login' ? 'register' : 'login')
}

function showForgotPasswordToast() {
  showToast('请联系管理员凭历史交易记录找回', 'info', 3000)
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

  return true
}

function persistRememberMe() {
  if (!props.enableRememberMe) {
    return
  }

  try {
    if (loginForm.rememberMe) {
      localStorage.setItem(props.rememberStorageKey, JSON.stringify({
        username: loginForm.username.trim(),
        password: loginForm.password,
      }))
      return
    }

    localStorage.removeItem(props.rememberStorageKey)
  } catch {
    // 忽略存储错误
  }
}

async function submitLogin() {
  if (submitting.value || !ensureLoginForm()) {
    return
  }

  submitting.value = true

  try {
    const ok = await props.loginAction({
      username: loginForm.username.trim(),
      password: loginForm.password,
    })

    if (ok) {
      persistRememberMe()
      emit('auth-success', { mode: 'login' })
    }
  } catch (error) {
    showToast(error.message || '登录失败，请稍后重试', 'error', 3400)
  } finally {
    submitting.value = false
  }
}

async function submitRegister() {
  if (submitting.value || !ensureRegisterForm()) {
    return
  }

  submitting.value = true

  try {
    const ok = await props.registerAction({
      username: registerForm.username.trim(),
      password: registerForm.password,
    })

    if (ok) {
      emit('auth-success', { mode: 'register' })
    }
  } catch (error) {
    showToast(error.message || '注册失败，请稍后重试', 'error', 3400)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-panel {
  padding: 20px;
  box-sizing: border-box;
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

.form-options--compact {
  justify-content: flex-end;
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

.btn {
  height: 45px;
  width: 100%;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.btn-secondary:hover:not(:disabled) {
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

@media (max-width: 768px) {
  .auth-panel {
    padding: 15px;
  }

  .auth-title {
    font-size: 1.45rem;
  }
}
</style>
