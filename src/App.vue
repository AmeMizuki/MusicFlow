<template>
  <div id="app" :class="themeClass">
    <!-- Animated Gradient Mesh Background -->
    <div class="mesh-background">
      <div class="mesh-circle circle-1"></div>
      <div class="mesh-circle circle-2"></div>
      <div class="mesh-circle circle-3"></div>
      <div class="mesh-circle circle-4"></div>
    </div>
    
    <div class="app-layout" :class="{ 'sidebar-collapsed': viewStore.isSidebarCollapsed }">
      <AppSidebar />
      
      <div class="main-container">
        <AppHeader />
        
        <main class="content-area">
          <transition name="view-fade" mode="out-in">
            <component :is="activeView" />
          </transition>
        </main>
      </div>

      <AppQueue />
      <AppPlayer />
    </div>

    <!-- Global Toast -->
    <Toast position="bottom-right" />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { usePreferencesStore } from './stores/preferences'
import { useMusicLibraryStore } from './stores/musicLibrary'
import { useViewStore } from './stores/viewStore'
import { usePlayerStore } from './stores/player'
import { usePlaylistStore } from './stores/playlist'
import { useI18n } from 'vue-i18n'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'

// 組件導入
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppPlayer from './components/layout/AppPlayer.vue'
import AppQueue from './components/layout/AppQueue.vue'

// 視圖導入
import LibraryView from './views/LibraryView.vue'
import PlaylistsView from './views/PlaylistsView.vue'
import PlaylistDetailView from './views/PlaylistDetailView.vue'
import UploadView from './views/UploadView.vue'
import SettingsView from './views/SettingsView.vue'
import AboutView from './views/AboutView.vue'
import LikedView from './views/LikedView.vue'

const preferencesStore = usePreferencesStore()
const musicLibrary = useMusicLibraryStore()
const playerStore = usePlayerStore()
const viewStore = useViewStore()
const playlistStore = usePlaylistStore()
const { locale } = useI18n()

const themeClass = computed(() => `theme-${preferencesStore.theme}`)

const activeView = computed(() => {
  const views = {
    library: LibraryView,
    playlists: PlaylistsView,
    'playlist-detail': PlaylistDetailView,
    upload: UploadView,
    settings: SettingsView,
    about: AboutView,
    liked: LikedView
  }
  return views[viewStore.currentView] || LibraryView
})

// 監聽主題變化並同步到 HTML 根節點
watch(themeClass, (newClass) => {
  document.documentElement.className = newClass
}, { immediate: true })

// 初始化
onMounted(() => {
  preferencesStore.loadFromStorage()
  musicLibrary.loadFromStorage()
  playerStore.loadFromStorage()
  playlistStore.loadFromStorage()
  
  // 同步語系
  if (preferencesStore.language) {
    locale.value = preferencesStore.language
  }
  
  document.documentElement.className = themeClass.value
})

// 啟用鍵盤快捷鍵
useKeyboardShortcuts()
</script>

<style>
/* Reset and Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  color: var(--text-primary);
  font-family: var(--font-family);
  background: var(--bg-primary);
  position: relative;
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

button {
  cursor: pointer;
  font-family: inherit;
  border: none;
  background: none;
  outline: none;
}

/* Animated Mesh Background - Navy & Mystic Purple */
.mesh-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--grad-bg);
  z-index: 0;
  overflow: hidden;
}

.mesh-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  animation: mesh-float 20s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
}

.circle-1 {
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
  top: -15%;
  left: -10%;
}

.circle-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
  bottom: -10%;
  right: -5%;
  animation-delay: -5s;
}

.circle-3 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(96, 32, 128, 0.12) 0%, transparent 70%);
  top: 30%;
  right: 15%;
  animation-delay: -10s;
}

.circle-4 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  bottom: 20%;
  left: 10%;
  animation-delay: -15s;
}

@keyframes mesh-float {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(100px, 50px) scale(1.05) rotate(5deg); }
  100% { transform: translate(-50px, 100px) scale(0.95) rotate(-5deg); }
}

.app-layout {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100vh;
  width: 100vw;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: rgba(5, 11, 24, 0.3);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  transition: all 0.4s ease;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding: 0 var(--spacing-xl) 120px;
}

/* View Transitions */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scrollbar Global Styles */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  transition: all 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.theme-light .main-container {
  background: rgba(255, 255, 255, 0.35);
}

/* PrimeVue Overrides for Dark Theme consistency */
.theme-dark .p-dialog {
  background: rgba(10, 18, 38, 0.95) !important;
  backdrop-filter: blur(30px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

.theme-dark .p-dialog-header, .theme-dark .p-dialog-content, .theme-dark .p-dialog-footer {
  background: transparent !important;
  color: white !important;
}

.theme-dark .p-inputtext {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.theme-dark .p-inputtext:focus {
  border-color: var(--accent-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.2) !important;
}

/* Responsive Fixes */
@media (max-width: 1024px) {
  .content-area {
    padding: 0 var(--spacing-lg) 130px;
  }
}

@media (max-width: 768px) {
  .content-area {
    padding: 0 var(--spacing-md) 150px;
  }
}
</style>
