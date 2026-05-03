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
          <div
            class="slider-indicator"
            :style="indicatorStyle"
          />
        </div>

        <!-- 导航项 -->
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="updateIndicator"
        >
          <span class="nav-icon">
            <component :is="item.icon" />
          </span>
          <span class="nav-text">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>
  </div>

  <!-- 右侧工具栏（固定右上角）-->
  <div class="top-toolbar no-select">
    <!-- 主题切换 -->
    <button
      class="theme-toggle"
      @click="toggleTheme"
      :title="isDark ? '切换亮色' : '切换暗色'"
    >
      <span class="theme-toggle-icon">
        <!-- 太阳 / 月亮 SVG -->
        <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </span>
    </button>

    <!-- 用户头像 + 下拉 -->
    <div class="user-avatar-container" ref="avatarRef">
      <div class="avatar-wrapper" @click.stop="toggleDropdown">
        <div class="avatar-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>

      <Transition name="fade">
        <div v-if="showDropdown" class="dropdown-menu" @click.stop>
          <div class="menu-item" @click="closeDropdown">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>个人资料</span>
          </div>
          <div class="menu-item" @click="closeDropdown">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>账户设置</span>
          </div>
          <div class="divider" />
          <div class="menu-item" @click="closeDropdown">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>退出登录</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>

  <!-- 主内容区 -->
  <div class="main-board">
    <div class="content-area">
      <RouterView v-slot="{ Component }">
        <Transition name="page-transition" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navItems } from '../router/index.js'

// ---- 站点配置 ----
const siteName = 'XFLTD'

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
const route = useRoute()
function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
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
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
    }
  })
}

watch(() => route.path, updateIndicator)
onMounted(() => {
  nextTick(updateIndicator)
  window.addEventListener('resize', updateIndicator)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateIndicator)
})

// ---- 下拉菜单 ----
const showDropdown = ref(false)
function toggleDropdown() { showDropdown.value = !showDropdown.value }
function closeDropdown() { showDropdown.value = false }
function handleOutsideClick(e) {
  const avatarEl = document.querySelector('.user-avatar-container')
  if (avatarEl && !avatarEl.contains(e.target)) {
    showDropdown.value = false
  }
}
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>
