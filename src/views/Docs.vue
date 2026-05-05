<!-- src/views/More.vue -->
<template>
  <div class="more-container">
    <div class="more-inner">

      <!-- ===== 网页控制工具 ===== -->
      <section class="more-section">
        <div class="section-eyebrow">
          <i class="fa-solid fa-globe"></i>
          网页控制
        </div>
        <h2 class="section-title">固件控制平台</h2>
        <p class="section-desc">通过以下网址登录对应固件的控制后台，管理显示内容、模板和设备设置。</p>

        <div class="firmware-grid">

          <!-- 平平固件 -->
          <div class="firmware-card">
            <div class="firmware-card-header">
              <div class="firmware-card-icon fw-icon--pp">
                <i class="fa-solid fa-server"></i>
              </div>
              <div>
                <div class="firmware-card-name">平平固件</div>
                <div class="firmware-card-tag">Pingping Firmware</div>
              </div>
            </div>
            <div class="firmware-link-list">
              <a href="https://mspppclock.tech/" target="_blank" class="fw-link">
                <span class="fw-link-badge fw-badge--cn">国内</span>
                <span class="fw-link-url">mspppclock.tech</span>
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
              <a href="https://xly95.github.io/" target="_blank" class="fw-link">
                <span class="fw-link-badge fw-badge--global">国外</span>
                <span class="fw-link-url">xly95.github.io</span>
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>

          <!-- 轻舞固件 -->
          <div class="firmware-card">
            <div class="firmware-card-header">
              <div class="firmware-card-icon fw-icon--qw">
                <i class="fa-solid fa-wind"></i>
              </div>
              <div>
                <div class="firmware-card-name">轻舞固件</div>
                <div class="firmware-card-tag">Qingwu Firmware</div>
              </div>
            </div>
            <div class="firmware-link-list">
              <a href="https://epdhub.iepose.cn/" target="_blank" class="fw-link">
                <span class="fw-link-badge fw-badge--cn">国内</span>
                <span class="fw-link-url">epdhub.iepose.cn</span>
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>

          <!-- 扫地固件 -->
          <div class="firmware-card firmware-card--full">
            <div class="firmware-card-header">
              <div class="firmware-card-icon fw-icon--sd">
                <i class="fa-solid fa-broom"></i>
              </div>
              <div>
                <div class="firmware-card-name">扫地固件</div>
                <div class="firmware-card-tag">Saodi Firmware</div>
              </div>
            </div>
            <div class="firmware-link-list fw-link-list--row">
              <a href="https://epd.eled.top/213/UserScene/%E7%AD%BE%E5%8F%98%E6%97%B6%E5%85%89/scene/index.php?scene_mode=D1"
                target="_blank" class="fw-link">
                <span class="fw-link-badge fw-badge--lo">低分屏</span>
                <span class="fw-link-url">epd.eled.top · D1</span>
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
              <a href="https://epd.eled.top/213/UserScene/签变时光/scene/index.php?scene_mode=G1" target="_blank"
                class="fw-link">
                <span class="fw-link-badge fw-badge--hi">高分屏</span>
                <span class="fw-link-url">epd.eled.top · G1</span>
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>

        </div>
      </section>

      <!-- ===== 线刷工具下载 ===== -->
      <section class="more-section">
        <div class="section-eyebrow">
          <i class="fa-solid fa-microchip"></i>
          线刷工具
        </div>
        <h2 class="section-title">固件刷写工具包</h2>
        <p class="section-desc">首次使用或固件损坏时，使用以下工具对设备进行线刷烧录。文件列表实时从服务器获取。</p>

        <div v-if="downloadLoading" class="dl-status-box">正在加载文件列表...</div>
        <div v-else-if="downloadError" class="dl-status-box dl-error">{{ downloadError }}</div>
        <div v-else-if="!downloadFiles.length" class="dl-status-box">downloads 目录暂无文件</div>
        <div v-else class="single-file-list">
          <a v-for="f in downloadFiles" :key="f.name" :href="'/downloads/' + f.name" download class="single-file-row">
            <div :class="['sfr-icon-wrap', iconClass(f.name)]">
              <i :class="['fa-solid', iconTag(f.name)]"></i>
            </div>
            <div class="sfr-info">
              <span class="sfr-name">{{ f.name }}</span>
              <span class="sfr-meta">{{ extOf(f.name) }} · {{ formatSize(f.size) }} · {{ formatDate(f.modified)
              }}</span>
            </div>
            <span class="sfr-dl-btn"><i class="fa-solid fa-download"></i></span>
          </a>
        </div>
      </section>

      <!-- ===== 使用说明区 ===== -->
      <section class="more-section">
        <div class="section-eyebrow">
          <i class="fa-solid fa-circle-info"></i>
          使用帮助
        </div>
        <h2 class="section-title">常见问题</h2>
        <p class="section-desc">遇到问题时，先查阅以下常见问题。如无法解决请联系客服。</p>

        <div class="faq-list">
          <div v-for="(item, idx) in faqs" :key="idx" class="faq-item" :class="{ 'faq-item--open': openFaq === idx }"
            @click="openFaq = openFaq === idx ? null : idx">
            <div class="faq-question">
              <span class="faq-q-icon"><i class="fa-solid fa-circle-question"></i></span>
              <span class="faq-q-text">{{ item.q }}</span>
              <i class="fa-solid fa-chevron-down faq-chevron"></i>
            </div>
            <Transition name="faq-expand">
              <div v-if="openFaq === idx" class="faq-answer">
                {{ item.a }}
              </div>
            </Transition>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getJson } from '../services/api.js'

const openFaq = ref(null)
const downloadFiles = ref([])
const downloadLoading = ref(true)
const downloadError = ref('')

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function extOf(name) {
  const idx = name.lastIndexOf('.')
  return idx === -1 ? 'FILE' : name.slice(idx + 1).toUpperCase()
}

function iconClass(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['zip', 'rar', '7z'].includes(ext)) return 'sfr-icon-wrap--zip'
  if (['exe', 'msi'].includes(ext)) return 'sfr-icon-wrap--exe'
  if (['doc', 'docx'].includes(ext)) return 'sfr-icon-wrap--doc'
  return 'sfr-icon-wrap--file'
}

function iconTag(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['zip', 'rar', '7z'].includes(ext)) return 'fa-file-zipper'
  if (['exe', 'msi'].includes(ext)) return 'fa-microchip'
  if (['doc', 'docx'].includes(ext)) return 'fa-file-word'
  return 'fa-file'
}

onMounted(async () => {
  try {
    const data = await getJson('/api/getdir/downloads')
    if (data.type === 'success' && Array.isArray(data.files)) {
      downloadFiles.value = data.files
    } else {
      downloadError.value = '文件列表加载失败'
    }
  } catch (e) {
    downloadError.value = e.message || '文件列表加载失败'
  } finally {
    downloadLoading.value = false
  }
})
const faqs = [
  {
    q: '为什么我的手机打不开网页？',
    a: '必须下载以下浏览器登录网址\n电脑: Edge/Chrome\n安卓: Edge/Chrome\n苹果: Bluefy 浏览器 '
  },
  {
    q: '搜索到NRF无法连接？',
    a: '①操作不规范，没有断开其他设备的连接或直接使用蓝牙连接设备\n②电池电量太低（充电即可）电池电量太高导致过压（需要接1N4007二极管降压或等电量低一点了再尝试连接）\n③电感原件掉落或损坏也会导致无法连接，将电感重新焊接或更换主板\n④OTA固件升级偶发BUG导致无法连接，需使用专业工具线刷固件'
  },
  {
    q: '能不能看电子书?',
    a: '电子书需要使用ESP主板，蓝牙价签主板无法当电子书使用'
  },
  {
    q: '为什么会有残影?',
    a: '屏幕长时间处于未激活状态，需要不断刷新改善墨水活性，切换到大数字时间模式刷新1-2周可自动消除'
  },
  {
    q: '为什么电量显示与实测电压不一致?',
    a: '显示屏电量采用一天更新一次电量无法同步导致'
  },
  {
    q: '为什么红色用一会就变淡了?',
    a: '墨水屏对红色刷新并不友好，固件也很难实现修正，红色显示更适合照片模式及日历模式'
  },
  {
    q: '为什么外壳摸着有点粘手?',
    a: '3D打印外壳时使用的发胶，用半湿毛巾擦一下就没有了'
  },
  {
    q: '怎样开机?',
    a: '通电自动开机无按键'
  },
  {
    q: '如何设置倒计时自定义?',
    a: '需要使用电脑 or 手机登录APP或网页进行设置'
  },
  {
    q: '上传图片无法显示?',
    a: '小程序默认250*128(2.13)，需要点击尺寸位置修改为300*400(4.2)再点击图片模式一选择图片一发送图片'
  },
  {
    q: '小程序搜索不到设备?',
    a: '①.靠近手机设备不要勾选\n②.蓝牙/定位/小程序授权需要打开\n③.检查接线再重新插拔主板连接线再进行搜索\n④.小米/鸿蒙/ios部分系统有1%概率无法搜到需要使用网页连接'
  },
  {
    q: '如何对时走时准确吗?',
    a: '通过小程序或网页对时，固件自运行，走时精准，每月误差1分钟内'
  },
  {
    q: '时间更新屏幕为什么会闪动?',
    a: '墨水屏刷新率低，画面只要有变化都会闪动'
  },
  {
    q: '晚上能不能看见?',
    a: '墨水屏不带背光，夜间无光源是看不见画面的'
  },
  {
    q: '高分屏和低分屏的区别',
    a: '低分L屏幕字符按104*212像素大小排列\n高分H屏幕字符按122*250像素大小排列\n中心点差9*19个像素点'
  }
]
</script>

<style scoped>
.more-container {
  padding: 24px 20px;
  display: flex;
  justify-content: center;
}

.more-inner {
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 44px;
}

/* ===== Section ===== */
.more-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--theme-color);
  margin-bottom: 2px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 6px;
}

.section-desc {
  font-size: 14px;
  color: var(--secondary-text-color);
  margin: 0 0 20px;
  line-height: 1.6;
}

/* ===== Firmware Grid ===== */
.firmware-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.firmware-card {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
  background: rgba(var(--text-color-rgb), 0.02);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s;
}

.firmware-card:hover {
  border-color: rgba(var(--theme-color-rgb), 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.firmware-card--full {
  grid-column: 1 / -1;
}

.firmware-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.firmware-card-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.fw-icon--pp {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}

.fw-icon--qw {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}

.fw-icon--sd {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
}

.firmware-card-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 3px;
}

.firmware-card-tag {
  font-size: 11px;
  color: var(--secondary-text-color);
  font-style: italic;
}

.firmware-link-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fw-link-list--row {
  flex-direction: row;
  flex-wrap: wrap;
}

.fw-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  text-decoration: none;
  background: rgba(var(--text-color-rgb), 0.02);
  transition: all 0.2s;
  flex: 1;
  min-width: 200px;
}

.fw-link:hover {
  border-color: rgba(var(--theme-color-rgb), 0.4);
  background: rgba(var(--theme-color-rgb), 0.04);
  transform: translateY(-1px);
}

.fw-link>.fa-solid:last-child {
  font-size: 12px;
  color: var(--secondary-text-color);
  margin-left: auto;
  flex-shrink: 0;
}

.fw-link-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.fw-badge--cn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.fw-badge--global {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.fw-badge--lo {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.fw-badge--hi {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.fw-link-url {
  font-size: 13px;
  color: var(--text-color);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== ZIP Hero ===== */
.zip-hero-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border: 2px dashed rgba(var(--theme-color-rgb), 0.35);
  border-radius: 14px;
  background: rgba(var(--theme-color-rgb), 0.04);
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.zip-hero-btn:hover {
  border-style: solid;
  border-color: var(--theme-color);
  background: rgba(var(--theme-color-rgb), 0.07);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(var(--theme-color-rgb), 0.15);
}

.zip-hero-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(var(--theme-color-rgb), 0.12);
  color: var(--theme-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.zip-hero-info {
  flex: 1;
}

.zip-hero-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.recommend-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--theme-color);
  color: #fff;
}

.zip-hero-desc {
  font-size: 13px;
  color: var(--secondary-text-color);
}

.zip-hero-dl {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--theme-color);
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.zip-hero-dl i {
  font-size: 20px;
}

/* ===== Single File List ===== */
.single-file-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.single-file-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-text-color);
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color);
}

.single-file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.single-file-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: rgba(var(--text-color-rgb), 0.02);
  text-decoration: none;
  transition: all 0.2s;
}

.single-file-row:hover {
  border-color: rgba(var(--theme-color-rgb), 0.35);
  background: rgba(var(--theme-color-rgb), 0.03);
  transform: translateX(3px);
}

.sfr-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.sfr-icon-wrap--exe {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.sfr-icon-wrap--doc {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.sfr-icon-wrap--zip {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.sfr-icon-wrap--file {
  background: rgba(var(--text-color-rgb), 0.07);
  color: var(--secondary-text-color);
}

.dl-status-box {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--secondary-text-color);
  background: rgba(var(--text-color-rgb), 0.03);
  border: 1px solid var(--border-color);
}

.dl-error {
  color: var(--error-color);
  background: rgba(var(--error-color-rgb), 0.06);
  border-color: rgba(var(--error-color-rgb), 0.15);
}

.sfr-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sfr-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.sfr-meta {
  font-size: 12px;
  color: var(--secondary-text-color);
}

.sfr-dl-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(var(--theme-color-rgb), 0.1);
  color: var(--theme-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  transition: background 0.2s;
}

.single-file-row:hover .sfr-dl-btn {
  background: var(--theme-color);
  color: #fff;
}

/* ===== FAQ ===== */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.faq-item {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: rgba(var(--text-color-rgb), 0.02);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.faq-item:hover,
.faq-item--open {
  border-color: rgba(var(--theme-color-rgb), 0.35);
}

.faq-item--open {
  background: rgba(var(--theme-color-rgb), 0.02);
}

.faq-question {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  user-select: none;
}

.faq-q-icon {
  color: var(--theme-color);
  font-size: 16px;
  flex-shrink: 0;
}

.faq-q-text {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.4;
}

.faq-chevron {
  font-size: 13px;
  color: var(--secondary-text-color);
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.faq-item--open .faq-chevron {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 18px 16px 46px;
  white-space: pre-wrap;
  font-size: 13.5px;
  color: var(--secondary-text-color);
  line-height: 1.65;
}

/* FAQ expand animation */
.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: all 0.28s ease;
  overflow: hidden;
}

.faq-expand-enter-from,
.faq-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.faq-expand-enter-to,
.faq-expand-leave-from {
  max-height: 200px;
  opacity: 1;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .more-container {
    padding: 16px 15px 80px;
  }

  .firmware-grid {
    grid-template-columns: 1fr;
  }

  .firmware-card--full {
    grid-column: 1;
  }

  .fw-link-list--row {
    flex-direction: column;
  }

  .fw-link {
    min-width: unset;
  }

  .zip-hero-btn {
    padding: 16px 18px;
    gap: 12px;
  }

  .zip-hero-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .zip-hero-dl span {
    display: none;
  }
}
</style>