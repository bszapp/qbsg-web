<template>
  <div class="page-shell">
    <div class="page-stack">
      <section class="hero-card">
        <span class="page-eyebrow">我的 · 个人设置</span>
        <div class="page-title-row">
          <div>
            <h1 class="page-title">账户安全与设置</h1>
            <p class="page-subtitle">
              这里专门处理密码修改、退出登录和注销账号。页面只通过右上角用户名菜单进入，导航栏依然高亮"我的"。
            </p>
          </div>

          <div class="hero-actions">
            <button type="button" class="secondary-button" @click="refreshInfo" :disabled="refreshingInfo">
              {{ refreshingInfo ? '刷新中...' : '刷新信息' }}
            </button>
          </div>
        </div>

        <div class="badge-row settings-summary">
          <span class="soft-badge">用户名：{{ authState.user?.username || '-' }}</span>
          <span class="soft-badge">积分：{{ authState.user?.points ?? '-' }}</span>
        </div>
      </section>

      <div class="section-grid settings-grid">
        <section class="panel-card">
          <div class="section-header">
            <div>
              <h2 class="section-title">修改密码</h2>
              <p class="section-desc">提交当前密码与新密码后生效，需要完成人机验证。</p>
            </div>
          </div>
          <div class="button-row settings-actions">
            <button type="button" class="primary-button" @click="showChangePasswordModal = true">
              修改密码
            </button>
          </div>
        </section>

        <section class="panel-card">
          <div class="section-header">
            <div>
              <h2 class="section-title">登录与销户</h2>
              <p class="section-desc">退出登录会清空本地 token；注销账号后不可撤销。</p>
            </div>
          </div>

          <div class="callout-box">
            注销账号前需要再次输入用户名、密码，以及确认放弃的积分数量。
          </div>

          <div class="button-row logout-row">
            <button type="button" class="secondary-button" @click="submitLogout">
              退出登录
            </button>
            <button type="button" class="danger-button" @click="showDeleteModal = true">
              注销账号
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- ===== 修改密码弹窗 ===== -->
    <Teleport to="body">
      <Transition name="auth-popup-fade">
        <div v-if="showChangePasswordModal" class="auth-popup-overlay" @click.self="closeChangePasswordModal">
          <Transition name="auth-popup-slide" appear>
            <div v-if="showChangePasswordModal" class="auth-popup-container">
              <div class="auth-popup-header">
                <h2 class="popup-title">修改密码</h2>
                <button class="popup-close-btn" type="button" @click="closeChangePasswordModal">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="auth-popup-content">
                <form class="auth-form" @submit.prevent="submitChangePassword">
                  <div class="form-group">
                    <label>当前密码 <span class="required">*</span></label>
                    <div class="input-with-icon">
                      <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                      </svg>
                      <input v-model="changePasswordForm.password" :type="showCurrentPassword ? 'text' : 'password'"
                        class="form-control" placeholder="输入当前密码" />
                      <button type="button" class="password-toggle" @click="showCurrentPassword = !showCurrentPassword">
                        <svg v-if="showCurrentPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
                    <label>新密码 <span class="required">*</span></label>
                    <div class="input-with-icon">
                      <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                      </svg>
                      <input v-model="changePasswordForm.newPassword" :type="showNewPassword ? 'text' : 'password'"
                        class="form-control" placeholder="输入新密码" />
                      <button type="button" class="password-toggle" @click="showNewPassword = !showNewPassword">
                        <svg v-if="showNewPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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

                  <CaptchaWidget ref="changePasswordCaptchaRef" v-model="changePasswordCaptchaToken"
                    @error="handleCaptchaError" />

                  <button type="submit" class="btn btn-primary btn-block" :disabled="changingPassword">
                    <span>{{ changingPassword ? '提交中...' : '确认修改密码' }}</span>
                    <svg class="icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== 注销账号弹窗 ===== -->
    <Teleport to="body">
      <Transition name="auth-popup-fade">
        <div v-if="showDeleteModal" class="auth-popup-overlay" @click.self="closeDeleteModal">
          <Transition name="auth-popup-slide" appear>
            <div v-if="showDeleteModal" class="auth-popup-container">
              <div class="auth-popup-header">
                <h2 class="popup-title">注销账号</h2>
                <button class="popup-close-btn" type="button" @click="closeDeleteModal">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="auth-popup-content">
                <form class="auth-form" @submit.prevent="submitDeleteAccount">
                  <div class="form-group">
                    <label>用户名（确认）<span class="required">*</span></label>
                    <div class="input-with-icon">
                      <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input v-model="deleteForm.username" type="text" class="form-control" placeholder="输入当前用户名" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>密码 <span class="required">*</span></label>
                    <div class="input-with-icon">
                      <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                      </svg>
                      <input v-model="deleteForm.password" :type="showDeletePassword ? 'text' : 'password'"
                        class="form-control" placeholder="输入当前密码" />
                      <button type="button" class="password-toggle" @click="showDeletePassword = !showDeletePassword">
                        <svg v-if="showDeletePassword" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
                    <label>积分确认 <span class="required">*</span></label>
                    <label class="points-confirm-row" :class="{ checked: deleteForm.confirmed }">
                      <span class="checkbox-wrap">
                        <input v-model="deleteForm.confirmed" type="checkbox" />
                        <span class="checkmark" />
                      </span>
                      <span class="points-confirm-text">
                        我确认放弃我的账户中
                        <input v-model="deleteForm.points" type="text" class="points-inline-input" placeholder="积分数"
                          @click.stop />
                        积分
                      </span>
                    </label>
                  </div>

                  <CaptchaWidget ref="deleteCaptchaRef" v-model="deleteCaptchaToken" @error="handleCaptchaError" />

                  <button type="submit" class="btn btn-danger btn-block"
                    :disabled="deletingAccount || !deleteForm.confirmed">
                    <span>{{ deletingAccount ? '注销中...' : '确认注销账号' }}</span>
                    <svg class="icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CaptchaWidget from '../components/CaptchaWidget.vue'
import { useToast } from '../composables/useToast.js'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { showToast } = useToast()
const {
  state: authState,
  refreshProfile,
  changePassword,
  deleteAccount,
  logout,
} = useAuth()

const refreshingInfo = ref(false)
const changingPassword = ref(false)
const deletingAccount = ref(false)

const showChangePasswordModal = ref(false)
const showDeleteModal = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showDeletePassword = ref(false)

const changePasswordCaptchaRef = ref(null)
const deleteCaptchaRef = ref(null)
const changePasswordCaptchaToken = ref('')
const deleteCaptchaToken = ref('')

const changePasswordForm = reactive({
  password: '',
  newPassword: '',
})

const deleteForm = reactive({
  username: '',
  password: '',
  points: '',
  confirmed: false,
})

function handleCaptchaError() {
  showToast('验证组件加载失败，请刷新页面重试', 'error', 3200)
}

async function refreshInfo() {
  refreshingInfo.value = true
  await refreshProfile({ silent: false, showAuthToast: true })
  refreshingInfo.value = false
}

function resetChangePasswordForm() {
  changePasswordForm.password = ''
  changePasswordForm.newPassword = ''
  changePasswordCaptchaToken.value = ''
  changePasswordCaptchaRef.value?.reset()
  showCurrentPassword.value = false
  showNewPassword.value = false
}

function resetDeleteForm() {
  deleteForm.username = ''
  deleteForm.password = ''
  deleteForm.points = ''
  deleteForm.confirmed = false
  deleteCaptchaToken.value = ''
  deleteCaptchaRef.value?.reset()
  showDeletePassword.value = false
}

function closeChangePasswordModal() {
  showChangePasswordModal.value = false
  resetChangePasswordForm()
}

function closeDeleteModal() {
  showDeleteModal.value = false
  resetDeleteForm()
}

async function submitChangePassword() {
  if (changingPassword.value) return

  if (!changePasswordForm.password) {
    showToast('请输入当前密码', 'warning', 2800)
    return
  }

  if (!changePasswordForm.newPassword) {
    showToast('请输入新密码', 'warning', 2800)
    return
  }

  if (!changePasswordCaptchaToken.value) {
    showToast('请先完成人机验证', 'warning', 2800)
    return
  }

  changingPassword.value = true
  const ok = await changePassword({
    password: changePasswordForm.password,
    newPassword: changePasswordForm.newPassword,
    cf_token: changePasswordCaptchaToken.value,
  })
  changingPassword.value = false

  if (ok) {
    closeChangePasswordModal()
  } else {
    changePasswordCaptchaRef.value?.reset()
    changePasswordCaptchaToken.value = ''
  }
}

async function submitLogout() {
  await router.replace('/')
  await logout()
}

async function submitDeleteAccount() {
  if (deletingAccount.value) return

  if (!deleteForm.confirmed) {
    showToast('请先勾选积分确认', 'warning', 2800)
    return
  }

  if (!deleteForm.username.trim()) {
    showToast('请输入用户名', 'warning', 2800)
    return
  }

  if (!deleteForm.password) {
    showToast('请输入密码', 'warning', 2800)
    return
  }

  if (!deleteCaptchaToken.value) {
    showToast('请先完成人机验证', 'warning', 2800)
    return
  }

  deletingAccount.value = true
  const ok = await deleteAccount({
    username: deleteForm.username.trim(),
    password: deleteForm.password,
    points: deleteForm.points,
    cf_token: deleteCaptchaToken.value,
  })
  deletingAccount.value = false

  if (ok) {
    closeDeleteModal()
    await router.replace('/')
    await logout({ silent: true })
  } else {
    deleteCaptchaRef.value?.reset()
    deleteCaptchaToken.value = ''
  }
}
</script>

<style scoped>
.settings-summary {
  margin-top: 22px;
}

.settings-grid {
  align-items: start;
}

.settings-actions {
  margin-top: 18px;
}

.logout-row {
  margin: 18px 0 0;
  gap: 12px;
}

/* ===== 弹窗结构（与 AuthGateModal 完全一致）===== */
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
}

.auth-popup-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(var(--theme-color-rgb), 0.03);
  flex-shrink: 0;
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

.auth-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group>label:first-child {
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
  pointer-events: none;
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
  background: none;
  border: none;
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
  padding: 0 40px;
  height: 45px;
  border-radius: 8px;
  border: 1px solid rgba(var(--text-color-rgb), 0.08);
  background-color: rgba(var(--text-color-rgb), 0.04);
  transition: all 0.3s ease;
  color: var(--text-color);
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: var(--theme-color);
  box-shadow: 0 0 0 2px rgba(var(--theme-color-rgb), 0.2);
}

.form-control::placeholder {
  color: rgba(var(--text-color-rgb), 0.45);
}

/* 积分确认行 */
.points-confirm-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(var(--text-color-rgb), 0.08);
  background-color: rgba(var(--text-color-rgb), 0.04);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.points-confirm-row.checked {
  border-color: rgba(var(--theme-color-rgb), 0.35);
  background-color: rgba(var(--theme-color-rgb), 0.04);
}

.checkbox-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.checkbox-wrap input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  inset: 0;
  background-color: transparent;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-wrap input[type="checkbox"]:checked~.checkmark {
  background-color: var(--theme-color);
  border-color: var(--theme-color);
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

.checkbox-wrap input[type="checkbox"]:checked~.checkmark::after {
  display: block;
}

.points-confirm-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-color);
  flex-wrap: wrap;
  line-height: 1.5;
}

.points-inline-input {
  width: 80px;
  height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid rgba(var(--text-color-rgb), 0.15);
  background-color: rgba(var(--text-color-rgb), 0.06);
  color: var(--text-color);
  font-size: 13px;
  text-align: center;
  transition: all 0.2s ease;
}

.points-inline-input:focus {
  outline: none;
  border-color: var(--theme-color);
  box-shadow: 0 0 0 2px rgba(var(--theme-color-rgb), 0.15);
}

.points-inline-input::placeholder {
  color: rgba(var(--text-color-rgb), 0.4);
}

/* 按钮 */
.btn {
  height: 45px;
  width: 100%;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--theme-color);
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: rgba(var(--theme-color-rgb), 0.92);
}

.btn-danger {
  background-color: #e53935;
  border: none;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c62828;
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.35);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn .icon-right {
  width: 18px;
  height: 18px;
  margin-left: 8px;
  flex-shrink: 0;
}

/* 动画（与 AuthGateModal 完全一致）*/
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
}
</style>
