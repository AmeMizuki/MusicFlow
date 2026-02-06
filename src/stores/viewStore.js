import { defineStore } from 'pinia'

export const useViewStore = defineStore('view', {
  state: () => ({
    currentView: 'library', // 'library', 'playlists', 'upload', 'settings', 'playlist-detail'
    selectedPlaylistId: null,
    isQueueOpen: false,
    isSidebarCollapsed: false
  }),

  actions: {
    setView(view, params = {}) {
      this.currentView = view
      if (params.playlistId) {
        this.selectedPlaylistId = params.playlistId
      }
    },
    
    toggleQueue() {
      this.isQueueOpen = !this.isQueueOpen
    },

    closeQueue() {
      this.isQueueOpen = false
    },

    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    }
  }
})
