import { reactive, ref } from 'vue'

const toasts = ref([])
const toastTimers = new Map()
let toastId = 0

function findToast(id) {
  return toasts.value.find((toast) => toast.id === id)
}

function clearToastTimer(id) {
  const timer = toastTimers.get(id)

  if (timer) {
    clearTimeout(timer)
    toastTimers.delete(id)
  }
}

function removeToastNow(id) {
  const index = toasts.value.findIndex((toast) => toast.id === id)

  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

function removeToast(id) {
  const toast = findToast(id)

  if (!toast || toast.closing) {
    return
  }

  toast.closing = true
  clearToastTimer(id)
  toast.show = false

  window.setTimeout(() => {
    removeToastNow(id)
  }, 400)
}

function startToastTimer(toast) {
  clearToastTimer(toast.id)

  toast.startedAt = Date.now()

  const timer = window.setTimeout(() => {
    removeToast(toast.id)
  }, toast.remaining)

  toastTimers.set(toast.id, timer)
}

function pauseToastTimer(id) {
  const toast = findToast(id)

  if (!toast || toast.closing || toast.paused) {
    return
  }

  toast.paused = true
  toast.remaining = Math.max(0, toast.remaining - (Date.now() - toast.startedAt))
  clearToastTimer(id)
}

function resumeToastTimer(id) {
  const toast = findToast(id)

  if (!toast || toast.closing || !toast.paused) {
    return
  }

  toast.paused = false

  if (toast.remaining <= 0) {
    removeToast(id)
    return
  }

  startToastTimer(toast)
}

function showToast(message, type = 'info', duration = 3000) {
  const toast = reactive({
    id: ++toastId,
    type,
    message,
    duration,
    remaining: duration,
    startedAt: 0,
    paused: false,
    closing: false,
    show: false,
  })

  toasts.value.push(toast)

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      toast.show = true
      startToastTimer(toast)
    })
  })

  return toast.id
}

export function useToast() {
  return {
    toasts,
    showToast,
    removeToast,
    pauseToastTimer,
    resumeToastTimer,
  }
}
