<template>
  <div class="view-container settings-view">
    <div class="view-header">
      <div class="title-area">
        <div class="icon-box">
          <i class="pi pi-cog title-icon"></i>
        </div>
        <div class="text-group">
          <h2>{{ $t('settings.title') }}</h2>
          <p class="view-desc">{{ $t('settings.subtitle') || '偏好設定與個性化介面' }}</p>
        </div>
      </div>
    </div>

    <div class="settings-grid">
      <!-- Theme Section -->
      <div class="settings-card glass-panel">
        <div class="card-head">
          <i class="pi pi-palette"></i>
          <h3>{{ $t('settings.theme.title') }}</h3>
        </div>
        <p class="card-desc">{{ $t('settings.theme.desc') }}</p>
        <div class="control-row">
          <SelectButton 
            v-model="preferencesStore.theme" 
            :options="themeOptions" 
            optionLabel="label" 
            optionValue="value" 
            class="premium-select"
          >
            <template #option="slotProps">
              <div class="option-content">
                <i :class="slotProps.option.icon"></i>
                <span>{{ slotProps.option.label }}</span>
              </div>
            </template>
          </SelectButton>
        </div>
      </div>

      <!-- Language Section -->
      <div class="settings-card glass-panel">
        <div class="card-head">
          <i class="pi pi-language"></i>
          <h3>{{ $t('settings.language.title') }}</h3>
        </div>
        <p class="card-desc">{{ $t('settings.language.desc') }}</p>
        <div class="control-row">
          <SelectButton 
            v-model="preferencesStore.language" 
            :options="languageOptions" 
            optionLabel="label" 
            optionValue="value"
            @change="handleLanguageChange"
            class="premium-select"
          />
        </div>
      </div>

      <!-- Adaptive Color Section -->
      <div class="settings-card glass-panel full-width">
        <div class="card-head-row">
          <div class="head-text">
            <div class="card-head">
              <i class="pi pi-image"></i>
              <h3>{{ $t('settings.adaptive_color.title') }}</h3>
            </div>
            <p class="card-desc">{{ $t('settings.adaptive_color.desc') }}</p>
          </div>
          <ToggleButton 
            v-model="preferencesStore.adaptiveColor" 
            onIcon="pi pi-check" 
            offIcon="pi pi-times" 
            class="premium-toggle"
          />
        </div>
      </div>

      <!-- Reset Section -->
      <div class="settings-card glass-panel full-width danger-card">
        <div class="card-head-row">
          <div class="head-text">
            <div class="card-head">
              <i class="pi pi-refresh"></i>
              <h3>{{ $t('settings.reset.title') }}</h3>
            </div>
            <p class="card-desc">{{ $t('settings.reset.desc') }}</p>
          </div>
          <Button 
            :label="$t('settings.reset.button')" 
            icon="pi pi-exclamation-triangle" 
            severity="danger" 
            outlined 
            @click="handleReset"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePreferencesStore } from '../stores/preferences'
import { useI18n } from 'vue-i18n'

const preferencesStore = usePreferencesStore()
const { t, locale } = useI18n()

const themeOptions = computed(() => [
  { label: t('settings.theme.dark'), value: 'dark', icon: 'pi pi-moon' },
  { label: t('settings.theme.light'), value: 'light', icon: 'pi pi-sun' }
])

const languageOptions = [
  { label: '繁體中文', value: 'zh-TW' },
  { label: 'English', value: 'en' }
]

const handleLanguageChange = (e) => {
  locale.value = e.value
  preferencesStore.setLanguage(e.value)
}

const handleReset = () => {
  if (confirm(t('settings.reset.confirm'))) {
    localStorage.clear()
    window.location.reload()
  }
}
</script>

<style scoped>
.settings-view {
  padding-top: var(--spacing-xl);
  max-width: 1000px;
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

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-4px);
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--accent-primary);
}

.card-head i { font-size: 1.3rem; }
.card-head h3 { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); }

.card-desc {
  color: var(--text-tertiary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.control-row {
  margin-top: auto;
}

.full-width {
  grid-column: span 2;
}

.card-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.head-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.danger-card {
  border-color: rgba(239, 68, 68, 0.2);
}

.danger-card:hover {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.03);
}

.premium-select .option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .settings-grid { grid-template-columns: 1fr; }
  .full-width { grid-column: span 1; }
  .card-head-row { flex-direction: column; align-items: flex-start; gap: 20px; }
  .title-area h2 { font-size: 1.8rem; }
}
</style>
