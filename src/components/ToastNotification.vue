<template>
  <svg
    version="1.1"
    style="position: absolute; width: 0; height: 0; overflow: hidden"
    aria-hidden="true"
  >
    <defs>
      <symbol id="icon-check-circle" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </symbol>
      <symbol id="icon-error-circle" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </symbol>
      <symbol id="icon-warning" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </symbol>
      <symbol id="icon-info-circle" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </symbol>
    </defs>
  </svg>

  <TransitionGroup tag="div" name="toast-list" class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="[`toast-${toast.type}`, { 'toast-show': toast.show }]"
      :data-id="toast.id"
      @click="removeToast(toast.id)"
      @mouseenter="pauseToastTimer(toast.id)"
      @mouseleave="resumeToastTimer(toast.id)"
    >
      <div class="toast-icon">
        <svg class="icon" :class="getIconClass(toast.type)">
          <use :xlink:href="getIconPath(toast.type)" />
        </svg>
      </div>

      <div class="toast-content">{{ toast.message }}</div>

      <div class="toast-close">
        <button
          type="button"
          class="close-btn"
          @click.stop="removeToast(toast.id)"
        >
          ×
        </button>
      </div>

      <div
        class="toast-progress-bar"
        :data-id="toast.id"
        :style="{ animationDuration: `${toast.duration}ms` }"
      />
    </div>
  </TransitionGroup>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'

const { toasts, removeToast, pauseToastTimer, resumeToastTimer } = useToast()

function getIconClass(type) {
  return `icon-${type}`
}

function getIconPath(type) {
  switch (type) {
    case 'success':
      return '#icon-check-circle'
    case 'error':
      return '#icon-error-circle'
    case 'warning':
      return '#icon-warning'
    default:
      return '#icon-info-circle'
  }
}
</script>
