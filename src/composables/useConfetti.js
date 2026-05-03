import { ref, nextTick } from 'vue'

// 模块级单例状态，和 useToast 同理
const showOverlay = ref(false)
const showConfetti = ref(false)
const overlayTitle = ref('')
const overlaySubtitle = ref('')

export function useConfetti() {
    function triggerConfetti(title = '', subtitle = '') {
        if (showOverlay.value) return
        overlayTitle.value = title
        overlaySubtitle.value = subtitle
        showOverlay.value = true
        nextTick(() => {
            setTimeout(() => { showConfetti.value = true }, 300)
            setTimeout(() => {
                showConfetti.value = false
                setTimeout(() => {
                    showOverlay.value = false
                }, 500)
            }, 3000)
        })
    }

    return {
        showOverlay,
        showConfetti,
        overlayTitle,
        overlaySubtitle,
        triggerConfetti,
    }
}