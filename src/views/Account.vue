<template>
  <div class="page-shell">
    <div class="page-stack">
      <section class="hero-card">
        <span class="page-eyebrow">我的</span>
        <div class="page-title-row">
          <div>
            <h1 class="page-title">账户充值与用户信息</h1>
          </div>
        </div>

        <div class="stat-grid account-stats">
          <article class="stat-card">
            <span class="stat-label">当前用户名</span>
            <strong class="stat-value">{{ authState.user?.username || '-' }}</strong>
          </article>
          <article class="stat-card">
            <span class="stat-label">剩余积分</span>
            <strong class="stat-value">{{ authState.user?.points ?? '-' }}</strong>
          </article>
        </div>
      </section>

      <div class="section-grid">
        <section class="panel-card">
          <div class="section-header">
            <div>
              <h2 class="section-title">积分充值</h2>
              <p class="section-desc">支持快捷面额、自定义积分、支付宝跳转，以及回调后自动认领。</p>
            </div>
          </div>

          <div class="suggest-grid">
            <button v-for="suggestion in suggestions" :key="suggestion.points" type="button" class="suggest-card"
              :class="{ active: selectedPointsNumber === suggestion.points }"
              @click="selectSuggestion(suggestion.points)">
              <strong>{{ suggestion.points }} 积分</strong>
              <span :class="suggestion.too_small ? 'muted' : ''">¥{{ suggestion.amount_yuan }}</span>
              <em v-if="!suggestion.too_small && suggestion.discount_rate < 1">
                {{ Math.round(suggestion.discount_rate * 10) }} 折
              </em>
              <em v-else-if="suggestion.too_small">
                金额过小
              </em>
            </button>

            <div v-if="loadingPayConfig" class="suggest-placeholder">
              正在加载充值配置...
            </div>
            <div v-else-if="!suggestions.length" class="suggest-placeholder">
              暂无可用充值面额
            </div>
          </div>

          <div class="field-grid recharge-grid">
            <div class="field-group">
              <label class="field-label">自定义积分数</label>
              <input v-model="selectedPoints" type="number" min="1" class="text-input" placeholder="输入需要充值的积分" />
            </div>

            <div class="field-group">
              <label class="field-label">金额预估</label>
              <div class="amount-hint" :class="amountHint.tone">
                {{ amountHint.text }}
              </div>
            </div>
          </div>

          <div class="button-row">
            <button type="button" class="primary-button" @click="createRechargeOrder" :disabled="creatingOrder">
              {{ creatingOrder ? '创建订单中...' : '发起充值' }}
            </button>
          </div>
        </section>

        <section class="panel-card">
          <div class="section-header">
            <div>
              <h2 class="section-title">订单号充值认领</h2>
              <p class="section-desc">适用于支付回跳未自动到账的场景。</p>
            </div>
          </div>

          <div class="field-group claim-group">
            <label class="field-label">商家订单号</label>
            <input v-model="claimOrderNo" type="text" class="text-input" placeholder="输入支付时生成的订单号" />
          </div>

          <div class="button-row">
            <button type="button" class="primary-button" @click="claimOrder" :disabled="claimingOrder">
              {{ claimingOrder ? '确认中...' : '确认到账' }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!-- ===== 支付弹窗 ===== -->
  <Teleport to="body">
    <Transition name="auth-popup-fade">
      <div v-if="showPayModal" class="auth-popup-overlay" @click.self="closePayModal">
        <Transition name="auth-popup-slide" appear>
          <div v-if="showPayModal" class="auth-popup-container pay-modal-container">
            <div class="auth-popup-header">
              <h2 class="popup-title">完成支付</h2>
              <button class="popup-close-btn" type="button" @click="closePayModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="auth-popup-content">
              <!-- 二维码区域（有 direct_url 时显示） -->
              <div class="qr-section">
                <template v-if="orderResult?.directUrl">
                  <div class="qr-wrap">
                    <canvas ref="qrCanvas" class="qr-canvas"></canvas>
                  </div>
                </template>
                <template v-else>
                  <div class="qr-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48"
                      height="48">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="5" y="5" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
                      <rect x="16" y="5" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
                      <rect x="5" y="16" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
                      <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill="currentColor"
                        stroke="none" />
                    </svg>
                    <span>二维码不可用</span>
                  </div>
                </template>
                <!-- 二维码下方始终显示 URL -->
                <a class="qr-url-link" :href="orderResult?.directUrl || orderResult?.payUrl" target="_blank"
                  rel="noopener noreferrer">
                  {{ orderResult?.directUrl || orderResult?.payUrl }}
                </a>

                <p class="qr-notice-text">二维码由支付宝官方前端提供，时效性短，如果失效请点击下方访问原始支付链接刷新二维码</p>

              </div>

              <!-- 订单信息 -->
              <div class="pay-order-meta">
                <div class="pay-meta-row">
                  <span class="pay-meta-label">商家订单号</span>
                  <strong class="pay-meta-value">{{ orderResult?.orderNo }}</strong>
                </div>
                <div class="pay-meta-row">
                  <span class="pay-meta-label">支付金额</span>
                  <strong class="pay-meta-value">¥{{ orderResult?.amountYuan }}</strong>
                </div>
              </div>

              <!-- 操作按钮组 -->
              <div class="pay-action-group">
                <div class="pay-btn-row">
                  <button v-if="orderResult?.directScheme" type="button" class="pay-action-btn btn-alipay"
                    @click="openDirectScheme">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                      <path d="M8 12l2 2 4-4" />
                    </svg>
                    打开支付宝
                  </button>

                  <button type="button" class="pay-action-btn btn-origin" @click="openPayUrl">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    原始 URL 跳转
                  </button>
                </div>
              </div>

              <!-- 已完成支付 -->
              <button type="button" class="btn btn-primary btn-block pay-confirm-btn" @click="handleClaimFromModal"
                :disabled="claimingOrder">
                <span>{{ claimingOrder ? '确认中...' : '我已完成支付' }}</span>
                <svg class="icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </button>

              <p class="pay-tip-text">支付成功后点击"我已完成支付"完成积分到账；若长时间未到账可在右侧输入订单号手动确认。</p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import QRCode from 'qrcode'
import { useToast } from '../composables/useToast.js'
import { useAuth } from '../composables/useAuth.js'
import { normalizeMessage, postJson } from '../services/api.js'
import { useConfetti } from '../composables/useConfetti.js'


const { triggerConfetti } = useConfetti()

const { showToast } = useToast()
const { state: authState, refreshProfile, updateUser, handleAuthFailure } = useAuth()

const payConfig = ref(null)
const loadingPayConfig = ref(false)
const loadingProfile = ref(false)
const creatingOrder = ref(false)
const claimingOrder = ref(false)
const selectedPoints = ref('')
const claimOrderNo = ref('')
const orderResult = ref(null)
const showPayModal = ref(false)
const qrCanvas = ref(null)

// 打开支付宝 URL Scheme（失败静默）
function tryOpenScheme(scheme) {
  if (!scheme) return
  try {
    window.location.href = scheme
  } catch {
    // 忽略：未安装支付宝或桌面端
  }
}

function openDirectScheme() {
  if (orderResult.value?.directScheme) {
    tryOpenScheme(orderResult.value.directScheme)
  }
}

function openDirectUrl() {
  if (orderResult.value?.directUrl) {
    window.open(orderResult.value.directUrl, '_blank', 'noopener,noreferrer')
  }
}

function openPayUrl() {
  if (orderResult.value?.payUrl) {
    window.open(orderResult.value.payUrl, '_blank', 'noopener,noreferrer')
  }
}

function closePayModal() {
  showPayModal.value = false
}

// 弹窗打开后渲染二维码
watch([showPayModal, qrCanvas], async ([visible]) => {
  if (!visible) return
  await nextTick()
  if (!qrCanvas.value || !orderResult.value?.directUrl) return
  try {
    await QRCode.toCanvas(qrCanvas.value, orderResult.value.directUrl, {
      width: 220,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  } catch {
    // 二维码生成失败时静默处理
  }
})

const selectedPointsNumber = computed(() => {
  const value = Number.parseInt(selectedPoints.value, 10)
  return Number.isFinite(value) ? value : 0
})

const suggestions = computed(() => payConfig.value?.suggestions || [])

const amountHint = computed(() => {
  if (!payConfig.value || !selectedPointsNumber.value) {
    return { tone: 'neutral', text: '选择或输入积分后，这里会显示应付金额' }
  }

  let discountRate = 1
  const discounts = Array.isArray(payConfig.value.discounts) ? payConfig.value.discounts : []

  for (const tier of discounts) {
    if (selectedPointsNumber.value >= tier.minPoints) {
      discountRate = Number(tier.discount) || 1
      break
    }
  }

  const amount = Math.round(selectedPointsNumber.value * Number(payConfig.value.yuan_per_point || 0) * discountRate * 100) / 100

  if (amount < Number(payConfig.value.min_alipay_yuan || 0)) {
    return {
      tone: 'danger',
      text: `当前金额低于最低支付 ¥${payConfig.value.min_alipay_yuan}`,
    }
  }

  if (amount > Number(payConfig.value.max_single_yuan || Number.MAX_SAFE_INTEGER)) {
    return {
      tone: 'danger',
      text: `当前金额超过单笔上限 ¥${payConfig.value.max_single_yuan}`,
    }
  }

  return {
    tone: 'success',
    text: `预计支付 ¥${amount.toFixed(2)}${discountRate < 1 ? `（${Math.round(discountRate * 10)} 折）` : ''}`,
  }
})

function clearPaymentQuery() {
  window.history.replaceState({}, '', window.location.pathname + window.location.hash)
}

async function refreshInfo() {
  loadingProfile.value = true
  await refreshProfile({ silent: false, showAuthToast: true })
  loadingProfile.value = false
}

async function loadPayConfig() {
  loadingPayConfig.value = true

  try {
    const data = await postJson('/api/pay/config', {})

    if (data.type === 'success') {
      payConfig.value = data
      return
    }

    showToast(normalizeMessage(data, '充值配置加载失败'), 'error', 3400)
  } catch (error) {
    showToast(error.message || '充值配置加载失败，请稍后重试', 'error', 3400)
  } finally {
    loadingPayConfig.value = false
  }
}

function selectSuggestion(points) {
  selectedPoints.value = String(points)
}

async function createRechargeOrder() {
  if (!selectedPointsNumber.value || selectedPointsNumber.value < 1) {
    showToast('请输入有效的积分数量', 'warning', 2800)
    return
  }

  creatingOrder.value = true
  orderResult.value = null

  try {
    const callbackUrl = `${window.location.origin}${window.location.pathname}?callback_target=me#/me`
    const data = await postJson('/api/pay/create', {
      token: authState.token,
      points: selectedPointsNumber.value,
      callback_url: callbackUrl,
    })

    if (data.type === 'success') {
      orderResult.value = {
        orderNo: data.order_no,
        payUrl: data.pay_url,
        amountYuan: data.amount_yuan,
        points: data.points,
        discountRate: data.discount_rate,
        // qrExtra 字段（可能不存在）
        directUrl: data.direct_url || null,
        directScheme: data.direct_scheme || null,
      }
      claimOrderNo.value = data.order_no
      showPayModal.value = true

      // 弹窗打开后立即尝试 URL Scheme 唤起支付宝（失败静默）
      if (data.direct_scheme) {
        await nextTick()
        tryOpenScheme(data.direct_scheme)
      }

      return
    }

    if (handleAuthFailure(data)) {
      return
    }

    showToast(normalizeMessage(data, '订单创建失败'), 'error', 3400)
  } catch (error) {
    showToast(error.message || '订单创建失败，请稍后重试', 'error', 3400)
  } finally {
    creatingOrder.value = false
  }
}

async function claimOrder(options = {}) {
  const { orderNo: orderNoFromOptions = '', isAuto = false } = options
  const orderNo = (orderNoFromOptions || claimOrderNo.value).trim()

  if (!orderNo) {
    showToast('请输入订单号', 'warning', 2800)
    return false
  }

  claimingOrder.value = true

  try {
    const data = await postJson('/api/pay/claim', {
      token: authState.token,
      order_no: orderNo,
    })

    if (data.type === 'success') {
      triggerConfetti('支付成功', data.message)
      await refreshProfile({ silent: true, showAuthToast: true })
      if (typeof data.points !== 'undefined') {
        updateUser({ points: data.points })
      }
      return true
    }

    if (handleAuthFailure(data)) {
      return false
    }

    showToast(
      normalizeMessage(data, isAuto ? '自动确认失败，请稍后手动确认到账' : '订单确认失败'),
      'error',
      3400,
    )
    return false
  } catch (error) {
    showToast(error.message || '订单确认失败，请稍后重试', 'error', 3400)
    return false
  } finally {
    claimingOrder.value = false
  }
}

// 弹窗内"我已完成支付"按钮
async function handleClaimFromModal() {
  const success = await claimOrder()
  if (success) {
    closePayModal()
  }
}

async function handleReturnOrder() {
  const params = new URLSearchParams(window.location.search)
  const returnOrderNo = params.get('out_trade_no')

  if (!returnOrderNo) {
    return
  }

  claimOrderNo.value = returnOrderNo
  clearPaymentQuery()
  await claimOrder({
    orderNo: returnOrderNo,
    isAuto: true,
  })
}

onMounted(async () => {
  await Promise.all([
    refreshInfo(),
    loadPayConfig(),
  ])
  await handleReturnOrder()
})
</script>
<style scoped>
.account-stats {
  margin-top: 22px;
}

.recharge-grid {
  margin-top: 18px;
}

.suggest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.suggest-card,
.suggest-placeholder {
  min-height: 102px;
  border-radius: 20px;
}

.suggest-card {
  padding: 16px;
  text-align: left;
  border: 1px solid rgba(var(--text-color-rgb), 0.08);
  background: rgba(var(--text-color-rgb), 0.03);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.suggest-card strong,
.suggest-card span,
.suggest-card em {
  display: block;
}

.suggest-card strong {
  font-size: 18px;
  color: var(--text-color);
}

.suggest-card span {
  margin-top: 8px;
  color: var(--secondary-text-color);
  font-size: 14px;
}

.suggest-card em {
  margin-top: 10px;
  font-style: normal;
  color: #d97706;
  font-size: 12px;
}

.suggest-card .muted {
  color: #d97706;
}

.suggest-card:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--theme-color-rgb), 0.28);
  box-shadow: 0 12px 24px rgba(var(--theme-color-rgb), 0.12);
}

.suggest-card.active {
  border-color: rgba(var(--theme-color-rgb), 0.46);
  box-shadow: 0 12px 28px rgba(var(--theme-color-rgb), 0.14);
}

.suggest-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--secondary-text-color);
  background: rgba(var(--text-color-rgb), 0.03);
  border: 1px dashed rgba(var(--text-color-rgb), 0.1);
}

.amount-hint {
  min-height: 50px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(var(--text-color-rgb), 0.08);
  background: rgba(var(--text-color-rgb), 0.03);
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
}

.amount-hint.neutral {
  color: var(--secondary-text-color);
}

.amount-hint.success {
  color: var(--success-color);
  background: rgba(var(--success-color-rgb), 0.08);
  border-color: rgba(var(--success-color-rgb), 0.18);
}

.amount-hint.danger {
  color: var(--error-color);
  background: rgba(var(--error-color-rgb), 0.08);
  border-color: rgba(var(--error-color-rgb), 0.18);
}

.claim-group {
  margin: 18px 0;
}

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
  max-height: 90vh;
}

.pay-modal-container {
  max-width: 420px;
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

.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: rgba(var(--text-color-rgb), 0.02);
  border-radius: 14px;
  border: 1px solid rgba(var(--text-color-rgb), 0.06);
}

.qr-wrap {
  background: #ffffff;
  border-radius: 12px;
  padding: 10px;
  display: inline-flex;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.qr-canvas {
  display: block;
  border-radius: 6px;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 0 12px;
  color: var(--secondary-text-color);
  font-size: 13px;
}

.qr-notice-text {
  margin: 4px 0;
  font-size: 11px;
  color: var(--secondary-text-color);
  opacity: 0.9;
  text-align: center;
  line-height: 1.4;
  max-width: 280px;
}

.qr-url-link {
  font-size: 11px;
  color: var(--secondary-text-color);
  text-decoration: none;
  word-break: break-all;
  text-align: center;
  line-height: 1.5;
  max-width: 100%;
  padding: 0 4px;
  transition: color 0.2s;
}

.qr-url-link:hover {
  color: var(--theme-color);
  text-decoration: underline;
}

.pay-order-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.pay-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 13px;
}

.pay-meta-label {
  color: var(--secondary-text-color);
  white-space: nowrap;
  flex-shrink: 0;
}

.pay-meta-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--text-color);
  word-break: break-all;
  text-align: right;
}

.pay-action-group {
  margin-bottom: 16px;
}

.pay-btn-row {
  display: flex;
  gap: 8px;
}

.pay-btn-row .pay-action-btn {
  flex: 1;
  padding: 0 4px;
  white-space: nowrap;
}

.pay-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: 1px solid;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-alipay {
  background: rgba(22, 119, 255, 0.06);
  border-color: rgba(22, 119, 255, 0.28);
  color: #1677ff;
}

.btn-alipay:hover {
  background: rgba(22, 119, 255, 0.12);
  border-color: rgba(22, 119, 255, 0.5);
}

.btn-origin {
  background: rgba(var(--text-color-rgb), 0.04);
  border-color: rgba(var(--text-color-rgb), 0.12);
  color: var(--secondary-text-color);
}

.btn-origin:hover {
  background: rgba(var(--text-color-rgb), 0.08);
  border-color: rgba(var(--text-color-rgb), 0.2);
  color: var(--text-color);
}

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
  border: none;
}

.btn-primary {
  background-color: var(--theme-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: rgba(var(--theme-color-rgb), 0.92);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-block {
  display: flex;
}

.pay-confirm-btn {
  margin-bottom: 12px;
}

.icon-right {
  width: 18px;
  height: 18px;
  margin-left: 8px;
  flex-shrink: 0;
}

.pay-tip-text {
  margin: 0;
  font-size: 12px;
  color: var(--secondary-text-color);
  line-height: 1.6;
  text-align: center;
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
    max-height: 90vh;
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

  .pay-meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .pay-meta-value {
    text-align: left;
  }
}
</style>