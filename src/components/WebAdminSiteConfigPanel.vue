<template>
    <form class="site-config" @submit.prevent="save">
        <div class="config-intro">
            <div>
                <p class="config-eyebrow">网站配置</p>
                <h2>管理社区、充值与用户权限</h2>
                <p>修改后统一保存，新的设置立即生效。</p>
            </div>
            <span class="config-count"><i class="fa-solid fa-tags" aria-hidden="true"></i>{{ config?.templateTags.length ?? '—' }} 个标签</span>
        </div>

        <div v-if="loading" class="config-state" role="status">正在读取网站配置…</div>
        <div v-else-if="!config" class="config-state" role="alert">
            <p>{{ error }}</p>
            <button type="button" class="secondary-button" @click="load">重新加载</button>
        </div>

        <template v-else>
            <fieldset :disabled="saving" class="config-fields">
                <section class="config-card">
                    <div class="config-card-heading">
                        <span class="config-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
                        <div><h3>权限管理</h3><p>授权特定用户增减积分，并查看“用户与激活”分区。</p></div>
                    </div>
                    <div class="permission-scope">
                        <strong>用户与激活 · 增减积分与只读权限</strong>
                        <p>允许增减用户积分；充值订单、用户列表、激活缓存与激活记录的其他功能仅支持查看和搜索。</p>
                    </div>
                    <label class="config-field" for="permission-username">添加授权用户</label>
                    <div class="permission-add-row">
                        <input id="permission-username" v-model="permissionUsername" class="text-input" placeholder="输入完整用户名" @keydown.enter.prevent="addPermissionUser" />
                        <button type="button" class="secondary-button" :disabled="lookingUp || !permissionUsername.trim()" @click="addPermissionUser">{{ lookingUp ? '查询中…' : '添加用户' }}</button>
                    </div>
                    <p v-if="permissionError" class="permission-error" role="alert">{{ permissionError }}</p>
                    <div class="permission-user-list">
                        <div v-for="id in config.permissions.userManagementUserIds" :key="id" class="permission-user">
                            <span class="permission-avatar"><i class="fa-solid fa-user" aria-hidden="true"></i></span>
                            <div><strong>{{ permissionUserName(id) }}</strong><small>UID {{ id }} · 增减积分与只读权限</small></div>
                            <button type="button" class="config-remove" :aria-label="`移除 ${permissionUserName(id)} 的授权`" @click="removePermissionUser(id)"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
                        </div>
                        <p v-if="!config.permissions.userManagementUserIds.length" class="config-empty">暂未单独授权用户，网站管理员保留全部管理权限。</p>
                    </div>
                    <p class="permission-note">授权按用户 UID 绑定，改名后继续有效。添加或移除后点击下方保存；网站配置等其他分区由网站管理员管理。</p>
                </section>

                <section class="config-card">
                    <div class="config-card-heading">
                        <span class="config-icon"><i class="fa-solid fa-tags" aria-hidden="true"></i></span>
                        <div><h3>模板社区标签</h3><p>在这里添加、修改或删除社区可选标签。</p></div>
                    </div>
                    <div class="tag-grid">
                        <div v-for="(_, index) in config.templateTags" :key="index" class="tag-editor">
                            <span class="tag-number">{{ String(index + 1).padStart(2, '0') }}</span>
                            <input v-model="config.templateTags[index]" class="text-input" :aria-label="`标签 ${index + 1}`" placeholder="标签名称" required />
                            <button type="button" class="config-remove" :aria-label="`删除标签 ${index + 1}`" @click="config.templateTags.splice(index, 1)"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
                        </div>
                    </div>
                    <p v-if="!config.templateTags.length" class="config-hint">暂无标签，点击下方按钮添加。</p>
                    <button type="button" class="config-add" @click="config.templateTags.push('')"><i class="fa-solid fa-plus" aria-hidden="true"></i>添加标签</button>
                </section>

                <section class="config-card">
                    <div class="config-card-heading">
                        <span class="config-icon"><i class="fa-solid fa-coins" aria-hidden="true"></i></span>
                        <div><h3>充值配置</h3><p>设置积分价格、支付金额和充值优惠。</p></div>
                    </div>
                    <div class="payment-grid">
                        <label class="config-field">
                            <span>积分单价 <small>元 / 积分</small></span>
                            <input v-model.number="config.points.yuanPerPoint" class="text-input" type="number" min="0" step="any" required />
                            <small>每个积分对应的人民币金额。</small>
                        </label>
                        <label class="config-field">
                            <span>最低支付金额 <small>元</small></span>
                            <input v-model="config.points.minPaymentYuan" class="text-input" type="text" placeholder="金额或 Infinity" required />
                            <small>可填写具体金额，或 Infinity 暂停充值。</small>
                        </label>
                        <label class="config-field">
                            <span>单次充值上限 <small>元</small></span>
                            <input v-model.number="config.points.maxSingleYuan" class="text-input" type="number" min="0" step="any" required />
                            <small>每笔充值允许支付的最高金额。</small>
                        </label>
                    </div>
                    <div class="recharge-control" :class="{ paused: isPaused }">
                        <div><strong>{{ isPaused ? '最低金额已设为 Infinity' : '需要暂停充值？' }}</strong><p>{{ isPaused ? '保存后将通过现有金额规则禁止充值。' : '一键将最低支付金额填为 Infinity，保存后生效。' }}</p></div>
                        <button type="button" class="secondary-button" :disabled="isPaused" @click="config.points.minPaymentYuan = 'Infinity'">{{ isPaused ? '已填入 Infinity' : '一键禁止充值' }}</button>
                    </div>

                    <div class="config-subsection">
                        <div class="config-subheading"><div><h4>折扣档位</h4><p>达到门槛时应用对应折扣，优先匹配最高积分门槛。</p></div><button type="button" class="config-add" @click="config.points.discounts.push({ minPoints: '', discount: '' })"><i class="fa-solid fa-plus" aria-hidden="true"></i>添加档位</button></div>
                        <p v-if="!config.points.discounts.length" class="config-empty">暂无折扣档位，所有充值按原价计算。</p>
                        <div v-for="(tier, index) in config.points.discounts" :key="index" class="discount-row">
                            <label class="config-field"><span>积分门槛</span><input v-model.number="tier.minPoints" class="text-input" type="number" min="1" step="1" placeholder="如 100" required /></label>
                            <label class="config-field"><span>折扣系数</span><input v-model.number="tier.discount" class="text-input" type="number" min="0" max="1" step="any" placeholder="如 0.9（九折）" required /></label>
                            <button type="button" class="config-remove" :aria-label="`删除折扣档位 ${index + 1}`" @click="config.points.discounts.splice(index, 1)"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
                        </div>
                    </div>

                    <div class="config-subsection">
                        <div class="config-subheading"><div><h4>建议充值积分数</h4><p>按这里的顺序展示在充值页面，留空则不显示推荐面额。</p></div><button type="button" class="config-add" @click="config.points.suggestions.push('')"><i class="fa-solid fa-plus" aria-hidden="true"></i>添加面额</button></div>
                        <p v-if="!config.points.suggestions.length" class="config-empty">暂无建议面额。</p>
                        <div class="suggestion-grid">
                            <div v-for="(_, index) in config.points.suggestions" :key="index" class="suggestion-editor">
                                <input v-model.number="config.points.suggestions[index]" class="text-input" type="number" min="1" step="1" :aria-label="`建议面额 ${index + 1}`" placeholder="积分数" required />
                                <span>积分</span>
                                <button type="button" class="config-remove" :aria-label="`删除建议面额 ${index + 1}`" @click="config.points.suggestions.splice(index, 1)"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
                            </div>
                        </div>
                    </div>
                </section>
            </fieldset>

            <div class="config-footer">
                <div aria-live="polite"><p v-if="error" class="config-error" role="alert">{{ error }}</p><p v-else-if="saved" class="config-success" role="status"><i class="fa-solid fa-circle-check" aria-hidden="true"></i>网站配置已保存并生效</p><p v-else>所有修改将在保存后生效。</p></div>
                <button type="submit" class="primary-button" :disabled="saving || lookingUp"><i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'" aria-hidden="true"></i>{{ saving ? '正在保存…' : '保存网站配置' }}</button>
            </div>
        </template>
    </form>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { postJson } from '../services/api.js'

const props = defineProps({ token: { type: String, required: true } })
const config = ref(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const saved = ref(false)
const permissionUsername = ref('')
const permissionUsers = ref([])
const permissionError = ref('')
const lookingUp = ref(false)
const isPaused = computed(() => String(config.value?.points.minPaymentYuan).trim() === 'Infinity')

watch(config, () => { saved.value = false }, { deep: true, flush: 'sync' })

function permissionUserName(id) {
    return permissionUsers.value.find(user => user.id === id)?.username || `用户 ${id}`
}

async function addPermissionUser() {
    const username = permissionUsername.value.trim()
    if (!username || lookingUp.value || saving.value) return
    lookingUp.value = true
    permissionError.value = ''
    try {
        const data = await postJson('/api/admin/site-config/user-lookup', { token: props.token, username })
        if (!data.ok) throw new Error(data.error || data.message || '用户查询失败')
        if (config.value.permissions.userManagementUserIds.includes(data.user.id)) throw new Error('该用户已在授权名单中')
        config.value.permissions.userManagementUserIds.push(data.user.id)
        permissionUsers.value.push(data.user)
        permissionUsername.value = ''
    } catch (cause) {
        permissionError.value = cause.message || '用户查询失败，请稍后重试'
    } finally {
        lookingUp.value = false
    }
}

function removePermissionUser(id) {
    config.value.permissions.userManagementUserIds = config.value.permissions.userManagementUserIds.filter(value => value !== id)
    permissionUsers.value = permissionUsers.value.filter(user => user.id !== id)
    permissionError.value = ''
}

async function load() {
    loading.value = true
    error.value = ''
    config.value = null
    permissionUsers.value = []
    permissionUsername.value = ''
    permissionError.value = ''
    try {
        const data = await postJson('/api/admin/site-config/get', { token: props.token })
        if (!data.ok) throw new Error(data.error || data.message || '网站配置加载失败')
        config.value = data.config
        permissionUsers.value = data.userManagementUsers || []
    } catch (cause) {
        error.value = cause.message || '网站配置加载失败，请稍后重试'
    } finally {
        loading.value = false
    }
}

async function save() {
    if (saving.value || lookingUp.value) return
    error.value = ''
    saved.value = false
    const minimum = String(config.value.points.minPaymentYuan).trim()
    if (!minimum || (minimum !== 'Infinity' && (!Number.isFinite(Number(minimum)) || Number(minimum) < 0))) {
        error.value = '最低支付金额须为非负数或 Infinity'
        return
    }
    saving.value = true
    try {
        const data = await postJson('/api/admin/site-config/save', {
            token: props.token,
            config: {
                templateTags: config.value.templateTags,
                permissions: config.value.permissions,
                points: { ...config.value.points, minPaymentYuan: minimum === 'Infinity' ? 'Infinity' : Number(minimum) },
            },
        })
        if (!data.ok) throw new Error(data.error || data.message || '保存失败')
        config.value = data.config
        permissionUsers.value = data.userManagementUsers || []
        saved.value = true
    } catch (cause) {
        error.value = cause.message || '保存失败，请稍后重试'
    } finally {
        saving.value = false
    }
}

watch(() => props.token, load, { immediate: true })
</script>

<style scoped>
.site-config { display: grid; gap: 20px; color: var(--text-color); min-width: 0; }
.config-intro { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; border: 1px solid rgba(var(--theme-color-rgb), .16); border-radius: 20px; background: linear-gradient(120deg, rgba(var(--theme-color-rgb), .1), rgba(var(--card-background-rgb), .65)); }
.config-eyebrow { margin: 0 0 8px; color: var(--theme-color); font-size: 12px; font-weight: 700; }
.config-intro h2 { margin: 0; font-size: clamp(18px, 2.4vw, 23px); }
.config-intro p:last-child { margin: 8px 0 0; color: var(--secondary-text-color); font-size: 13px; line-height: 1.7; }
.config-count { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; padding: 9px 13px; border-radius: 99px; color: var(--theme-color); background: rgba(var(--card-background-rgb), .8); font-size: 12px; font-weight: 600; }
.config-fields { display: grid; gap: 20px; min-width: 0; border: 0; padding: 0; margin: 0; }
.config-card { padding: 24px; border: 1px solid var(--border-color); border-radius: 20px; background: rgba(var(--card-background-rgb), .82); box-shadow: 0 8px 28px rgba(12, 24, 48, .035); min-width: 0; }
.config-card-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.config-icon { display: grid; place-items: center; width: 42px; height: 42px; flex-shrink: 0; border-radius: 13px; color: var(--theme-color); background: rgba(var(--theme-color-rgb), .1); }
.config-card h3 { margin: 0; font-size: 17px; }
.permission-scope { padding: 15px 16px; margin-bottom: 20px; border: 1px solid rgba(var(--theme-color-rgb), .14); border-radius: 13px; background: rgba(var(--theme-color-rgb), .04); }
.permission-scope strong { font-size: 13px; color: var(--theme-color); }
.permission-scope p, .permission-note { margin: 7px 0 0; font-size: 12px; color: var(--secondary-text-color); line-height: 1.8; }
.permission-add-row { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
.permission-add-row .text-input { flex: 1; }
.permission-add-row button { flex-shrink: 0; }
.permission-error { margin: 10px 0 0; font-size: 12px; color: #dc2626; }
.permission-user-list { display: grid; gap: 10px; margin-top: 18px; }
.permission-user { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 13px; border: 1px solid var(--border-color); border-radius: 13px; }
.permission-avatar { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; color: var(--theme-color); background: rgba(var(--theme-color-rgb), .08); }
.permission-user > div { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.permission-user strong { display: block; font-size: 13px; }
.permission-user small { display: block; margin-top: 4px; color: var(--secondary-text-color); font-size: 11px; }
.permission-note { margin-top: 16px; }
.config-card-heading p, .config-subheading p { margin: 5px 0 0; font-size: 12px; color: var(--secondary-text-color); line-height: 1.7; }
.tag-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
.tag-editor, .suggestion-editor { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tag-number { font-size: 11px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
.site-config .text-input { width: 100%; min-width: 0; box-sizing: border-box; }
.tag-editor .text-input, .suggestion-editor .text-input { flex: 1; width: 0; }
.config-remove { display: grid; place-items: center; width: 32px; height: 36px; flex-shrink: 0; padding: 0; border: 0; border-radius: 9px; background: transparent; color: var(--secondary-text-color); cursor: pointer; }
.config-remove:hover { color: #dc2626; background: rgba(220, 38, 38, .08); }
.config-add { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 13px; border: 1px dashed rgba(var(--theme-color-rgb), .35); border-radius: 10px; color: var(--theme-color); background: rgba(var(--theme-color-rgb), .04); font-size: 12px; cursor: pointer; white-space: nowrap; }
.tag-grid + .config-add { margin-top: 16px; }
.config-add:hover { background: rgba(var(--theme-color-rgb), .1); }
.payment-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.config-field { display: flex; flex-direction: column; gap: 9px; min-width: 0; font-size: 13px; font-weight: 600; }
.config-field span { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.config-field small { color: var(--secondary-text-color); font-size: 11px; font-weight: 400; line-height: 1.6; }
.recharge-control { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 22px; padding: 16px; border: 1px solid var(--border-color); border-radius: 13px; background: rgba(var(--theme-color-rgb), .035); }
.recharge-control strong { font-size: 13px; }
.recharge-control p { margin: 5px 0 0; color: var(--secondary-text-color); font-size: 12px; line-height: 1.7; }
.recharge-control .secondary-button { flex-shrink: 0; font-size: 12px; }
.recharge-control.paused { background: rgba(217, 119, 6, .06); border-color: rgba(217, 119, 6, .2); }
.config-subsection { margin-top: 26px; padding-top: 24px; border-top: 1px solid var(--border-color); }
.config-subheading { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.config-subheading h4 { margin: 0; font-size: 14px; }
.config-empty { margin: 0; padding: 18px; border: 1px dashed var(--border-color); border-radius: 12px; color: var(--secondary-text-color); text-align: center; font-size: 12px; }
.discount-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 32px; align-items: end; gap: 14px; margin-top: 14px; }
.suggestion-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.suggestion-editor > span { color: var(--secondary-text-color); font-size: 12px; }
.config-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 18px 22px; border: 1px solid var(--border-color); border-radius: 16px; background: rgba(var(--card-background-rgb), .95); }
.config-footer p, .config-hint { margin: 0; color: var(--secondary-text-color); font-size: 12px; line-height: 1.7; }
.config-hint { margin-bottom: 14px; }
.config-footer .primary-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.config-footer .config-error { color: #dc2626; }
.config-footer .config-success { color: #16a34a; }
.config-state { padding: 32px; border: 1px solid var(--border-color); border-radius: 20px; background: rgba(var(--card-background-rgb), .82); text-align: center; font-size: 13px; color: var(--secondary-text-color); }
.site-config button:disabled { opacity: .55; cursor: default; }
.site-config button:focus-visible { outline: 2px solid var(--theme-color); outline-offset: 3px; }
@media (max-width: 700px) {
    .config-intro, .config-card { padding: 18px; border-radius: 16px; }
    .config-intro { flex-wrap: wrap; }
    .payment-grid { grid-template-columns: 1fr; }
    .recharge-control { align-items: flex-start; flex-direction: column; }
    .config-subheading { align-items: flex-start; flex-wrap: wrap; }
    .discount-row { gap: 8px; }
    .config-field span { flex-wrap: wrap; }
    .config-footer { padding: 16px 18px; }
    .config-footer .primary-button { width: 100%; }
    .permission-add-row { align-items: stretch; flex-direction: column; }
}
</style>
