<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <div class="dashboard-inner">

      <!-- ===== App 下载区 ===== -->
      <section class="dash-section">
        <div class="section-eyebrow">
          <i class="fa-solid fa-mobile-screen"></i>
          APP 下载
        </div>
        <h2 class="section-title">签变时光 · 客户端</h2>
        <p class="section-desc">专为墨水屏设备打造的智能控制 App，支持图片上传、批量操作、自动识别等功能。</p>

        <div class="app-download-block">

          <!-- 左：下载卡片 -->
          <div class="download-card">
            <div class="download-card-top">
              <div class="app-icon-wrap">
                <i class="fa-solid fa-tablet-screen-button"></i>
              </div>
              <div class="app-info">
                <div class="app-name">签变时光</div>
                <div class="app-meta-row">
                  <span v-if="updateInfo" class="version-pill">
                    <i class="fa-solid fa-tag"></i>
                    {{ updateInfo.latestVersionName }}
                  </span>
                  <span v-else class="version-pill version-pill--loading">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    获取中...
                  </span>
                </div>
              </div>
            </div>

            <a :href="updateInfo?.downloadUrl || '#'" :class="['dl-btn-android', { 'dl-btn--disabled': !updateInfo }]"
              target="_blank" download>
              <i class="fa-brands fa-android"></i>
              <span class="dl-btn-text">
                <span class="dl-btn-main">Android 版下载</span>
                <span class="dl-btn-sub">{{ updateInfo ? updateInfo.latestVersionName : '...' }} · APK</span>
              </span>
              <i class="fa-solid fa-arrow-down dl-btn-arrow"></i>
            </a>

            <div class="other-platforms">
              <button class="platform-btn platform-btn--ios" disabled>
                <i class="fa-brands fa-apple"></i>
                <span>iOS 版<br><small>敬请期待</small></span>
              </button>
              <button class="platform-btn platform-btn--harmony" disabled>
                <i class="fa-solid fa-circle-nodes"></i>
                <span>鸿蒙版<br><small>敬请期待</small></span>
              </button>
            </div>
          </div>

          <!-- 右：更新日志预览 -->
          <div class="changelog-card">
            <div class="changelog-card-header">
              <span class="changelog-title">
                <i class="fa-solid fa-newspaper"></i>
                最新更新
                <span v-if="updateInfo" class="changelog-ver">{{ updateInfo.latestVersionName }}</span>
              </span>
              <button class="changelog-more-btn" @click="showVersionLog = true">
                查看全部
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            <div v-if="latestChangelog.length" class="changelog-preview">
              <div v-for="(line, i) in latestChangelog" :key="i" class="cl-line">
                <span class="cl-dot"><i class="fa-solid fa-circle-dot"></i></span>
                <span>{{ line }}</span>
              </div>
            </div>
            <div v-else class="changelog-skeleton">
              <div class="skeleton-line" style="width:80%"></div>
              <div class="skeleton-line" style="width:65%"></div>
              <div class="skeleton-line" style="width:72%"></div>
            </div>
          </div>

        </div>
      </section>
      <section class="dash-section">
        <!-- ===== 购物平台 =====
      <section class="dash-section">
        <div class="section-eyebrow">
          <i class="fa-solid fa-bag-shopping"></i>
          购物入口
        </div>
        <h2 class="section-title">爆款商品</h2>
        <p class="section-desc">前往拼多多店铺选购墨水屏设备，购买后联系客服激活固件服务。</p>

        <div class="product-grid">
          <a>
            v-for="product in products"
            :key="product.id"
            :href="product.url"
            target="_blank"
            class="product-entry"
            >
            <div class="product-entry-icon">
              <i class="fa-solid fa-display"></i>
            </div>
            <div class="product-entry-info">
              <div class="product-entry-name">{{ product.name }}</div>
              <div class="product-entry-platform">
                <i class="fa-solid fa-store"></i> 拼多多
              </div>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square product-entry-arrow"></i>
          </a>
        </div> -->

        <!-- 联系卡片 -->
        <div class="contact-row">
          <div class="contact-card contact-card--qq">
            <div class="contact-card-icon"><i class="fa-brands fa-qq"></i></div>
            <div class="contact-card-info">
              <div class="contact-card-label">QQ 交流群</div>
              <div class="contact-card-desc">进群获取技术支持 & 资源分享</div>
            </div>
            <div class="contact-qr-wrap">
              <img src="/images/qq.jpg" alt="QQ群" class="contact-qr" />
            </div>
          </div>
          <div class="contact-card contact-card--wechat">
            <div class="contact-card-icon"><i class="fa-brands fa-weixin"></i></div>
            <div class="contact-card-info">
              <div class="contact-card-label">微信联系</div>
              <div class="contact-card-desc">售前咨询 & 激活服务</div>
            </div>
            <div class="contact-qr-wrap">
              <img src="/images/wechat.jpg" alt="微信" class="contact-qr" />
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>

  <!-- 版本日志弹窗 -->
  <VersionLogModal v-model="showVersionLog" :versions="updateInfo?.allVersions || []" :loading="loadingUpdate" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VersionLogModal from '../components/VersionLogModal.vue'

const showVersionLog = ref(false)
const loadingUpdate = ref(false)
const updateInfo = ref(null)

const products = [
  { id: 1, name: '爆款商品 1', url: 'https://mobile.yangkeduo.com/goods2.html?ps=IrM6lMpnNN' },
  { id: 2, name: '爆款商品 2', url: 'https://mobile.yangkeduo.com/goods1.html?ps=NAdv1vcbeB' },
  { id: 3, name: '爆款商品 3', url: 'https://mobile.yangkeduo.com/goods1.html?ps=0VpdRfYT1h' },
  { id: 4, name: '爆款商品 4', url: 'https://mobile.yangkeduo.com/goods1.html?ps=7p7MGaEv7b' },
]

const latestChangelog = computed(() => {
  if (!updateInfo.value?.allVersions?.length) return []
  const latest = updateInfo.value.allVersions[0]
  return latest.changelog
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .slice(0, 5)
})

async function fetchUpdateInfo() {
  loadingUpdate.value = true
  try {
    const res = await fetch('/api/check-update')
    if (res.ok) {
      updateInfo.value = await res.json()
    }
  } catch (e) {
    console.warn('获取版本信息失败', e)
  } finally {
    loadingUpdate.value = false
  }
}

onMounted(() => {
  fetchUpdateInfo()
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px 20px;
  display: flex;
  justify-content: center;
}

.dashboard-inner {
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* ===== Section ===== */
.dash-section {
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

/* ===== App Download Block ===== */
.app-download-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Download Card */
.download-card {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 22px;
  background: rgba(var(--text-color-rgb), 0.02);
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.download-card:hover {
  border-color: rgba(var(--theme-color-rgb), 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.download-card-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.app-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(var(--theme-color-rgb), 0.1);
  color: var(--theme-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.app-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 6px;
}

.app-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(var(--theme-color-rgb), 0.12);
  color: var(--theme-color);
  font-weight: 600;
}

.version-pill--loading {
  background: rgba(var(--text-color-rgb), 0.07);
  color: var(--secondary-text-color);
}

/* Android Download Button */
.dl-btn-android {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--theme-color);
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  transition: opacity 0.2s, box-shadow 0.2s, transform 0.15s;
  box-shadow: 0 4px 14px rgba(var(--theme-color-rgb), 0.35);
}

.dl-btn-android:hover {
  opacity: 0.92;
  box-shadow: 0 6px 20px rgba(var(--theme-color-rgb), 0.45);
  transform: translateY(-1px);
}

.dl-btn-android>.fa-brands {
  font-size: 26px;
  flex-shrink: 0;
}

.dl-btn-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dl-btn-main {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.dl-btn-sub {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}

.dl-btn-arrow {
  font-size: 16px;
  flex-shrink: 0;
  opacity: 0.85;
}

.dl-btn--disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Other platforms */
.other-platforms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.platform-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: rgba(var(--text-color-rgb), 0.03);
  color: var(--secondary-text-color);
  font-size: 13px;
  cursor: not-allowed;
  text-align: left;
  transition: all 0.2s;
}

.platform-btn i {
  font-size: 18px;
  flex-shrink: 0;
}

.platform-btn span {
  line-height: 1.3;
}

.platform-btn small {
  font-size: 11px;
  opacity: 0.7;
}

/* Changelog Card */
.changelog-card {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 22px;
  background: rgba(var(--text-color-rgb), 0.02);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.changelog-card:hover {
  border-color: rgba(var(--theme-color-rgb), 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.changelog-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.changelog-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color);
}

.changelog-title i {
  color: var(--theme-color);
}

.changelog-ver {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(var(--theme-color-rgb), 0.1);
  color: var(--theme-color);
}

.changelog-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--theme-color);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
  transition: opacity 0.2s;
}

.changelog-more-btn:hover {
  opacity: 0.75;
}

.changelog-preview {
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex: 1;
}

.cl-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13.5px;
  color: var(--secondary-text-color);
  line-height: 1.55;
}

.cl-dot {
  color: var(--theme-color);
  font-size: 8px;
  margin-top: 5px;
  flex-shrink: 0;
}

/* Skeleton */
.changelog-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg,
      rgba(var(--text-color-rgb), 0.06) 25%,
      rgba(var(--text-color-rgb), 0.1) 50%,
      rgba(var(--text-color-rgb), 0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* ===== Products ===== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.product-entry {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: rgba(var(--text-color-rgb), 0.02);
  text-decoration: none;
  transition: all 0.2s;
}

.product-entry:hover {
  border-color: rgba(var(--theme-color-rgb), 0.35);
  background: rgba(var(--theme-color-rgb), 0.03);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.product-entry-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(var(--theme-color-rgb), 0.1);
  color: var(--theme-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.product-entry-info {
  flex: 1;
  min-width: 0;
}

.product-entry-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-entry-platform {
  font-size: 12px;
  color: var(--secondary-text-color);
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-entry-arrow {
  font-size: 13px;
  color: var(--secondary-text-color);
  flex-shrink: 0;
}

/* ===== Contact ===== */
.contact-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: rgba(var(--text-color-rgb), 0.02);
  transition: all 0.2s;
}

.contact-card:hover {
  border-color: rgba(var(--theme-color-rgb), 0.3);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.contact-card-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.contact-card--qq .contact-card-icon {
  background: rgba(18, 140, 220, 0.12);
  color: #128cdc;
}

.contact-card--wechat .contact-card-icon {
  background: rgba(7, 193, 96, 0.12);
  color: #07c160;
}

.contact-card-info {
  flex: 1;
}

.contact-card-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 4px;
}

.contact-card-desc {
  font-size: 12px;
  color: var(--secondary-text-color);
  line-height: 1.4;
}

.contact-qr-wrap {
  flex-shrink: 0;
}

.contact-qr {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px 15px 80px;
  }

  .app-download-block {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .contact-row {
    grid-template-columns: 1fr;
  }

  .other-platforms {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .contact-card {
    flex-wrap: wrap;
  }

  .contact-qr-wrap {
    display: none;
  }
}
</style>