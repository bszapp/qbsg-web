<template>
  <div class="admin-media" :class="[`fit-${fit}`, src ? 'has-image' : '']">
    <img v-if="src" :src="src" :alt="alt" class="admin-media-img" @load="loading = false" @error="onImageError" />
    <div v-if="loading || !src" class="admin-media-state" :class="{ 'admin-media-state-overlay': !!src }">
      {{ stateText }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { buildApiUrl } from '../config/app.js'

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
  kind: {
    type: String,
    default: 'preview',
  },
  alt: {
    type: String,
    default: '',
  },
  available: {
    type: Boolean,
    default: true,
  },
  fit: {
    type: String,
    default: 'cover',
  },
})

const src = ref('')
const loading = ref(false)
const errorMessage = ref('')

function onImageError() {
  src.value = ''
  loading.value = false
  errorMessage.value = '图片加载失败，请刷新页面'
}

function loadImage() {
  src.value = ''
  errorMessage.value = ''
  loading.value = false

  if (!props.available) return
  if (!props.url) {
    errorMessage.value = '图片生成失败，请刷新页面'
    return
  }
  loading.value = true
  src.value = buildApiUrl(props.url)
}

const stateText = computed(() => {
  if (!props.available) {
    return props.kind === 'audit' ? '未生成审核图' : '未生成浏览图'
  }
  if (loading.value) {
    return '正在加载图片...'
  }
  return errorMessage.value || '图片加载失败'
})

watch(
  () => [props.url, props.available],
  loadImage,
  { immediate: true }
)
</script>

<style scoped>
.admin-media {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--text-color-rgb), 0.04);
  overflow: hidden;
}

.admin-media.fit-cover .admin-media-img {
  object-fit: cover;
}

.admin-media.fit-contain .admin-media-img {
  object-fit: contain;
}

.admin-media-img {
  width: 100%;
  height: 100%;
  display: block;
}

.admin-media-state {
  padding: 18px;
  text-align: center;
  color: var(--secondary-text-color);
  font-size: 13px;
  line-height: 1.6;
}

.admin-media-state-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--card-background-rgb), 0.85);
}
</style>
