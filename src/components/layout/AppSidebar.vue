<template>
  <aside class="app-sidebar" :class="{ collapsed: viewStore.isSidebarCollapsed }">
    <!-- Logo Section -->
    <div class="sidebar-logo" @click="viewStore.setView('library')">
      <div class="logo-icon">
        <img src="/logo.svg" alt="Logo" class="sidebar-logo-img" />
      </div>
      <span class="logo-text">MusicFlow</span>
    </div>

    <!-- Main Navigation -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div 
          v-for="item in navItems" 
          :key="item.id"
          class="nav-item"
          :class="{ active: currentBaseView === item.id }"
          @click="viewStore.setView(item.id)"
          v-tooltip.right="viewStore.isSidebarCollapsed ? $t(`nav.${item.id}`) : null"
        >
          <i :class="item.icon"></i>
          <span class="nav-label">{{ $t(`nav.${item.id}`) }}</span>
          <div v-if="currentBaseView === item.id" class="active-indicator"></div>
        </div>
      </div>
    </nav>

    <!-- Playlists Section -->
    <div class="sidebar-playlists">
      <div class="section-header">
        <span class="section-title">{{ $t('nav.my_playlists') }}</span>
        <Button 
          icon="pi pi-plus" 
          text 
          rounded 
          size="small" 
          class="add-playlist-btn"
          @click="playlistStore.showCreateDialog = true"
          v-tooltip.top="$t('playlists.create')"
        />
      </div>

      <div class="playlist-list-scroll">
        <div v-if="playlistStore.playlists.length === 0" class="empty-playlists">
          <p>{{ $t('playlists.empty') }}</p>
        </div>
        <div 
          v-for="playlist in playlistStore.playlists" 
          :key="playlist.id"
          class="playlist-item"
          :class="{ active: viewStore.currentView === 'playlist-detail' && viewStore.selectedPlaylistId === playlist.id }"
          @click="viewStore.setView('playlist-detail', { playlistId: playlist.id })"
        >
          <i class="pi pi-list"></i>
          <span class="playlist-name">{{ playlist.name }}</span>
        </div>
      </div>
    </div>

    <!-- User Profile / Bottom Actions -->
    <div class="sidebar-footer">
      <div class="sidebar-toggle" @click="viewStore.toggleSidebar">
        <i :class="viewStore.isSidebarCollapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'"></i>
        <span class="nav-label">{{ viewStore.isSidebarCollapsed ? $t('common.expand') : $t('common.collapse') }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useViewStore } from '../../stores/viewStore'
import { useMusicLibraryStore } from '../../stores/musicLibrary'
import { usePlaylistStore } from '../../stores/playlist'

const viewStore = useViewStore()
const libraryStore = useMusicLibraryStore()
const playlistStore = usePlaylistStore()

const navItems = [
  { id: 'library', icon: 'pi pi-home' },
  { id: 'liked', icon: 'pi pi-heart' },
  { id: 'playlists', icon: 'pi pi-list' },
  { id: 'upload', icon: 'pi pi-cloud-upload' },
  { id: 'settings', icon: 'pi pi-cog' },
  { id: 'about', icon: 'pi pi-info-circle' }
]

const currentBaseView = computed(() => {
  if (viewStore.currentView === 'playlist-detail') return 'playlists'
  return viewStore.currentView
})
</script>

<style scoped>
.app-sidebar {
  width: 260px;
  height: 100vh;
  background: rgba(10, 18, 38, 0.6);
  backdrop-filter: blur(30px);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  position: relative;
}

.app-sidebar.collapsed {
  width: 80px;
}

.sidebar-logo {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.logo-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 900;
  background: var(--grad-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s;
}

.collapsed .logo-text {
  opacity: 0;
  width: 0;
  pointer-events: none;
}

.sidebar-nav {
  padding: 12px;
}

.nav-item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  border-radius: 12px;
  margin-bottom: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  position: relative;
  transition: all 0.3s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, transparent 100%);
  color: var(--accent-primary);
}

.nav-item i {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-label {
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.2s;
}

.collapsed .nav-label {
  opacity: 0;
  width: 0;
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 15%;
  width: 4px;
  background: var(--accent-primary);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.sidebar-playlists {
  flex: 1;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-tertiary);
  letter-spacing: 1px;
}

.collapsed .section-title,
.collapsed .add-playlist-btn {
  display: none;
}

.playlist-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.playlist-item {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  border-radius: 8px;
  margin-bottom: 2px;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.2s;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
}

.playlist-item.active {
  color: var(--accent-secondary);
}

.play.logo-icon i {
  font-size: 1.2rem;
}

.sidebar-logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.playlist-name {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapsed .playlist-item {
  justify-content: center;
  padding: 0;
}

.collapsed .playlist-name {
  display: none;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--glass-border);
}

.sidebar-toggle {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  border-radius: 12px;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.3s;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.collapsed .sidebar-toggle {
  justify-content: center;
  padding: 0;
}

/* Scrollbar styling */
.playlist-list-scroll::-webkit-scrollbar {
  width: 4px;
}

.playlist-list-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.playlist-list-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
