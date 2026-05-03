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

          <div v-if="orderResult" class="order-box">
            <p><span>商家订单号</span><strong>{{ orderResult.orderNo }}</strong></p>
            <a :href="orderResult.payUrl" target="_blank" rel="noopener noreferrer">
              点击前往支付
            </a>
            <p class="tip-text">支付成功后会自动到账；若未自动到账，可在右侧输入订单号手动确认。</p>
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
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from '../composables/useToast.js'
import { useAuth } from '../composables/useAuth.js'
import { normalizeMessage, postJson } from '../services/api.js'

const { showToast } = useToast()
const { state: authState, refreshProfile, updateUser } = useAuth()

const payConfig = ref(null)
const loadingPayConfig = ref(false)
const loadingProfile = ref(false)
const creatingOrder = ref(false)
const claimingOrder = ref(false)
const selectedPoints = ref('')
const claimOrderNo = ref('')
const orderResult = ref(null)

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
  const url = new URL(window.location.href)
  url.searchParams.delete('callback_target')
  url.searchParams.delete('out_trade_no')

  const nextSearch = url.searchParams.toString()
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`
  window.history.replaceState({}, '', nextUrl)
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
    const callbackUrl = `${window.location.origin}${window.location.pathname}?callback_target=me`
    const data = await postJson('/api/pay/create', {
      token: authState.token,
      points: selectedPointsNumber.value,
      callback_url: callbackUrl,
    })

    if (data.type === 'success') {
      orderResult.value = {
        orderNo: data.order_no,
        payUrl: data.pay_url,
      }
      claimOrderNo.value = data.order_no
      showToast('订单创建成功，请完成支付', 'success', 3200)
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
      const successMessage = normalizeMessage(data, '支付成功，积分已到账')
      showToast(successMessage, 'success', 3600)
      await refreshProfile({ silent: true, showAuthToast: true })
      if (typeof data.points !== 'undefined') {
        updateUser({ points: data.points })
      }
      return true
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

.order-box {
  margin-top: 18px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(var(--success-color-rgb), 0.16);
}

.order-box p {
  margin: 0;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: baseline;
  color: var(--secondary-text-color);
}

.order-box strong {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--text-color);
  word-break: break-all;
  text-align: right;
}

.order-box a {
  display: inline-flex;
  align-items: center;
  margin: 16px 0 10px;
  color: var(--theme-color);
  font-weight: 700;
}

.claim-group {
  margin: 18px 0;
}

@media (max-width: 768px) {
  .order-box p {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-box strong {
    text-align: left;
  }
}
</style>
