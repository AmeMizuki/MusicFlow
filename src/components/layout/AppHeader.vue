<template>
  <header class="app-header glass">
    <div class="header-content">
      <div class="header-left">
        <div class="search-container">
          <i class="pi pi-search search-icon"></i>
          <InputText 
            v-model="searchQuery" 
            :placeholder="$t('common.search')" 
            class="search-input p-inputtext-sm"
            rounded
          />
        </div>
      </div>
      
      <div class="header-actions">
        <!-- 主題切換 -->
        <Button 
          :icon="themeIcon" 
          rounded 
          outlined 
          severity="secondary" 
          @click="toggleTheme" 
          v-tooltip.bottom="themeTitle"
          class="header-btn"
        />
        
        <!-- 語言切換 -->
        <Button 
          icon="pi pi-globe" 
          :label="currentLang" 
          rounded 
          outlined 
          severity="secondary" 
          @click="toggleLanguage" 
          v-tooltip.bottom="$t('settings.language')"
          class="header-btn lang-btn"
        />

        <div class="user-profile" v-tooltip.bottom="'Guest User'">
          <div class="avatar-circle">
            <i class="pi pi-user"></i>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '../../stores/preferences'
import { useMusicLibraryStore } from '../../stores/musicLibrary'

const preferencesStore = usePreferencesStore()
const libraryStore = useMusicLibraryStore()
const { locale, t } = useI18n()

const searchQuery = ref('')

const themeIcon = computed(() => {
  return preferencesStore.theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'
})

const themeTitle = computed(() => {
  return preferencesStore.theme === 'dark' ? t('theme.light') : t('theme.dark')
})

const currentLang = computed(() => {
  return locale.value === 'zh-TW' ? '繁中' : 'EN'
})

const toggleTheme = () => {
  const newTheme = preferencesStore.theme === 'dark' ? 'light' : 'dark'
  preferencesStore.setTheme(newTheme)
}

const toggleLanguage = () => {
  const newLang = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
  locale.value = newLang
  preferencesStore.setLanguage(newLang)
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 500;
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-xl);
  background: rgba(5, 11, 24, 0.4);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-bottom: 1px solid var(--glass-border);
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
}

.search-container {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding-left: 40px !important;
  border-radius: 20px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid var(--glass-border) !important;
  transition: all 0.3s ease !important;
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: var(--accent-primary) !important;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.15) !important;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  width: 40px;
  height: 40px;
  border-color: var(--glass-border) !important;
}

.lang-btn {
  width: auto !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  font-weight: 700 !important;
  font-size: 0.85rem !important;
}

.user-profile {
  cursor: pointer;
  padding-left: 8px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--grad-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: transform 0.3s ease;
}

.avatar-circle:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .search-container {
    max-width: 200px;
  }
}
</style>
