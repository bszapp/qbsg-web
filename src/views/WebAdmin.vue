<template>
    <div class="wa-shell">
        <div v-if="!isAdmin" class="wa-noperm">
            <h2>⛔ 无访问权限</h2>
            <p>当前账号没有网站管理员权限。</p>
            <button @click="$router.push('/')">返回主页</button>
        </div>

        <template v-else>
            <div class="wa-header">
                <h1>网站管理后台</h1>
                <span class="wa-user">{{ username }}</span>
            </div>

            <div class="wa-tabs">
                <button v-for="t in tabs" :key="t.k" :class="['wa-tab', { active: tab === t.k }]"
                    @click="tab = t.k; loadTab(t.k)">
                    {{ t.label }}
                </button>
            </div>

            <div class="wa-body">

                <!-- 概览 -->
                <div v-if="tab === 'stats'" class="wa-grid">
                    <div v-for="(v, k) in stats" :key="k" class="wa-stat-card">
                        <div class="wa-stat-val">{{ v }}</div>
                        <div class="wa-stat-key">{{ k }}</div>
                    </div>
                </div>

                <!-- 用户管理 -->
                <div v-if="tab === 'users'">
                    <div class="wa-toolbar">
                        <input v-model="userSearch" placeholder="搜索用户名…" class="wa-input" />
                    </div>
                    <table class="wa-table">
                        <thead>
                            <tr>
                                <th>uid</th>
                                <th>用户名</th>
                                <th>积分</th>
                                <th>管理员</th>
                                <th>注册时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in filteredUsers" :key="u.id">
                                <td>{{ u.id }}</td>
                                <td>{{ u.username }}</td>
                                <td>{{ u.points }}</td>
                                <td>{{ u.is_admin ? '✅' : '' }}</td>
                                <td>{{ u.registered_at ? new Date(u.registered_at).toLocaleDateString('zh-CN') : '-' }}
                                </td>
                                <td class="wa-actions">
                                    <button @click="openUserEdit(u)">编辑</button>
                                    <button class="wa-btn-del" @click="deleteUser(u)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- 编辑用户弹窗 -->
                    <div v-if="editUser" class="wa-modal-mask" @mousedown.self="editUser = null">
                        <div class="wa-modal">
                            <h3>编辑用户 uid={{ editUser.id }} {{ editUser.username }}</h3>
                            <div class="wa-form-row">
                                <label>新用户名</label>
                                <input v-model="editForm.username" class="wa-input" />
                                <button @click="doRename">改名</button>
                            </div>
                            <div class="wa-form-row">
                                <label>设置积分</label>
                                <input v-model.number="editForm.points" type="number" class="wa-input" />
                                <button @click="doSetPoints">设置</button>
                            </div>
                            <div class="wa-form-row">
                                <label>增减积分</label>
                                <input v-model.number="editForm.delta" type="number" class="wa-input"
                                    placeholder="负数减积分" />
                                <button @click="doAddPoints">增减</button>
                            </div>
                            <div class="wa-form-row">
                                <label>重置密码</label>
                                <input v-model="editForm.newPassword" class="wa-input" placeholder="新密码" />
                                <button @click="doResetPwd">重置</button>
                            </div>
                            <div class="wa-form-row">
                                <label>注销所有Token</label>
                                <button @click="doRevokeUserTokens">强制下线</button>
                            </div>
                            <div class="wa-modal-footer">
                                <button @click="editUser = null">关闭</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 充值订单 -->
                <div v-if="tab === 'orders'">
                    <div class="wa-toolbar">
                        <input v-model="orderKeyword" placeholder="搜索订单号或用户名…" class="wa-input"
                            @keyup.enter="searchOrders" />
                        <button @click="searchOrders">搜索</button>
                        <button @click="loadTab('orders')">重置</button>
                        <button @click="cleanupOrders" class="wa-btn-warn">清理7天前未认领</button>
                    </div>
                    <table class="wa-table">
                        <thead>
                            <tr>
                                <th>订单号</th>
                                <th>积分</th>
                                <th>金额</th>
                                <th>认领人</th>
                                <th>创建时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="o in orders" :key="o.order_no">
                                <td class="mono">{{ o.order_no }}</td>
                                <td>{{ o.points }}</td>
                                <td>¥{{ o.amount_yuan }}</td>
                                <td>{{ o.claimed_by ?? '未认领' }}</td>
                                <td>{{ fmt(o.created_at) }}</td>
                                <td class="wa-actions">
                                    <button v-if="o.claimed_by" @click="unclaimOrder(o.order_no)">撤销认领</button>
                                    <button class="wa-btn-del" @click="deleteOrder(o.order_no)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 计费日志 -->
                <div v-if="tab === 'billing'">
                    <div class="wa-toolbar">
                        <button @click="billingMode = 'history'; loadBillingHistory()">全部记录</button>
                        <button @click="billingMode = 'unsettled'; loadUnsettled()">未结算汇总</button>
                        <span class="wa-info" v-if="billingMode === 'history'">第 {{ billingPage }} / {{
                            billingTotalPages }} 页</span>
                        <button v-if="billingMode === 'history' && billingPage > 1"
                            @click="billingPage--; loadBillingHistory()">上一页</button>
                        <button v-if="billingMode === 'history' && billingPage < billingTotalPages"
                            @click="billingPage++; loadBillingHistory()">下一页</button>
                    </div>

                    <!-- 全部记录 -->
                    <table v-if="billingMode === 'history'" class="wa-table">
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>用户</th>
                                <th>提供商</th>
                                <th>固件</th>
                                <th>积分</th>
                                <th>结算</th>
                                <th>时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in billingRecords" :key="r.id">
                                <td>{{ r.id }}</td>
                                <td>{{ r.username }}</td>
                                <td class="mono">{{ r.provider_id.slice(0, 8) }}…</td>
                                <td>{{ r.firmware_id }}</td>
                                <td>{{ r.points }}</td>
                                <td>
                                    <button @click="toggleBillingStatus(r)">{{ r.settled ? '✅已结算' : '⏳未结算' }}</button>
                                </td>
                                <td>{{ fmt(r.created_at) }}</td>
                                <td><button class="wa-btn-del" @click="deleteBillingLog(r.id)">删除</button></td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- 未结算汇总 -->
                    <div v-if="billingMode === 'unsettled'">
                        <p>未结算总积分：<strong>{{ unsettledTotal }}</strong></p>
                        <table class="wa-table">
                            <thead>
                                <tr>
                                    <th>提供商ID</th>
                                    <th>固件ID</th>
                                    <th>笔数</th>
                                    <th>总积分</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="g in unsettledGroups" :key="g.provider_id + g.firmware_id">
                                    <td class="mono">{{ g.provider_id.slice(0, 8) }}…</td>
                                    <td>{{ g.firmware_id }}</td>
                                    <td>{{ g.count }}</td>
                                    <td>{{ g.total_points }}</td>
                                    <td><button @click="settleProvider(g.provider_id)">一键结算</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 激活缓存 -->
                <div v-if="tab === 'cache'">
                    <div class="wa-toolbar">
                        <button class="wa-btn-warn" @click="clearAllCache">清空全部缓存</button>
                    </div>
                    <table class="wa-table">
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>提供商</th>
                                <th>固件</th>
                                <th>MAC</th>
                                <th>时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="c in cacheList" :key="c.id">
                                <td>{{ c.id }}</td>
                                <td class="mono">{{ c.provider_id.slice(0, 8) }}…</td>
                                <td>{{ c.firmware_id }}</td>
                                <td class="mono">{{ c.mac }}</td>
                                <td>{{ fmt(c.created_at) }}</td>
                                <td><button class="wa-btn-del" @click="deleteCache(c.id)">删除</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 激活记录 -->
                <div v-if="tab === 'records'">
                    <table class="wa-table">
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>用户</th>
                                <th>user_uuid</th>
                                <th>提供商</th>
                                <th>固件</th>
                                <th>MAC</th>
                                <th>时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in activationRecords" :key="r.id">
                                <td>{{ r.id }}</td>
                                <td>{{ r.username ?? '[已注销]' }}</td>
                                <td class="mono">{{ (r.user_uuid || '').slice(0, 8) }}…</td>
                                <td class="mono">{{ r.provider_id.slice(0, 8) }}…</td>
                                <td>{{ r.firmware_id }}</td>
                                <td class="mono">{{ r.mac }}</td>
                                <td>{{ fmt(r.created_at) }}</td>
                                <td><button class="wa-btn-del" @click="deleteRecord(r.id)">删除</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 提供商管理 -->
                <div v-if="tab === 'providers'">
                    <div class="wa-toolbar">
                        <input v-model="newProviderName" placeholder="新提供商名称" class="wa-input" />
                        <button @click="createProvider">创建提供商</button>
                    </div>
                    <div v-for="prov in providers" :key="prov.uuid" class="wa-provider-card">
                        <div class="wa-provider-head">
                            <strong>{{ prov.name }}</strong>
                            <span class="mono wa-uuid">{{ prov.uuid }}</span>
                        </div>
                        <div class="wa-provider-body">
                            <div class="wa-form-row">
                                <input v-model="bindUsername[prov.uuid]" placeholder="绑定用户名" class="wa-input" />
                                <button @click="bindUser(prov.uuid)">绑定用户</button>
                            </div>
                            <div v-for="u in providerUsers[prov.uuid] ?? []" :key="u.id" class="wa-provider-user">
                                uid={{ u.id }} {{ u.username }}
                                <button class="wa-btn-del" @click="unbindUser(prov.uuid, u.id)">解绑</button>
                            </div>
                            <button @click="loadProviderUsers(prov.uuid)" class="wa-btn-sm">刷新绑定列表</button>
                        </div>
                    </div>
                </div>

            </div>
        </template>

        <div v-if="msg" class="wa-toast" :class="msgType" @click="msg = ''">{{ msg }}</div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { state } = useAuth()
const token = computed(() => state.token)
const username = computed(() => state.user?.username)
const isAdmin = computed(() => state.user?.is_admin === true)

const tab = ref('stats')
const tabs = [
    { k: 'stats', label: '概览' },
    { k: 'users', label: '用户' },
    { k: 'orders', label: '订单' },
    { k: 'billing', label: '计费' },
    { k: 'cache', label: '激活缓存' },
    { k: 'records', label: '激活记录' },
    { k: 'providers', label: '提供商' },
]

const msg = ref('')
const msgType = ref('info')
function toast(text, type = 'info') { msg.value = text; msgType.value = type; setTimeout(() => { msg.value = '' }, 3000) }

const API = (path) => `/api/admin${path}`

async function api(path, body = {}) {
    const res = await fetch(API(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.value, ...body }),
    })
    return res.json()
}

function fmt(ts) {
    if (!ts) return '-'
    return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

// ── 概览 ──────────────────────────────────────────────────────────────────────
const stats = ref({})
async function loadStats() {
    const d = await api('/stats')
    if (d.ok) {
        stats.value = {
            '用户总数': d.userCount,
            '在线Token': d.tokenCount,
            '充值订单': d.orderTotal,
            '已认领订单': d.orderClaimed,
            '全站积分': d.totalPoints,
            '激活缓存': d.cacheCount,
            '激活记录': d.recordCount,
        }
    }
}

// ── 用户 ──────────────────────────────────────────────────────────────────────
const users = ref([])
const userSearch = ref('')
const editUser = ref(null)
const editForm = reactive({ username: '', points: 0, delta: 0, newPassword: '' })
const filteredUsers = computed(() => {
    const kw = userSearch.value.toLowerCase()
    return kw ? users.value.filter(u => u.username.toLowerCase().includes(kw) || String(u.id).includes(kw)) : users.value
})

async function loadUsers() {
    const d = await api('/users/list')
    if (d.ok) users.value = d.users
}

function openUserEdit(u) {
    editUser.value = u
    editForm.username = u.username
    editForm.points = u.points
    editForm.delta = 0
    editForm.newPassword = ''
}

async function doRename() {
    const d = await api('/users/rename', { user_id: editUser.value.id, new_username: editForm.username })
    toast(d.ok ? d.message : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadUsers()
}

async function doSetPoints() {
    const d = await api('/users/set-points', { user_id: editUser.value.id, points: editForm.points })
    toast(d.ok ? d.message : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadUsers()
}

async function doAddPoints() {
    const d = await api('/users/add-points', { user_id: editUser.value.id, delta: editForm.delta })
    toast(d.ok ? `积分已更新：${d.points}` : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadUsers()
}

async function doResetPwd() {
    if (!editForm.newPassword) return toast('请输入新密码', 'err')
    const d = await api('/users/reset-password', { user_id: editUser.value.id, new_password: editForm.newPassword })
    toast(d.ok ? d.message : d.error, d.ok ? 'ok' : 'err')
}

async function doRevokeUserTokens() {
    const d = await api('/tokens/revoke-user', { user_id: editUser.value.id })
    toast(d.ok ? `已注销 ${d.count} 个Token` : d.error, d.ok ? 'ok' : 'err')
}

async function deleteUser(u) {
    if (!confirm(`确认删除用户 uid=${u.id} ${u.username}？\n账单和激活记录会保留。`)) return
    const d = await api('/users/delete', { user_id: u.id })
    toast(d.ok ? d.message : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) { editUser.value = null; loadUsers() }
}

// ── 订单 ──────────────────────────────────────────────────────────────────────
const orders = ref([])
const orderKeyword = ref('')

async function loadOrders() {
    const d = await api('/orders/list')
    if (d.ok) orders.value = d.orders
}

async function searchOrders() {
    if (!orderKeyword.value.trim()) return loadOrders()
    const d = await api('/orders/search', { keyword: orderKeyword.value.trim() })
    if (d.ok) orders.value = d.orders
}

async function unclaimOrder(order_no) {
    const d = await api('/orders/unclaim', { order_no })
    toast(d.ok ? d.message : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadOrders()
}

async function deleteOrder(order_no) {
    if (!confirm('确认删除订单 ' + order_no + '？')) return
    const d = await api('/orders/delete', { order_no })
    toast(d.ok ? d.message : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadOrders()
}

async function cleanupOrders() {
    const d = await api('/orders/cleanup-unclaimed')
    toast(d.ok ? `已清理 ${d.deleted} 条` : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadOrders()
}

// ── 计费日志 ──────────────────────────────────────────────────────────────────
const billingMode = ref('history')
const billingRecords = ref([])
const billingPage = ref(1)
const billingTotalPages = ref(1)
const unsettledGroups = ref([])
const unsettledTotal = ref(0)

async function loadBillingHistory() {
    billingMode.value = 'history'
    const d = await api('/billing/history', { page: billingPage.value })
    if (d.ok) { billingRecords.value = d.records; billingTotalPages.value = d.totalPages }
}

async function loadUnsettled() {
    billingMode.value = 'unsettled'
    const d = await api('/billing/unsettled')
    if (d.ok) { unsettledGroups.value = d.groups; unsettledTotal.value = d.totalPoints }
}

async function toggleBillingStatus(r) {
    const d = await api('/billing/set-status', { id: r.id, settled: !r.settled })
    if (d.ok) r.settled = r.settled ? 0 : 1
    toast(d.ok ? '已更新' : d.error, d.ok ? 'ok' : 'err')
}

async function deleteBillingLog(id) {
    if (!confirm('确认删除此账单记录？')) return
    const d = await api('/billing/delete-log', { id })
    toast(d.ok ? '已删除' : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadBillingHistory()
}

async function settleProvider(provider_id) {
    const d = await api('/billing/settle-provider', { provider_id })
    toast(d.ok ? `已结算 ${d.updated} 条` : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadUnsettled()
}

// ── 激活缓存 ──────────────────────────────────────────────────────────────────
const cacheList = ref([])

async function loadCache() {
    const d = await api('/activation-cache/list')
    if (d.ok) cacheList.value = d.cache
}

async function deleteCache(id) {
    const d = await api('/activation-cache/delete', { id })
    toast(d.ok ? '已删除' : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadCache()
}

async function clearAllCache() {
    if (!confirm('确认清空全部激活码缓存？')) return
    const d = await api('/activation-cache/clear-all')
    toast(d.ok ? `已清空 ${d.deleted} 条` : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadCache()
}

// ── 激活记录 ──────────────────────────────────────────────────────────────────
const activationRecords = ref([])

async function loadRecords() {
    const d = await api('/activation-records/list')
    if (d.ok) activationRecords.value = d.records
}

async function deleteRecord(id) {
    if (!confirm('确认删除？（该用户下次激活将重新收费）')) return
    const d = await api('/activation-records/delete', { id })
    toast(d.ok ? '已删除' : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadRecords()
}

// ── 提供商 ────────────────────────────────────────────────────────────────────
const providers = ref([])
const newProviderName = ref('')
const providerUsers = reactive({})
const bindUsername = reactive({})

async function loadProviders() {
    const d = await api('/providers/list')
    if (d.ok) {
        providers.value = d.providers
        for (const p of d.providers) loadProviderUsers(p.uuid)
    }
}

async function loadProviderUsers(uuid) {
    const d = await api('/providers/permissions/list', { provider_uuid: uuid })
    if (d.ok) providerUsers[uuid] = d.users
}

async function createProvider() {
    if (!newProviderName.value.trim()) return toast('请输入提供商名称', 'err')
    const d = await api('/providers/create', { name: newProviderName.value.trim() })
    toast(d.ok ? `创建成功，UUID: ${d.uuid}` : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) { newProviderName.value = ''; loadProviders() }
}

async function bindUser(uuid) {
    const un = (bindUsername[uuid] ?? '').trim()
    if (!un) return toast('请输入用户名', 'err')
    const d = await api('/providers/permissions/add', { provider_uuid: uuid, username: un })
    toast(d.ok ? d.message : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) { bindUsername[uuid] = ''; loadProviderUsers(uuid) }
}

async function unbindUser(uuid, user_id) {
    const d = await api('/providers/permissions/remove', { provider_uuid: uuid, user_id })
    toast(d.ok ? d.message : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) loadProviderUsers(uuid)
}

// ── 切换 Tab ──────────────────────────────────────────────────────────────────
function loadTab(k) {
    if (k === 'stats') loadStats()
    else if (k === 'users') loadUsers()
    else if (k === 'orders') loadOrders()
    else if (k === 'billing') loadBillingHistory()
    else if (k === 'cache') loadCache()
    else if (k === 'records') loadRecords()
    else if (k === 'providers') loadProviders()
}

onMounted(() => {
    if (isAdmin.value) loadStats()
})
</script>

<style scoped>
.wa-shell {
    max-width: 1200px;
    margin: 80px auto 40px;
    padding: 0 16px;
    font-size: 14px;
}

.wa-noperm {
    text-align: center;
    padding: 80px 20px;
}

.wa-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.wa-header h1 {
    font-size: 22px;
    margin: 0;
}

.wa-user {
    color: var(--color-text-muted, #888);
    font-size: 13px;
}

.wa-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 18px;
}

.wa-tab {
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid var(--color-border, #ddd);
    background: transparent;
    cursor: pointer;
    font-size: 13px;
}

.wa-tab.active {
    background: var(--color-primary, #6c63ff);
    color: #fff;
    border-color: transparent;
}

.wa-body {
    min-height: 300px;
}

.wa-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
}

.wa-stat-card {
    background: var(--color-surface, #f5f5f5);
    border-radius: 10px;
    padding: 18px 12px;
    text-align: center;
}

.wa-stat-val {
    font-size: 28px;
    font-weight: 700;
}

.wa-stat-key {
    font-size: 12px;
    color: var(--color-text-muted, #888);
    margin-top: 4px;
}

.wa-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    align-items: center;
}

.wa-input {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid var(--color-border, #ddd);
    background: transparent;
    font-size: 13px;
    min-width: 180px;
    color: inherit;
}

.wa-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.wa-table th {
    background: var(--color-surface, #f5f5f5);
    padding: 8px 10px;
    text-align: left;
    border-bottom: 2px solid var(--color-border, #ddd);
}

.wa-table td {
    padding: 7px 10px;
    border-bottom: 1px solid var(--color-border, #eee);
}

.wa-table tr:hover td {
    background: var(--color-surface, #fafafa);
}

.wa-actions {
    display: flex;
    gap: 6px;
}

button {
    padding: 4px 10px;
    border-radius: 5px;
    border: 1px solid var(--color-border, #ddd);
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    color: inherit;
}

button:hover {
    background: var(--color-surface, #f0f0f0);
}

.wa-btn-del {
    color: #e53935;
    border-color: #e53935;
}

.wa-btn-warn {
    color: #f57c00;
    border-color: #f57c00;
}

.wa-btn-sm {
    font-size: 12px;
    padding: 3px 8px;
}

.mono {
    font-family: monospace;
    font-size: 12px;
}

.wa-uuid {
    font-size: 11px;
    color: var(--color-text-muted, #999);
}

.wa-modal-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .45);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.wa-modal {
    background: var(--color-bg, #fff);
    border-radius: 12px;
    padding: 24px;
    min-width: 360px;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 40px rgba(0, 0, 0, .2);
}

.wa-modal h3 {
    margin: 0 0 16px;
    font-size: 16px;
}

.wa-form-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.wa-form-row label {
    min-width: 80px;
    font-size: 13px;
}

.wa-modal-footer {
    text-align: right;
    margin-top: 16px;
}

.wa-provider-card {
    border: 1px solid var(--color-border, #ddd);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 14px;
}

.wa-provider-head {
    display: flex;
    gap: 12px;
    align-items: baseline;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.wa-provider-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.wa-provider-user {
    font-size: 13px;
    display: flex;
    gap: 10px;
    align-items: center;
}

.wa-info {
    font-size: 13px;
    color: var(--color-text-muted, #888);
}

.wa-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    color: #fff;
    z-index: 99999;
    cursor: pointer;
}

.wa-toast.ok {
    background: #43a047;
}

.wa-toast.err {
    background: #e53935;
}

.wa-toast.info {
    background: #1976d2;
}
</style>