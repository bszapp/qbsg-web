<template>
  <!-- 背景浮球装饰 -->
  <div class="background-decoration" aria-hidden="true">
    <div class="floating-ball ball-1" />
    <div class="floating-ball ball-2" />
    <div class="floating-ball ball-3" />
  </div>

  <!-- Logo（固定左上角）-->
  <RouterLink to="/" class="site-logo no-select">
    <img class="site-logo-img" src="/logo.png" alt="logo" />
    <span>{{ siteName }}</span>
  </RouterLink>

  <!-- 中央浮动导航（桌面顶部 / 移动端底部）-->
  <div class="slide-tabs-container no-select">
    <div class="slide-tabs-wrapper">
      <nav class="slide-tabs-nav" ref="navRef">
        <!-- 指示器 -->
        <div class="indicator-container">
          <div class="slider-indicator" :style="indicatorStyle" />
        </div>

        <!-- 导航项 -->
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" custom v-slot="{ href, navigate }">
          <a :href="href" class="nav-item" :class="{ active: isActive(item.path) }"
            @click="handleNavClick($event, item, navigate)">
            <span class="nav-icon">
              <component :is="item.icon" />
            </span>
            <span class="nav-text">{{ item.label }}</span>
          </a>
        </RouterLink>
      </nav>
    </div>
  </div>

  <!-- 右侧工具栏（固定右上角）-->
  <div class="top-toolbar no-select">
    <!-- 主题切换 -->
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色' : '切换暗色'">
      <span class="theme-toggle-icon">
        <!-- 太阳 / 月亮 SVG -->
        <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>

    <!-- 用户头像 + 下拉 -->
    <div class="user-avatar-container" ref="userMenuRef">
      <div class="avatar-wrapper" @click.stop="handleUserEntryClick">
        <div class="avatar-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <span class="user-pill-text">{{ displayName }}</span>
        <span v-if="isAuthenticated" class="user-pill-caret" :class="{ open: showDropdown }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      <Transition name="fade">
        <div v-if="showDropdown" class="dropdown-menu" @click.stop>
          <div class="menu-item" @click="goToMyPage">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="m16.24 16.24 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="m16.24 7.76 2.83-2.83" />
            </svg>
            <span>账户充值</span>
          </div>
          <div class="menu-item" @click="goToSettings">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>个人设置</span>
          </div>

          <!-- 管理后台二级菜单 -->
          <template v-if="state.user?.providers?.length || state.user?.is_admin">
            <div class="divider" />
            <div class="menu-item menu-item-parent" @click="toggleAdminSubmenu">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
              <span>管理后台</span>
              <svg class="menu-caret" :class="{ open: showAdminSubmenu }" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                style="width:14px;height:14px;margin-left:auto;transition:transform .2s">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <div v-if="showAdminSubmenu" class="submenu">
              <div v-for="p in (state.user?.providers ?? [])" :key="p.uuid" class="menu-item submenu-item"
                @click="goToProviderAdmin(p.uuid)">
                <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <span>{{ p.name }}</span>
              </div>
              <div v-if="state.user?.is_admin" class="menu-item submenu-item" @click="goToWebAdmin">
                <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
                <span>网站管理</span>
              </div>
            </div>
          </template>

          <div class="divider" />
          <div class="menu-item" @click="handleLogout">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>退出登录</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>

  <AuthGateModal :show="showAuthModal" :mode="authMode" @close="handleAuthModalClose"
    @switch-mode="authMode = $event" />

  <ConfettiOverlay />
  <ToastNotification />

  <!-- 固件页专用搜索栏（固定，与导航栏同级）-->
  <Transition name="page-transition">
    <div v-if="isGujianPage" ref="gujianSearchRef" class="gujian-search-fixed">
      <div class="gujian-search-input-wrap">
        <svg class="gujian-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input v-model="fwSearchQuery" class="gujian-search-input" type="text" placeholder="搜索固件名称或 ID…"
          autocomplete="off" spellcheck="false" />
        <button v-if="fwSearchQuery" class="gujian-search-clear" @click="fwSearchQuery = ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="gujian-filter-row">
        <span class="gujian-filter-label">作者</span>
        <div class="gujian-tag-scroll">
          <button :class="['gujian-tag-btn', fwActiveProvider === null ? 'gujian-tag-active' : '']"
            @click="fwActiveProvider = null">全部</button>
          <button v-for="p in fwAllProviders" :key="p"
            :class="['gujian-tag-btn', fwActiveProvider === p ? 'gujian-tag-active' : '']"
            @click="fwToggleProvider(p)">{{
              p }}</button>
        </div>
      </div>

      <div class="gujian-filter-row">
        <span class="gujian-filter-label">尺寸</span>
        <div class="gujian-tag-scroll">
          <button :class="['gujian-tag-btn', fwActiveSize === null ? 'gujian-tag-active' : '']"
            @click="fwActiveSize = null">全部</button>
          <button v-for="s in fwAllSizes" :key="s"
            :class="['gujian-tag-btn', 'gujian-tag-size', fwSizeTagClass(s), fwActiveSize === s ? 'gujian-tag-active' : '']"
            @click="fwToggleSize(s)">{{ s }}</button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 主内容区：固件页（自然撑开，无内部滚动）-->
  <Transition name="page-transition">
    <div v-if="isGujianPage" class="main-board main-board--gujian">
      <RouterView v-slot="{ Component }">
        <Transition name="page-transition" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </RouterView>
    </div>
  </Transition>

  <!-- 主内容区：其他页面 -->
  <Transition name="page-transition">
    <div v-if="!isGujianPage" class="main-board">
      <div class="content-area">
        <div v-if="showRouteLoading" class="auth-state-card">
          <p class="auth-state-title">正在验证登录状态</p>
          <p class="auth-state-desc">稍等一下，我们正在同步你的账户信息。</p>
        </div>

        <div v-else-if="showAuthRequired" class="auth-state-card">
          <div class="auth-required-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 1 1 8 0v3" />
            </svg>
          </div>
          <p class="auth-state-title">需要登录才能访问</p>
          <p class="auth-state-desc">此页面需要登录后才能查看，请先登录或注册账户。</p>
          <button class="auth-state-btn" @click="openAuthModal('login', false)">立即登录</button>
        </div>

        <RouterView v-else v-slot="{ Component }">
          <Transition name="page-transition" mode="out-in">
            <component :is="Component" :key="$route.path" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { navItems } from '../router/index.js'
import ToastNotification from './ToastNotification.vue'
import { useToast } from '../composables/useToast.js'
import AuthGateModal from './AuthGateModal.vue'
import { useAuth } from '../composables/useAuth.js'
import ConfettiOverlay from './ConfettiOverlay.vue'
import { useGujianFilter } from '../composables/useGujianFilter.js'

// ---- 站点配置 ----
const siteName = '签变时光'

// ---- 固件页筛选状态（与 Gujian.vue 共享）----
const {
  searchQuery: fwSearchQuery,
  activeProvider: fwActiveProvider,
  activeSize: fwActiveSize,
  allProviders: fwAllProviders,
  allSizes: fwAllSizes,
  toggleProvider: fwToggleProvider,
  toggleSize: fwToggleSize,
  sizeTagClass: fwSizeTagClass,
} = useGujianFilter()

// ---- 主题 ----
const isDark = ref(false)
function toggleTheme() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark-theme', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.body.classList.add('dark-theme')
  }
})

// ---- 导航路由 ----
const router = useRouter()
const route = useRoute()
const showAuthModal = ref(false)
const authMode = ref('login')
// true = 关闭弹窗且未登录时执行 router.back()（由路由鉴权触发时置为 true）
// false = 关闭弹窗不做额外跳转（由头像按钮或其他入口触发时保持 false）
const redirectBackOnClose = ref(false)
const {
  isAuthenticated,
  isReady,
  bootstrapAuth,
  logout,
  state,
  handleLoginToken,
} = useAuth()

// 管理菜单展开状态
const showAdminSubmenu = ref(false)

const hasPreviousInternalRoute = ref(false)
const previousRoute = ref(null)
router.beforeEach((to, from) => {
  if (from.name !== undefined) {
    hasPreviousInternalRoute.value = true
    previousRoute.value = from
  }
})

function isActive(path) {
  const activePath = route.meta.navPath || route.path

  if (path === '/') {
    return activePath === '/'
  }

  return activePath === path || activePath.startsWith(`${path}/`)
}

const showRouteLoading = computed(() => route.meta.requiresAuth && !isReady.value)
const showAuthRequired = computed(() => route.meta.requiresAuth && isReady.value && !isAuthenticated.value)
const displayName = computed(() => state.user?.username || '未登录')
const isGujianPage = computed(() => route.path === '/gujian' || route.meta?.navPath === '/gujian')

// ---- 固件搜索栏高度监测（设置 CSS 变量供布局使用）----
const gujianSearchRef = ref(null)
let fwSearchRo = null

watch(isGujianPage, (val) => {
  if (val) {
    nextTick(() => {
      if (gujianSearchRef.value) {
        fwSearchRo = new ResizeObserver(entries => {
          const h = entries[0].borderBoxSize?.[0]?.blockSize ?? entries[0].contentRect.height
          document.documentElement.style.setProperty('--fw-search-h', h + 'px')
        })
        fwSearchRo.observe(gujianSearchRef.value)
      }
    })
  } else {
    fwSearchRo?.disconnect()
    fwSearchRo = null
  }
}, { immediate: true })

function openAuthModal(mode = 'login', redirectBack = false) {
  authMode.value = mode
  redirectBackOnClose.value = redirectBack
  showAuthModal.value = true
  closeDropdown()
}

function handleAuthModalClose() {
  const shouldRedirectBack = redirectBackOnClose.value

  showAuthModal.value = false
  authMode.value = 'login'
  redirectBackOnClose.value = false

  if (shouldRedirectBack && !isAuthenticated.value) {
    const currentBase = window.location.href.split('#')[0]
    const prevRequiresAuth = previousRoute.value?.meta?.requiresAuth
    if (hasPreviousInternalRoute.value && !prevRequiresAuth) {
      router.back()
    } else {
      window.location.replace(currentBase + '#/')
    }
  }
}

// 导航项点击：无条件放行，让路由守卫决定是否弹出登录框
function handleNavClick(event, item, navigate) {
  navigate(event)
}

function handleRouteAuthGate() {
  if (!isReady.value) {
    return
  }

  // 落地在需要登录的页面但未登录时弹出登录框；
  // redirectBack=true 表示关闭弹窗且未登录时执行 router.back()
  if (route.meta.requiresAuth && !isAuthenticated.value) {
    openAuthModal('login', true)
  }
}

// ---- 滑动指示器 ----
const navRef = ref(null)
const indicatorStyle = ref({
  transform: 'translateX(0px)',
  width: '0px',
  opacity: '0',
  transition: 'none',
})

function updateIndicator() {
  nextTick(() => {
    if (!navRef.value) return
    const activeEl = navRef.value.querySelector('.nav-item.active')
    if (!activeEl) {
      indicatorStyle.value = { ...indicatorStyle.value, opacity: '0' }
      return
    }
    const navRect = navRef.value.getBoundingClientRect()
    const elRect = activeEl.getBoundingClientRect()
    const left = elRect.left - navRect.left
    indicatorStyle.value = {
      transform: `translateX(${left}px)`,
      width: `${elRect.width}px`,
      opacity: '1',
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), width 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
    }
  })
}

watch(() => route.path, updateIndicator)
watch(() => [route.fullPath, isReady.value, isAuthenticated.value], handleRouteAuthGate, { immediate: true })
watch(() => [route.meta.requiresAuth, isAuthenticated.value], ([requiresAuth, authenticated]) => {
  if ((!requiresAuth || authenticated) && showAuthModal.value) {
    showAuthModal.value = false
    redirectBackOnClose.value = false
  }
})

// token 在当前页被清除（如过期）时，若处于需要登录的页面，自动弹出登录框
watch(isAuthenticated, (newVal, oldVal) => {
  console.group('[AppLayout] isAuthenticated watcher 触发')
  console.log('oldVal:', oldVal, '→ newVal:', newVal)
  console.log('route.path:', route.path, '| route.meta.requiresAuth:', route.meta.requiresAuth)
  console.log('条件满足（应弹窗）:', oldVal === true && newVal === false && route.meta.requiresAuth)
  if (oldVal === true && newVal === false && route.meta.requiresAuth) {
    console.log('→ 执行 openAuthModal')
    openAuthModal('login', true)
  }
  console.groupEnd()
})

onMounted(() => {
  nextTick(updateIndicator)
  window.addEventListener('resize', updateIndicator)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateIndicator)
})

// ---- 下拉菜单 ----
const showDropdown = ref(false)
const userMenuRef = ref(null)

function toggleDropdown() { showDropdown.value = !showDropdown.value }
function closeDropdown() { showDropdown.value = false }

function goToMyPage() {
  closeDropdown()
  router.push('/me')
}

function goToSettings() {
  closeDropdown()
  router.push('/me/settings')
}

function goToProviderAdmin(uuid) {
  closeDropdown()
  router.push('/me/provideradmin?id=' + uuid)
}

function goToWebAdmin() {
  closeDropdown()
  router.push('/me/webadmin')
}

function toggleAdminSubmenu(e) {
  e.stopPropagation()
  showAdminSubmenu.value = !showAdminSubmenu.value
}

async function handleLogout() {
  closeDropdown()
  showAuthModal.value = false
  redirectBackOnClose.value = false

  if (route.meta.requiresAuth && route.path !== '/') {
    await router.replace('/')
  }

  await logout()
}

function handleUserEntryClick() {
  if (!isAuthenticated.value) {
    openAuthModal('login', false)
    return
  }

  toggleDropdown()
}

function handleOutsideClick(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}

function handlePaymentReturnRoute() {
  const params = new URLSearchParams(window.location.search)

  if (params.get('callback_target') === 'me' && !route.path.startsWith('/me')) {
    router.replace('/me')
  }
}

onMounted(async () => {
  document.addEventListener('click', handleOutsideClick)
  await bootstrapAuth()
  handlePaymentReturnRoute()
  updateIndicator()
  // 处理 URL 中的 logintoken 参数
  const { showToast } = useToast()
  handleLoginToken((msg, type, dur) => showToast(msg, type, dur))
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  fwSearchRo?.disconnect()
})
</script>

<style scoped>
.auth-state-card {
  margin: 32px auto 0;
  max-width: 520px;
  padding: 28px 24px;
  border-radius: 26px;
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow: 0 18px 48px rgba(12, 24, 48, 0.1);
  backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.auth-required-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 16px;
  background: rgba(var(--theme-color-rgb), 0.08);
  color: var(--theme-color);
}

.auth-required-icon svg {
  width: 28px;
  height: 28px;
}

.auth-state-btn {
  margin-top: 20px;
  padding: 10px 28px;
  border-radius: 999px;
  border: none;
  background-color: var(--theme-color);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.auth-state-btn:hover {
  opacity: 0.88;
}

.auth-state-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
}

.auth-state-desc {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--secondary-text-color);
}

.avatar-wrapper {
  border-radius: 999px;
  padding: 0 10px 0 6px;
}

.user-pill-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}

.user-pill-caret {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--secondary-text-color);
  transition: transform 0.2s ease;
}

.user-pill-caret.open {
  transform: rotate(180deg);
}

.user-pill-caret svg {
  width: 14px;
  height: 14px;
}

.dropdown-menu {
  width: 210px;
  margin-top: 4px;
}

.menu-item-parent {
  cursor: pointer;
}

.submenu {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  margin: 2px 4px;
}

.submenu-item {
  padding-left: 28px !important;
  font-size: 13px;
}

.menu-caret.open {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .user-pill {
    min-height: 38px;
    padding-right: 12px;
  }

  .dropdown-menu {
    width: 196px;
  }
}
</style>
