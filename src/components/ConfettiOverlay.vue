<template>
    <Teleport to="body">
        <Transition name="confetti-overlay">
            <div v-if="showOverlay" class="payment-success-overlay">
                <div class="success-animation">
                    <div class="check-container">
                        <div class="check-background">
                            <svg class="check-icon" width="100" height="100" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                    </div>
                    <h2>{{ overlayTitle }}</h2>
                    <p>{{ overlaySubtitle }}</p>
                    <div v-if="showConfetti" class="confetti-wrapper">
                        <ConfettiExplosion />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import ConfettiExplosion from './ConfettiExplosion.vue'
import { useConfetti } from '../composables/useConfetti.js'

const { showOverlay, showConfetti, overlayTitle, overlaySubtitle } = useConfetti()
</script>

<style scoped>
.payment-success-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.success-animation {
    text-align: center;
    color: white;
    padding: 30px;
    max-width: 500px;
    z-index: 1001;
}

.check-container {
    margin-bottom: 24px;
}

.check-background {
    background-color: var(--theme-color);
    width: 140px;
    height: 140px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    animation: zoomIn 0.5s ease, pulse 2s infinite ease-in-out;
    box-shadow: 0 0 30px rgba(var(--theme-color-rgb), 0.7);
}

.check-icon {
    color: white;
    animation: bounceIn 0.8s ease 0.2s both;
}

.success-animation h2 {
    font-size: 28px;
    margin-bottom: 16px;
    animation: slideUp 0.5s ease 0.4s both;
}

.success-animation p {
    font-size: 16px;
    opacity: 0.8;
    animation: slideUp 0.5s ease 0.6s both;
}

.confetti-wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    pointer-events: none;
}

.confetti-overlay-enter-active,
.confetti-overlay-leave-active {
    transition: opacity 0.5s ease;
}

.confetti-overlay-enter-from,
.confetti-overlay-leave-to {
    opacity: 0;
}

@keyframes zoomIn {
    from {
        transform: scale(0);
    }

    to {
        transform: scale(1);
    }
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 20px rgba(var(--theme-color-rgb), 0.7);
    }

    50% {
        box-shadow: 0 0 40px rgba(var(--theme-color-rgb), 0.9);
    }

    100% {
        box-shadow: 0 0 20px rgba(var(--theme-color-rgb), 0.7);
    }
}

@keyframes bounceIn {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>