<template>
  <div class="page-shell">
    <div class="page-stack">
      <section class="hero-card">
        <span class="page-eyebrow">我的 · 个人设置</span>
        <div class="page-title-row">
          <div>
            <h1 class="page-title">账户安全与设置</h1>
            <p class="page-subtitle">
              这里专门处理密码修改、退出登录和注销账号。页面只通过右上角用户名菜单进入，导航栏依然高亮“我的”。
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

          <div class="field-grid">
            <div class="field-group full">
              <label class="field-label">当前密码</label>
              <input
                v-model="changePasswordForm.password"
                type="password"
                class="text-input"
                placeholder="输入当前密码"
              />
            </div>

            <div class="field-group full">
              <label class="field-label">新密码</label>
              <input
                v-model="changePasswordForm.newPassword"
                type="password"
                class="text-input"
                placeholder="输入新密码"
              />
            </div>

            <div class="field-group full">
              <label class="field-label">人机验证</label>
              <CaptchaWidget
                ref="changePasswordCaptchaRef"
                v-model="changePasswordCaptchaToken"
                @error="handleCaptchaError"
              />
            </div>
          </div>

          <div class="button-row settings-actions">
            <button type="button" class="primary-button" @click="submitChangePassword" :disabled="changingPassword">
              {{ changingPassword ? '提交中...' : '确认修改密码' }}
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
            注销账号前需要再次输入用户名、密码，以及你自愿放弃的积分数量。所有结果都会通过 toast 回调提示。
          </div>

          <div class="button-row logout-row">
            <button type="button" class="secondary-button" @click="submitLogout">
              退出登录
            </button>
          </div>

          <div class="delete-form">
            <div class="field-grid">
              <div class="field-group full">
                <label class="field-label">用户名（确认）</label>
                <input
                  v-model="deleteForm.username"
                  type="text"
                  class="text-input"
                  placeholder="输入当前用户名"
                />
              </div>

              <div class="field-group full">
                <label class="field-label">密码</label>
                <input
                  v-model="deleteForm.password"
                  type="password"
                  class="text-input"
                  placeholder="输入当前密码"
                />
              </div>

              <div class="field-group full">
                <label class="field-label">放弃积分数量</label>
                <input
                  v-model="deleteForm.points"
                  type="text"
                  class="text-input"
                  placeholder="输入你自愿放弃的积分数"
                />
              </div>

              <div class="field-group full">
                <label class="field-label">人机验证</label>
                <CaptchaWidget
                  ref="deleteCaptchaRef"
                  v-model="deleteCaptchaToken"
                  @error="handleCaptchaError"
                />
              </div>
            </div>

            <div class="button-row settings-actions">
              <button type="button" class="danger-button" @click="submitDeleteAccount" :disabled="deletingAccount">
                {{ deletingAccount ? '注销中...' : '确认注销账号' }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
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
}

function resetDeleteForm() {
  deleteForm.username = ''
  deleteForm.password = ''
  deleteForm.points = ''
  deleteCaptchaToken.value = ''
  deleteCaptchaRef.value?.reset()
}

async function submitChangePassword() {
  if (changingPassword.value) {
    return
  }

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
    resetChangePasswordForm()
  }
}

async function submitLogout() {
  await router.replace('/')
  await logout()
}

async function submitDeleteAccount() {
  if (deletingAccount.value) {
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
    resetDeleteForm()
    router.replace('/')
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
  margin: 18px 0;
}

.delete-form {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border-color);
}
</style>
