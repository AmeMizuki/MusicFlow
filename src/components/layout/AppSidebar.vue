<template>
  <aside 
    class="app-sidebar glass-panel"
    :class="{ collapsed: viewStore.isSidebarCollapsed }"
  >
    <div class="sidebar-header">
      <div class="logo-area" @click="viewStore.setView('library')">
        <img src="/logo.svg" alt="MusicFlow Logo" class="logo-img" />
        <span v-if="!viewStore.isSidebarCollapsed" class="logo-text">MusicFlow</span>
      </div>
      <button 
        class="collapse-toggle" 
        @click="viewStore.toggleSidebar"
        v-tooltip.right="viewStore.isSidebarCollapsed ? $t('common.expand') : $t('common.collapse')"
      >
        <i :class="viewStore.isSidebarCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <button 
        v-for="item in navItems" 
        :key="item.id"
        class="nav-item"
        :class="{ active: currentBaseView === item.id }"
        @click="viewStore.setView(item.id)"
        v-tooltip.right="viewStore.isSidebarCollapsed ? $t(`nav.${item.id}`) : null"
      >
        <i :class="item.icon"></i>
        <span v-if="!viewStore.isSidebarCollapsed">{{ $t(`nav.${item.id}`) }}</span>
      </button>

      <div class="nav-divider"></div>
      
      <div v-if="!viewStore.isSidebarCollapsed" class="sidebar-section">
        <span class="section-title">{{ $t('nav.my_playlists') }}</span>
        <div class="playlist-quick-list">
          <button 
            v-for="playlist in playlistStore.playlists.slice(0, 5)" 
            :key="playlist.id"
            class="playlist-link"
            :class="{ active: viewStore.currentView === 'playlist-detail' && viewStore.selectedPlaylistId === playlist.id }"
            @click="viewStore.setView('playlist-detail', { playlistId: playlist.id })"
          >
            <i class="pi pi-list"></i>
            <span class="p-name">{{ playlist.name }}</span>
          </button>
          <button v-if="playlistStore.playlists.length > 0" class="view-all-link" @click="viewStore.setView('playlists')">
            {{ $t('common.view_all') }}
          </button>
        </div>
      </div>
      <div v-else class="sidebar-section collapsed-center">
        <button 
          class="nav-item tray-btn" 
          @click="viewStore.setView('playlists')"
          v-tooltip.right="$t('nav.playlists')"
        >
          <i class="pi pi-list"></i>
        </button>
      </div>
    </nav>

    <div v-if="!viewStore.isSidebarCollapsed" class="sidebar-footer">
      <div class="stats-card glass">
        <div class="stat-item">
          <i class="pi pi-music stat-icon"></i>
          <span class="stat-value">{{ libraryStore.totalMusic }}</span>
          <span class="stat-label">{{ $t('stats.music') }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <i class="pi pi-folder stat-icon"></i>
          <span class="stat-value">{{ libraryStore.getAlbums.length }}</span>
          <span class="stat-label">{{ $t('stats.albums') }}</span>
        </div>
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
  { id: 'library', icon: 'pi pi-compass' },
  { id: 'playlists', icon: 'pi pi-clone' },
  { id: 'upload', icon: 'pi pi-cloud-upload' },
  { id: 'settings', icon: 'pi pi-cog' }
]

const currentBaseView = computed(() => {
  if (viewStore.currentView === 'playlist-detail') return 'playlists'
  return viewStore.currentView
})
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
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-bottom: 1px solid var(--glass-border);
}
.app-sidebar {
  width: 260px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg) var(--spacing-md);
  background: var(--bg-secondary);
  border-right: 1px solid var(--glass-border);
  position: relative;
  z-index: 100;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
}

.app-sidebar.collapsed {
  width: 80px;
  padding: var(--spacing-lg) var(--spacing-xs);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xs);
  margin-bottom: var(--spacing-xl);
  min-height: 48px;
  position: relative;
}

.collapsed .sidebar-header {
  flex-direction: column;
  gap: 12px;
  padding: 0;
  justify-content: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.collapsed .logo-area {
  justify-content: center;
  width: 100%;
  padding-bottom: 20px;
}

.collapsed .logo-img {
  width: 28px;
  height: 28px;
}

.logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(79, 70, 229, 0.3));
}

.logo-text {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -1.2px;
  background: var(--grad-primary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.collapse-toggle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  cursor: pointer;
  z-index: 10;
}

.collapsed .collapse-toggle {
  position: absolute;
  top: 50%;
  right: -14px;
  transform: translateY(-50%);
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  box-shadow: 4px 0 15px rgba(59, 130, 246, 0.4);
}

.collapse-toggle:hover {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  transform: scale(1.1);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 12px 16px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 12px;
  transition: all var(--transition-normal);
  font-weight: 600;
  white-space: nowrap;
}

.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
  width: 52px;
  margin: 0 auto;
}

.nav-item i {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: white;
  background: var(--grad-primary);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.nav-item.active i {
  color: white;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.nav-divider {
  height: 1px;
  background: var(--glass-border);
  margin: var(--spacing-md) var(--spacing-sm);
}

.sidebar-section {
  padding: 0 var(--spacing-sm);
}

.collapsed-center {
  display: flex;
  justify-content: center;
}

.section-title {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  padding-left: 8px;
}

.playlist-quick-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.playlist-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  text-align: left;
}

.playlist-link i {
  font-size: 1rem;
  color: var(--text-tertiary);
}

.playlist-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.playlist-link.active {
  color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.08);
}

.p-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-all-link {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  padding: 8px 12px;
  font-weight: 600;
}

.view-all-link:hover {
  color: var(--accent-primary);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
}

.stats-card {
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--grad-surface);
  border: 1px solid var(--glass-border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-icon {
  font-size: 0.85rem;
  color: var(--accent-primary);
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.6rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: var(--glass-border);
}
</style>
