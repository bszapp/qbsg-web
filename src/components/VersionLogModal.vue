<!-- src/components/VersionLogModal.vue -->
<template>
    <Teleport to="body">
        <Transition name="auth-popup-fade">
            <div v-if="modelValue" class="auth-popup-overlay" @click.self="$emit('update:modelValue', false)">
                <Transition name="auth-popup-slide" appear>
                    <div v-if="modelValue" class="auth-popup-container version-modal">
                        <div class="auth-popup-header">
                            <div class="modal-header-left">
                                <h2 class="popup-title">版本更新日志</h2>
                            </div>
                            <button class="popup-close-btn" type="button" @click="$emit('update:modelValue', false)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M18 6l-12 12" />
                                    <path d="M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="auth-popup-content">
                            <div v-if="loading" class="modal-loading">
                                <i class="fa-solid fa-spinner fa-spin"></i>
                                <span>加载中...</span>
                            </div>

                            <div v-else-if="versions.length === 0" class="modal-empty">
                                <i class="fa-solid fa-box-open"></i>
                                <span>暂无版本信息</span>
                            </div>

                            <div v-else class="version-list">
                                <div v-for="(ver, idx) in versions" :key="ver.versionCode" class="version-item"
                                    :class="{ 'version-item--latest': idx === 0 }">
                                    <div class="version-item-header">
                                        <div class="version-tag-row">
                                            <span class="version-name">{{ ver.versionName }}</span>
                                            <span v-if="idx === 0" class="latest-badge">最新</span>
                                        </div>
                                        <span class="version-code">#{{ ver.versionCode }}</span>
                                    </div>
                                    <div class="version-changelog">
                                        <div v-for="(line, i) in parseChangelog(ver.changelog)" :key="i"
                                            class="changelog-line">
                                            <span class="changelog-dot"><i class="fa-solid fa-circle-dot"></i></span>
                                            <span>{{ line }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: Boolean,
    versions: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

defineEmits(['update:modelValue'])

function parseChangelog(text) {
    if (!text) return []
    return text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0)
}
</script>

<style scoped>
.version-modal {
    max-width: 520px;
}

.modal-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.modal-icon {
    width: 32px;
    height: 32px;
    background: rgba(var(--theme-color-rgb), 0.12);
    color: var(--theme-color);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
}

/* Overlay & container — match Settings.vue exactly */
.auth-popup-overlay {
    position: fixed;
    inset: 0;
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
}

.auth-popup-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    background-color: rgba(var(--theme-color-rgb), 0.03);
    flex-shrink: 0;
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

.auth-popup-content {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}

/* Loading / Empty */
.modal-loading,
.modal-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 0;
    color: var(--secondary-text-color);
    font-size: 15px;
}

.modal-loading i,
.modal-empty i {
    font-size: 28px;
    opacity: 0.5;
}

/* Version list */
.version-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.version-item {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    background: rgba(var(--text-color-rgb), 0.02);
    transition: border-color 0.2s;
}

.version-item--latest {
    border-color: rgba(var(--theme-color-rgb), 0.35);
    background: rgba(var(--theme-color-rgb), 0.03);
}

.version-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.version-tag-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.version-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-color);
}

.latest-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    background: var(--theme-color);
    color: #fff;
    letter-spacing: 0.5px;
}

.version-code {
    font-size: 12px;
    color: var(--secondary-text-color);
}

.version-changelog {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.changelog-line {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13.5px;
    color: var(--secondary-text-color);
    line-height: 1.55;
}

.changelog-dot {
    color: var(--theme-color);
    font-size: 8px;
    margin-top: 4px;
    flex-shrink: 0;
}

/* Animations */
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

    .auth-popup-content {
        padding: 15px;
    }
}
</style>