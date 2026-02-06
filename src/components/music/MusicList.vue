<template>
  <section class="music-list-container">
    <div class="list-header">
      <h2 class="section-title">
        <i class="pi pi-th-large title-ic"></i>
        {{ title }}
        <Tag v-if="count > 0" :value="count" rounded severity="secondary" class="l-badge" />
      </h2>
      
      <div class="list-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div v-if="count > 0" class="music-grid">
      <slot></slot>
    </div>
    
    <div v-else class="empty-state glass-panel">
      <div class="empty-icon-circle">
        <i class="pi pi-music"></i>
      </div>
      <h3>{{ $t('library.empty') }}</h3>
      <p>{{ $t('library.empty_hint') }}</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  count: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.music-list-container {
  margin-top: var(--spacing-md);
  animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  letter-spacing: -0.5px;
}

.title-ic {
  color: var(--accent-primary);
  font-size: 1.5rem;
}

.l-badge {
  font-size: 0.8rem !important;
}

.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: var(--spacing-xl);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  border-radius: var(--radius-xl);
  border: 1px dashed var(--glass-border);
}

.empty-icon-circle {
  width: 90px;
  height: 90px;
  background: var(--grad-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.empty-icon-circle i {
  font-size: 2.8rem;
  color: white;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 12px;
  font-weight: 700;
}

.empty-state p {
  color: var(--text-tertiary);
  max-width: 350px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .music-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }
  
  .section-title {
    font-size: 1.4rem;
  }
}
</style>
