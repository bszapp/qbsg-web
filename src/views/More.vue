<template>
  <div class="page-container">
    <div class="page-inner">
      <div class="dashboard-card">
        <div class="card-header">
          <h2 class="card-title">页面</h2>
        </div>
        <div class="card-body">
          <p>页面内容将在这里显示。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}
.page-inner {
  width: 100%;
  max-width: 1200px;
}
.dashboard-card {
  background-color: var(--card-background);
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
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.card-title { font-size: 18px; font-weight: 600; margin: 0; color: var(--text-color); }
.card-body p { color: var(--secondary-text-color); margin: 0; line-height: 1.5; }
@media (max-width: 768px) {
  .page-container { padding: 15px; padding-bottom: 80px; }
}
</style>
