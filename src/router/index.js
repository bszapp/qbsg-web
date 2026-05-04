import { createRouter, createWebHashHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import NProgress from 'nprogress'
import { APP_BASE_PATH } from '../config/app.js'

// ---- SVG 图标组件（不设内联尺寸，由 CSS 统一控制）----
function svgIconRaw(children) {
  return defineComponent({
    render() {
      return h('svg', {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }, [h('g', { innerHTML: children })])
    }
  })
}

const DashboardIcon = svgIconRaw('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>')
const ShopIcon = svgIconRaw('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>')
const NodesIcon = svgIconRaw('<circle cx="12" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><circle cx="5" cy="19" r="3"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="13" x2="5" y2="19"/><line x1="12" y1="13" x2="19" y2="19"/>')
const OrdersIcon = svgIconRaw('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>')
const AccountIcon = svgIconRaw('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')
const MoreIcon = svgIconRaw('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>')

// 懒加载页面
const Dashboard = () => import('../views/Dashboard.vue')
const Shop = () => import('../views/Shop.vue')
const Nodes = () => import('../views/Nodes.vue')
const Orders = () => import('../views/Orders.vue')
const Account = () => import('../views/Account.vue')
const AccountSettings = () => import('../views/AccountSettings.vue')

export const navItems = [
  { path: '/', name: 'home', label: '主页', icon: DashboardIcon, component: Dashboard, requiresAuth: false },
  { path: '/shop', name: 'shop', label: '教程', icon: OrdersIcon, component: Shop, requiresAuth: false },
  { path: '/nodes', name: 'nodes', label: '固件', icon: NodesIcon, component: Nodes, requiresAuth: false },
  { path: '/activation', name: 'activation', label: '激活码', icon: ShopIcon, component: Orders, requiresAuth: true },
  { path: '/me', name: 'me', label: '我的', icon: AccountIcon, component: Account, requiresAuth: true },
]

const routes = [
  ...navItems.map((item) => ({
    path: item.path,
    name: item.name,
    component: item.component,
    meta: {
      requiresAuth: item.requiresAuth,
      navPath: item.path,
    },
  })),
  {
    path: '/me/settings',
    name: 'me-settings',
    component: AccountSettings,
    meta: {
      requiresAuth: true,
      navPath: '/me',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(APP_BASE_PATH),
  routes,
})

// NProgress 进度条（照抄原站行为）
NProgress.configure({ showSpinner: true, trickleSpeed: 200 })
router.beforeEach(() => { NProgress.start() })
router.afterEach(() => { NProgress.done() })

export default router
