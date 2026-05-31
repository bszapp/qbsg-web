<template>
  <Teleport to="body">
    <Transition name="auth-popup-fade">
      <div v-if="show" class="auth-popup-overlay" @click.self="emitClose">
        <Transition name="auth-popup-slide" appear>
          <div v-if="show" class="auth-popup-container">
            <div class="auth-popup-header">
              <h2 class="popup-title">{{ mode === 'login' ? '登录' : '创建账户' }}</h2>

              <button class="popup-close-btn" type="button" @click="emitClose">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AuthPanel :mode="mode" :enable-remember-me="true" :login-action="handleLogin"
              :register-action="handleRegister" @switch-mode="toggleMode" @auth-success="emitClose" />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { toRefs } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import AuthPanel from './AuthPanel.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'login',
  },
})

const { show, mode } = toRefs(props)
const emit = defineEmits(['close', 'switch-mode'])

const { login, register } = useAuth()

function emitClose() {
  emit('close')
}

function toggleMode() {
  emit('switch-mode', mode.value === 'login' ? 'register' : 'login')
}

function handleLogin(payload) {
  return login(payload)
}

function handleRegister(payload) {
  return register(payload)
}
</script>

<style scoped>
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
  animation: modal-in-03fee79b 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-popup-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(var(--theme-color-rgb), 0.03);
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

@keyframes modal-in-03fee79b {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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
    max-height: 85vh;
  }

  .auth-popup-header {
    padding: 15px;
  }

  .popup-title {
    font-size: 16px;
  }
}
</style>
