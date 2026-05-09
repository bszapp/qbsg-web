<template>
    <div class="page-shell">
        <div class="page-stack">

            <!-- 无权限 -->
            <div v-if="!isAdmin" class="no-permission-card">
                <div class="no-perm-icon">⛔</div>
                <h2>无访问权限</h2>
                <p>当前账号没有网站管理员权限。</p>
                <button class="primary-button" @click="$router.push('/')">返回主页</button>
            </div>

            <template v-else>
                <!-- 主分类 Tab -->
                <div class="tab-bar">
                    <button v-for="cat in categories" :key="cat.k" :class="['tab-btn', { active: mainTab === cat.k }]"
                        @click="switchMain(cat.k)">
                        {{ cat.label }}
                    </button>
                </div>

                <!-- ── 结算管理 ── -->
                <template v-if="mainTab === 'billing'">
                    <div class="sub-bar">
                        <button :class="['sub-btn', { active: billingTab === 'history' }]"
                            @click="switchBilling('history')">结算列表</button>
                        <button :class="['sub-btn', { active: billingTab === 'unsettled' }]"
                            @click="switchBilling('unsettled')">未结算清单</button>
                    </div>

                    <!-- 结算列表 -->
                    <div v-if="billingTab === 'history'" class="panel-card">
                        <div class="section-header">
                            <h2 class="section-title">结算列表</h2>
                            <div class="hdr-actions">
                                <span class="muted-text">第 {{ billingPage }} / {{ billingTotalPages }} 页</span>
                                <button v-if="billingPage > 1" class="secondary-button small-btn"
                                    @click="billingPage--; loadBillingHistory()">上一页</button>
                                <button v-if="billingPage < billingTotalPages" class="secondary-button small-btn"
                                    @click="billingPage++; loadBillingHistory()">下一页</button>
                            </div>
                        </div>
                        <div class="table-wrap">
                            <table class="wa-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>用户</th>
                                        <th>提供商</th>
                                        <th>固件</th>
                                        <th>积分</th>
                                        <th>结算状态</th>
                                        <th>时间</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="r in billingRecords" :key="r.id">
                                        <td class="muted-text">{{ r.id }}</td>
                                        <td>{{ r.username }}</td>
                                        <td>{{ providerName(r.provider_id) }}</td>
                                        <td class="mono">{{ r.firmware_id }}</td>
                                        <td><span class="pts-badge">{{ r.points }}</span></td>
                                        <td>
                                            <button :class="['status-btn', r.settled ? 'settled' : 'pending']"
                                                @click="toggleBillingStatus(r)">
                                                {{ r.settled ? '✅ 已结算' : '⏳ 未结算' }}
                                            </button>
                                        </td>
                                        <td class="muted-text">{{ fmt(r.created_at) }}</td>
                                        <td>
                                            <button class="danger-text-btn" @click="deleteBillingLog(r.id)">删除</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 未结算清单 -->
                    <div v-if="billingTab === 'unsettled'">
                        <div class="total-banner">
                            未结算总积分：<strong class="pts-highlight">{{ unsettledTotal }}</strong>
                        </div>
                        <div v-if="providerGroups.length === 0" class="state-text">暂无未结算记录</div>
                        <div v-for="grp in providerGroups" :key="grp.provider_id" class="group-block">
                            <div class="group-header">
                                <div class="group-meta">
                                    <strong class="group-label">{{ providerName(grp.provider_id) }}</strong>
                                    <span class="muted-text">
                                        共 {{ grp.rows.length }} 种固件 · 总积分
                                        <strong class="pts-highlight">{{ grp.totalPoints }}</strong>
                                    </span>
                                </div>
                                <button class="primary-button small-btn" @click="settleProvider(grp.provider_id)">
                                    一键结算此组
                                </button>
                            </div>
                            <div class="table-wrap" style="padding:0 14px 14px">
                                <table class="wa-table">
                                    <thead>
                                        <tr>
                                            <th>固件 ID</th>
                                            <th>笔数</th>
                                            <th>积分小计</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="g in grp.rows" :key="g.firmware_id">
                                            <td class="mono">{{ g.firmware_id }}</td>
                                            <td>{{ g.count }}</td>
                                            <td><span class="pts-badge">{{ g.total_points }}</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- ── 用户管理 ── -->
                <template v-if="mainTab === 'users'">
                    <div class="sub-bar">
                        <button :class="['sub-btn', { active: usersTab === 'orders' }]"
                            @click="switchUsers('orders')">充值订单</button>
                        <button :class="['sub-btn', { active: usersTab === 'list' }]"
                            @click="switchUsers('list')">用户列表</button>
                        <button :class="['sub-btn', { active: usersTab === 'cache' }]"
                            @click="switchUsers('cache')">激活缓存</button>
                        <button :class="['sub-btn', { active: usersTab === 'records' }]"
                            @click="switchUsers('records')">激活记录</button>
                    </div>

                    <!-- 充值订单 -->
                    <div v-if="usersTab === 'orders'" class="panel-card">
                        <div class="section-header">
                            <h2 class="section-title">充值订单</h2>
                            <div class="hdr-actions">
                                <input v-model="orderKeyword" placeholder="搜索订单号或用户名…" class="inline-input"
                                    @keyup.enter="searchOrders" />
                                <button @click="searchOrders" class="secondary-button small-btn">搜索</button>
                                <button @click="loadOrders" class="secondary-button small-btn">重置</button>
                                <button @click="cleanupOrders" class="warn-btn">清理7天前未认领</button>
                            </div>
                        </div>
                        <div class="table-wrap">
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
                                        <td><span class="pts-badge">{{ o.points }}</span></td>
                                        <td>¥{{ o.amount_yuan }}</td>
                                        <td>{{ o.claimed_by ?? '未认领' }}</td>
                                        <td class="muted-text">{{ fmt(o.created_at) }}</td>
                                        <td class="actions-cell">
                                            <button v-if="o.claimed_by" class="secondary-button small-btn"
                                                @click="unclaimOrder(o.order_no)">撤销认领</button>
                                            <button class="danger-text-btn" @click="deleteOrder(o.order_no)">删除</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 用户列表 -->
                    <div v-if="usersTab === 'list'" class="panel-card">
                        <div class="section-header">
                            <h2 class="section-title">用户列表</h2>
                            <input v-model="userSearch" placeholder="搜索用户名…" class="inline-input" />
                        </div>
                        <div class="table-wrap">
                            <table class="wa-table">
                                <thead>
                                    <tr>
                                        <th>用户名</th>
                                        <th>积分</th>
                                        <th>管理员</th>
                                        <th>注册时间</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="u in filteredUsers" :key="u.id">
                                        <td>{{ u.username }}</td>
                                        <td><span class="pts-badge">{{ u.points }}</span></td>
                                        <td>{{ u.is_admin ? '✅' : '' }}</td>
                                        <td class="muted-text">{{ u.registered_at ? new
                                            Date(u.registered_at).toLocaleDateString('zh-CN') : '-' }}</td>
                                        <td class="actions-cell">
                                            <button class="secondary-button small-btn"
                                                @click="openUserEdit(u)">编辑</button>
                                            <button class="danger-text-btn" @click="deleteUser(u)">删除</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 激活缓存 -->
                    <div v-if="usersTab === 'cache'" class="panel-card">
                        <div class="section-header">
                            <h2 class="section-title">激活缓存</h2>
                            <button class="warn-btn" @click="clearAllCache">清空全部缓存</button>
                        </div>
                        <div class="table-wrap">
                            <table class="wa-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>提供商</th>
                                        <th>固件</th>
                                        <th>MAC</th>
                                        <th>时间</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="c in cacheList" :key="c.id">
                                        <td class="muted-text">{{ c.id }}</td>
                                        <td>{{ providerName(c.provider_id) }}</td>
                                        <td class="mono">{{ c.firmware_id }}</td>
                                        <td class="mono">{{ c.mac }}</td>
                                        <td class="muted-text">{{ fmt(c.created_at) }}</td>
                                        <td><button class="danger-text-btn" @click="deleteCache(c.id)">删除</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 激活记录 -->
                    <div v-if="usersTab === 'records'" class="panel-card">
                        <div class="section-header">
                            <h2 class="section-title">激活记录</h2>
                        </div>
                        <div class="table-wrap">
                            <table class="wa-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>用户</th>
                                        <th>提供商</th>
                                        <th>固件</th>
                                        <th>MAC</th>
                                        <th>时间</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="r in activationRecords" :key="r.id">
                                        <td class="muted-text">{{ r.id }}</td>
                                        <td>{{ r.username ?? '[已注销]' }}</td>
                                        <td>{{ providerName(r.provider_id) }}</td>
                                        <td class="mono">{{ r.firmware_id }}</td>
                                        <td class="mono">{{ r.mac }}</td>
                                        <td class="muted-text">{{ fmt(r.created_at) }}</td>
                                        <td><button class="danger-text-btn" @click="deleteRecord(r.id)">删除</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 用户编辑弹窗 -->
                    <Teleport to="body">
                        <Transition name="modal-fade">
                            <div v-if="editUser" class="modal-overlay" @mousedown.self="editUser = null">
                                <div class="modal-container">
                                    <div class="modal-header">
                                        <h2 class="modal-title">编辑用户：{{ editUser.username }}</h2>
                                        <button class="popup-close-btn" @click="editUser = null">✕</button>
                                    </div>
                                    <div class="modal-body">
                                        <div class="field-group">
                                            <label class="field-label">新用户名</label>
                                            <div class="input-row">
                                                <input v-model="editForm.username" class="text-input flex1" />
                                                <button @click="doRename" class="secondary-button">改名</button>
                                            </div>
                                        </div>
                                        <div class="field-group">
                                            <label class="field-label">设置积分</label>
                                            <div class="input-row">
                                                <input v-model.number="editForm.points" type="number"
                                                    class="text-input flex1" />
                                                <button @click="doSetPoints" class="secondary-button">设置</button>
                                            </div>
                                        </div>
                                        <div class="field-group">
                                            <label class="field-label">增减积分</label>
                                            <div class="input-row">
                                                <input v-model.number="editForm.delta" type="number"
                                                    class="text-input flex1" placeholder="负数减积分" />
                                                <button @click="doAddPoints" class="secondary-button">增减</button>
                                            </div>
                                        </div>
                                        <div class="field-group">
                                            <label class="field-label">重置密码</label>
                                            <div class="input-row">
                                                <input v-model="editForm.newPassword" class="text-input flex1"
                                                    placeholder="新密码" />
                                                <button @click="doResetPwd" class="secondary-button">重置</button>
                                            </div>
                                        </div>
                                        <div class="field-group">
                                            <label class="field-label">强制下线</label>
                                            <button @click="doRevokeUserTokens" class="warn-btn">注销所有 Token</button>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button class="secondary-button" @click="editUser = null">关闭</button>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </Teleport>
                </template>

                <!-- ── 提供商管理 ── -->
                <template v-if="mainTab === 'providers'">
                    <div class="panel-card">
                        <div class="section-header">
                            <h2 class="section-title">创建提供商</h2>
                        </div>
                        <div class="input-row">
                            <input v-model="newProviderName" placeholder="新提供商名称" class="text-input flex1" />
                            <button @click="createProvider" class="primary-button">创建提供商</button>
                        </div>
                    </div>

                    <div v-if="providers.length === 0" class="state-text">暂无提供商</div>
                    <div v-for="prov in providers" :key="prov.uuid" class="group-block">
                        <div class="group-header">
                            <div class="group-meta">
                                <strong class="group-label">{{ prov.name }}</strong>
                            </div>
                        </div>
                        <div class="provider-body">
                            <div class="input-row" style="margin-bottom:10px">
                                <input v-model="bindUsername[prov.uuid]" placeholder="输入用户名以绑定"
                                    class="text-input flex1" />
                                <button @click="bindUser(prov.uuid)" class="secondary-button">绑定用户</button>
                            </div>
                            <div v-for="u in providerUsers[prov.uuid] ?? []" :key="u.id" class="provider-user-row">
                                <span>{{ u.username }}</span>
                                <button class="danger-text-btn" @click="unbindUser(prov.uuid, u.id)">解绑</button>
                            </div>
                            <button @click="loadProviderUsers(prov.uuid)" class="text-action-btn">↻ 刷新绑定列表</button>
                        </div>
                    </div>
                </template>

            </template><!-- end v-else isAdmin -->
        </div><!-- end page-stack -->
    </div><!-- end page-shell -->

    <!-- Toast -->
    <div v-if="msg" class="wa-toast" :class="msgType" @click="msg = ''">{{ msg }}</div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { state } = useAuth()
const token = computed(() => state.token)
const isAdmin = computed(() => state.user?.is_admin === true)

// ── 分类 Tab ──────────────────────────────────────────────────────────────────
const mainTab = ref('billing')
const billingTab = ref('history')
const usersTab = ref('orders')

const categories = [
    { k: 'billing', label: '结算管理' },
    { k: 'users', label: '用户管理' },
    { k: 'providers', label: '提供商管理' },
]

function switchMain(k) {
    mainTab.value = k
    if (k === 'billing') { ensureProviders(); switchBilling(billingTab.value) }
    else if (k === 'users') switchUsers(usersTab.value)
    else if (k === 'providers') loadProviders()
}

function switchBilling(sub) {
    billingTab.value = sub
    if (sub === 'history') loadBillingHistory()
    else loadUnsettled()
}

function switchUsers(sub) {
    usersTab.value = sub
    if (sub === 'orders') loadOrders()
    else if (sub === 'list') loadUsers()
    else if (sub === 'cache') loadCache()
    else if (sub === 'records') loadRecords()
}

// ── Toast ──────────────────────────────────────────────────────────────────
const msg = ref('')
const msgType = ref('info')
function toast(text, type = 'info') {
    msg.value = text; msgType.value = type
    setTimeout(() => { msg.value = '' }, 3000)
}

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

// ── 提供商列表（用于名称查找）─────────────────────────────────────────────
const providers = ref([])
let providersLoaded = false

function providerName(uuid) {
    return providers.value.find(p => p.uuid === uuid)?.name ?? (uuid ? uuid.slice(0, 8) + '…' : '-')
}

async function ensureProviders() {
    if (!providersLoaded) await loadProviders()
}

// ── 计费日志 ───────────────────────────────────────────────────────────────
const billingRecords = ref([])
const billingPage = ref(1)
const billingTotalPages = ref(1)
const unsettledGroups = ref([])
const unsettledTotal = ref(0)

const providerGroups = computed(() => {
    const map = {}
    for (const g of unsettledGroups.value) {
        if (!map[g.provider_id]) {
            map[g.provider_id] = { provider_id: g.provider_id, rows: [], totalPoints: 0 }
        }
        map[g.provider_id].rows.push(g)
        map[g.provider_id].totalPoints += Number(g.total_points)
    }
    return Object.values(map)
})

async function loadBillingHistory() {
    const d = await api('/billing/history', { page: billingPage.value })
    if (d.ok) { billingRecords.value = d.records; billingTotalPages.value = d.totalPages }
}

async function loadUnsettled() {
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

// ── 充值订单 ───────────────────────────────────────────────────────────────
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

// ── 用户列表 ───────────────────────────────────────────────────────────────
const users = ref([])
const userSearch = ref('')
const editUser = ref(null)
const editForm = reactive({ username: '', points: 0, delta: 0, newPassword: '' })
const filteredUsers = computed(() => {
    const kw = userSearch.value.toLowerCase()
    return kw ? users.value.filter(u => u.username.toLowerCase().includes(kw)) : users.value
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
    if (!confirm(`确认删除用户 ${u.username}？\n账单和激活记录会保留。`)) return
    const d = await api('/users/delete', { user_id: u.id })
    toast(d.ok ? d.message : d.error, d.ok ? 'ok' : 'err')
    if (d.ok) { editUser.value = null; loadUsers() }
}

// ── 激活缓存 ───────────────────────────────────────────────────────────────
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

// ── 激活记录 ───────────────────────────────────────────────────────────────
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

// ── 提供商管理 ─────────────────────────────────────────────────────────────
const newProviderName = ref('')
const providerUsers = reactive({})
const bindUsername = reactive({})

async function loadProviders() {
    const d = await api('/providers/list')
    if (d.ok) {
        providers.value = d.providers
        providersLoaded = true
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
    toast(d.ok ? `创建成功` : d.error, d.ok ? 'ok' : 'err')
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

// ── 初始化 ─────────────────────────────────────────────────────────────────
onMounted(() => {
    if (isAdmin.value) {
        loadProviders()      // 预加载提供商，用于名称显示
        loadBillingHistory() // 默认显示结算列表
    }
})
</script>

<style scoped>
/* ── 无权限 ── */
.no-permission-card {
    max-width: 480px;
    margin: 60px auto 0;
    text-align: center;
    padding: 48px 28px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    background: rgba(var(--card-background-rgb), 0.6);
}

.no-perm-icon {
    font-size: 52px;
    margin-bottom: 16px;
}

.no-permission-card h2 {
    margin: 0 0 12px;
    font-size: 22px;
    color: var(--text-color);
}

.no-permission-card p {
    color: var(--secondary-text-color);
    margin: 0 0 24px;
    font-size: 14px;
    line-height: 1.7;
}

/* ── 主 Tab ── */
.tab-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.tab-btn {
    padding: 8px 22px;
    border-radius: 999px;
    border: 1px solid rgba(var(--text-color-rgb), 0.12);
    background: transparent;
    color: var(--secondary-text-color);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tab-btn.active {
    background: var(--theme-color);
    color: #fff;
    border-color: var(--theme-color);
}

.tab-btn:hover:not(.active) {
    border-color: var(--theme-color);
    color: var(--theme-color);
}

/* ── 二级 Tab ── */
.sub-bar {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.sub-btn {
    padding: 5px 16px;
    border-radius: 999px;
    border: 1px solid rgba(var(--text-color-rgb), 0.1);
    background: transparent;
    color: var(--secondary-text-color);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.sub-btn.active {
    background: rgba(var(--theme-color-rgb), 0.12);
    color: var(--theme-color);
    border-color: rgba(var(--theme-color-rgb), 0.3);
}

.sub-btn:hover:not(.active) {
    border-color: var(--theme-color);
    color: var(--theme-color);
}

/* ── Section header ── */
.hdr-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
}

/* ── 表格 ── */
.table-wrap {
    overflow-x: auto;
}

.wa-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.wa-table th {
    background: rgba(var(--text-color-rgb), 0.04);
    padding: 9px 12px;
    text-align: left;
    font-weight: 600;
    color: var(--secondary-text-color);
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
}

.wa-table td {
    padding: 9px 12px;
    border-bottom: 1px solid rgba(var(--text-color-rgb), 0.06);
    color: var(--text-color);
}

.wa-table tr:last-child td {
    border-bottom: none;
}

.wa-table tr:hover td {
    background: rgba(var(--text-color-rgb), 0.02);
}

/* ── 工具类 ── */
.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
}

.muted-text {
    color: var(--secondary-text-color);
    font-size: 12px;
}

.actions-cell {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
}

.flex1 {
    flex: 1;
    min-width: 0;
}

/* ── 积分徽章 ── */
.pts-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(var(--theme-color-rgb), 0.1);
    color: var(--theme-color);
    font-size: 12px;
    font-weight: 700;
}

.pts-highlight {
    color: var(--theme-color);
    font-weight: 700;
}

/* ── 状态切换按钮 ── */
.status-btn {
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
}

.status-btn.settled {
    border-color: #16a34a;
    color: #16a34a;
}

.status-btn.pending {
    border-color: #d97706;
    color: #d97706;
}

/* ── 危险文字按钮 ── */
.danger-text-btn {
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.danger-text-btn:hover {
    background: rgba(239, 68, 68, 0.1);
}

/* ── 警告按钮 ── */
.warn-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid rgba(217, 119, 6, 0.35);
    background: rgba(217, 119, 6, 0.08);
    color: #d97706;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.warn-btn:hover {
    background: rgba(217, 119, 6, 0.18);
}

/* ── small-btn 修饰符 ── */
.small-btn {
    padding: 5px 12px !important;
    font-size: 12px !important;
    min-height: unset !important;
}

/* ── 内联搜索输入 ── */
.inline-input {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(var(--text-color-rgb), 0.1);
    background: rgba(var(--text-color-rgb), 0.04);
    color: var(--text-color);
    font-size: 13px;
    min-width: 180px;
    outline: none;
    transition: border-color 0.2s;
}

.inline-input:focus {
    border-color: rgba(var(--theme-color-rgb), 0.4);
}

.inline-input::placeholder {
    color: rgba(var(--text-color-rgb), 0.4);
}

/* ── 未结算总计横幅 ── */
.total-banner {
    padding: 14px 18px;
    border-radius: 14px;
    background: rgba(var(--theme-color-rgb), 0.07);
    border: 1px solid rgba(var(--theme-color-rgb), 0.18);
    font-size: 14px;
    color: var(--secondary-text-color);
}

/* ── 提供商分组卡片 ── */
.group-block {
    border: 1px solid rgba(var(--text-color-rgb), 0.08);
    border-radius: 16px;
    overflow: hidden;
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: rgba(var(--text-color-rgb), 0.025);
    gap: 12px;
    flex-wrap: wrap;
}

.group-meta {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.group-label {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-color);
}

/* ── 提供商管理体 ── */
.provider-body {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.provider-user-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(var(--text-color-rgb), 0.03);
    font-size: 13px;
    color: var(--text-color);
}

.text-action-btn {
    background: transparent;
    border: none;
    color: var(--secondary-text-color);
    font-size: 12px;
    cursor: pointer;
    padding: 4px 0;
    text-align: left;
    transition: color 0.2s;
}

.text-action-btn:hover {
    color: var(--theme-color);
}

/* ── input + button 行 ── */
.input-row {
    display: flex;
    gap: 10px;
    align-items: center;
}

/* ── 空状态 ── */
.state-text {
    padding: 40px 24px;
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 14px;
}

/* ── 弹窗 ── */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    backdrop-filter: blur(4px);
}

.modal-container {
    width: 100%;
    max-width: 520px;
    background: rgba(var(--card-background-rgb), 1);
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
    border: 1px solid rgba(var(--theme-color-rgb), 0.15);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    overflow: hidden;
}

.modal-header {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
}

.modal-title {
    margin: 0;
    font-size: 17px;
    color: var(--text-color);
    font-weight: 700;
}

.popup-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text-color);
    font-size: 16px;
    padding: 6px 10px;
    border-radius: 8px;
    transition: all 0.2s;
}

.popup-close-btn:hover {
    background: rgba(var(--text-color-rgb), 0.08);
    color: var(--text-color);
}

.modal-body {
    padding: 20px 24px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-shrink: 0;
}

.modal-fade-enter-active {
    transition: opacity 0.22s ease;
}

.modal-fade-leave-active {
    transition: opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

/* ── Toast ── */
.wa-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 22px;
    border-radius: 10px;
    font-size: 14px;
    color: #fff;
    z-index: 99999;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, .2);
}

.wa-toast.ok {
    background: #16a34a;
}

.wa-toast.err {
    background: #dc2626;
}

.wa-toast.info {
    background: var(--theme-color);
}

@media (max-width: 600px) {
    .hdr-actions {
        gap: 6px;
    }

    .inline-input {
        min-width: 120px;
    }

    .group-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>