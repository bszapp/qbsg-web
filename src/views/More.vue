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
              <a>
                href="https://epd.eled.top/213/UserScene/%E7%AD%BE%E5%8F%98%E6%97%B6%E5%85%89/scene/index.php?scene_mode=D1"
                target="_blank"
                class="fw-link"
                >
                <span class="fw-link-badge fw-badge--lo">低分屏</span>
                <span class="fw-link-url">epd.eled.top · D1</span>
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
              <a>
                href="https://epd.eled.top/213/UserScene/签变时光/scene/index.php?scene_mode=G1"
                target="_blank"
                class="fw-link"
                >
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
        <p class="section-desc">首次使用或固件损坏时，使用以下工具对设备进行线刷烧录。建议下载完整工具包。</p>

        <!-- 推荐：完整包 -->
        <a href="/downloads/线刷工具完整包.zip" download class="zip-hero-btn">
          <div class="zip-hero-icon">
            <i class="fa-solid fa-file-zipper"></i>
          </div>
          <div class="zip-hero-info">
            <div class="zip-hero-name">
              线刷工具完整包
              <span class="recommend-badge">推荐</span>
            </div>
            <div class="zip-hero-desc">含全部工具、驱动及说明文档，一次下载即可</div>
          </div>
          <div class="zip-hero-dl">
            <i class="fa-solid fa-download"></i>
            <span>一键下载</span>
          </div>
        </a>

        <!-- 单独下载列表 -->
        <div class="single-file-section">
          <div class="single-file-title">也可单独下载所需资源</div>
          <div class="single-file-list">

            <a href="/downloads/SmartSnippets_Toolbox_v5.0.10.2434_windows.msi" download class="single-file-row">
              <div class="sfr-icon-wrap sfr-icon-wrap--exe">
                <i class="fa-brands fa-windows"></i>
              </div>
              <div class="sfr-info">
                <span class="sfr-name">SmartSnippets Toolbox v5.0.10</span>
                <span class="sfr-meta">MSI · Windows 安装包 · 主烧录软件</span>
              </div>
              <span class="sfr-dl-btn"><i class="fa-solid fa-download"></i></span>
            </a>

            <a href="/downloads/JLink_Windows_V788j_x86_64.exe" download class="single-file-row">
              <div class="sfr-icon-wrap sfr-icon-wrap--exe">
                <i class="fa-solid fa-microchip"></i>
              </div>
              <div class="sfr-info">
                <span class="sfr-name">JLink V788j</span>
                <span class="sfr-meta">EXE · 调试驱动 · 配合 SmartSnippets 使用</span>
              </div>
              <span class="sfr-dl-btn"><i class="fa-solid fa-download"></i></span>
            </a>

            <a href="/docs/固件说明.docx" download class="single-file-row">
              <div class="sfr-icon-wrap sfr-icon-wrap--doc">
                <i class="fa-solid fa-file-word"></i>
              </div>
              <div class="sfr-info">
                <span class="sfr-name">固件说明</span>
                <span class="sfr-meta">DOCX · 固件基础说明文档</span>
              </div>
              <span class="sfr-dl-btn"><i class="fa-solid fa-download"></i></span>
            </a>

            <a href="/docs/线刷烧录说明.docx" download class="single-file-row">
              <div class="sfr-icon-wrap sfr-icon-wrap--doc">
                <i class="fa-solid fa-file-word"></i>
              </div>
              <div class="sfr-info">
                <span class="sfr-name">线刷烧录说明</span>
                <span class="sfr-meta">DOCX · 烧录步骤详解（通用版）</span>
              </div>
              <span class="sfr-dl-btn"><i class="fa-solid fa-download"></i></span>
            </a>

            <a href="/docs/线刷烧录说明2.docx" download class="single-file-row">
              <div class="sfr-icon-wrap sfr-icon-wrap--doc">
                <i class="fa-solid fa-file-word"></i>
              </div>
              <div class="sfr-info">
                <span class="sfr-name">线刷烧录说明 2</span>
                <span class="sfr-meta">DOCX · 烧录步骤详解（补充版）</span>
              </div>
              <span class="sfr-dl-btn"><i class="fa-solid fa-download"></i></span>
            </a>

          </div>
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
import { ref } from 'vue'

const openFaq = ref(null)

const faqs = [
  {
    q: '如何激活固件？购买设备后第一步做什么？',
    a: '购买设备后，请通过微信联系客服，提供订单号，客服会发送激活码及对应固件的控制网址。按照固件说明文档完成设备配网后，即可通过网页后台管理设备内容。'
  },
  {
    q: '设备无法连接 Wi-Fi / 控制平台无响应怎么办？',
    a: '请确认设备已成功配网，且手机/电脑与设备处于同一网络。如控制平台无响应，可尝试刷新页面或清除浏览器缓存。若问题持续，请联系售后并描述设备型号和固件版本。'
  },
  {
    q: '线刷失败或刷写后设备无法启动怎么处理？',
    a: '请先确认 JLink 驱动已正确安装，且 SmartSnippets Toolbox 版本与文档一致。烧录时请勿断开数据线。若刷写后设备无响应，可再次尝试线刷，或参考"线刷烧录说明 2"中的恢复步骤，实在无法解决请联系售后。'
  },
  {
    q: '更新固件会清除设备上的模板和设置吗？',
    a: 'OTA 升级通常不会清除用户数据，但建议升级前在控制平台截图保存重要配置。如果进行了线刷操作，部分固件可能需要重新配置设备。'
  },
  {
    q: 'App 显示"无法连接设备"或"超时"怎么办？',
    a: '请确认 App 与设备连接的是同一 Wi-Fi，且固件控制地址填写正确。部分网络环境下可能需要关闭 VPN 或代理。也可尝试重启设备和路由器后重新扫描。'
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