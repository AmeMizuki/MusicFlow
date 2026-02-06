<template>
  <div class="view-container upload-view">
    <div class="view-header">
      <div class="title-area">
        <div class="icon-box">
          <i class="pi pi-cloud-upload title-icon"></i>
        </div>
        <div class="text-group">
          <h2>{{ $t('nav.upload') }}</h2>
          <p class="view-desc">{{ $t('uploader.description') }}</p>
        </div>
      </div>
    </div>
    
    <div class="upload-content-wrapper">
      <FileUploader />
    </div>
  </div>
</template>

<script setup>
import FileUploader from '../components/common/FileUploader.vue'
</script>

<style scoped>
.upload-view {
  padding-top: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 50px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-box {
  width: 56px;
  height: 56px;
  background: var(--grad-primary);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.title-icon {
  font-size: 1.8rem;
  color: white;
}

.text-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-area h2 {
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1;
  background: linear-gradient(to right, #fff, var(--text-tertiary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.view-desc {
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 500;
}

.upload-content-wrapper {
  animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .title-area h2 { font-size: 1.8rem; }
  .view-desc { font-size: 0.95rem; }
}
</style>
