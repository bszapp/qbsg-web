<template>
  <div class="admin-media" :class="[`fit-${fit}`, src ? 'has-image' : '']">
    <img v-if="src" :src="src" :alt="alt" class="admin-media-img" />
    <div v-else class="admin-media-state">
      {{ stateText }}
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { normalizeMessage } from '../services/api.js'
import { fetchAdminTemplateMediaObjectUrl } from '../services/adminTemplateReview.js'

const props = defineProps({
  token: {
    type: String,
    default: '',
  },
  uid: {
    type: [Number, String],
    required: true,
  },
  projectId: {
    type: String,
    required: true,
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

function revokeCurrentUrl() {
  if (src.value) {
    URL.revokeObjectURL(src.value)
    src.value = ''
  }
}

async function loadImage() {
  revokeCurrentUrl()
  errorMessage.value = ''

  if (!props.available) {
    return
  }

  if (!props.token || !props.projectId) {
    errorMessage.value = '缺少图片参数'
    return
  }

  loading.value = true

  try {
    const result = await fetchAdminTemplateMediaObjectUrl(props.token, {
      uid: props.uid,
      project_id: props.projectId,
      kind: props.kind,
    })

    if (result.ok) {
      src.value = result.url
    } else {
      errorMessage.value = normalizeMessage(result.data, '图片加载失败')
    }
  } catch (error) {
    errorMessage.value = error.message || '图片加载失败'
  } finally {
    loading.value = false
  }
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
  () => [props.token, props.uid, props.projectId, props.kind, props.available],
  loadImage,
  { immediate: true }
)

onBeforeUnmount(() => {
  revokeCurrentUrl()
})
</script>

<style scoped>
.admin-media {
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
</style>
