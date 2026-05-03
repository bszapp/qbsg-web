<template>
  <div class="dashboard-container">
    <div class="dashboard-inner">
      <div class="dashboard-card">
        <div class="card-header">
          <h2 class="card-title">施工中</h2>
        </div>
        <div class="card-body">
          <p>前面的区域，以后再来探索吧！</p>
          <button class="btn-test-confetti" @click="triggerConfetti('恭喜你', '恭喜你，你被我恭喜到了')">
            千万别点
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useConfetti } from '../composables/useConfetti.js'

const { triggerConfetti } = useConfetti()
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.dashboard-inner {
  width: 100%;
  max-width: 1200px;
}

.dashboard-card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-color: rgba(var(--theme-color-rgb), 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.card-body p {
  color: var(--secondary-text-color);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.btn-test-confetti {
  padding: 10px 24px;
  background-color: var(--theme-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-test-confetti:hover {
  opacity: 0.85;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
    padding-bottom: 80px;
  }
}
</style>