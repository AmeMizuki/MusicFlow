/**
 * 播放清單 Store
 * 管理使用者建立的播放清單
 * 
 * 驗證需求：3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */

import { defineStore } from 'pinia'
import { saveToStorage, loadFromStorage } from '../services/storageService'

/**
 * 生成唯一 ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const usePlaylistStore = defineStore('playlist', {
  state: () => ({
    playlists: []  // Playlist[]
  }),

  getters: {
    /**
     * 根據 ID 獲取播放清單
     */
    getPlaylistById: (state) => (id) => {
      return state.playlists.find(p => p.id === id)
    },

    /**
     * 獲取包含指定音樂的播放清單
     */
    getPlaylistsContainingMusic: (state) => (musicId) => {
      return state.playlists.filter(p => p.musicIds.includes(musicId))
    },

    /**
     * 獲取播放清單總數
     */
    totalPlaylists: (state) => state.playlists.length
  },

  actions: {
    /**
     * 建立播放清單
     * 
     * @param {string} name - 播放清單名稱
     * @param {string} description - 描述
     * @returns {object} 新建立的播放清單
     * 
     * 驗證需求：3.1
     */
    createPlaylist(name, description = '') {
      if (!name || typeof name !== 'string') {
        throw new Error('播放清單名稱必須是非空字串')
      }

      const playlist = {
        id: generateId(),
        name: name.trim(),
        description: description.trim(),
        musicIds: [],
        coverArt: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      this.playlists.push(playlist)
      this.saveToStorage()

      return playlist
    },

    /**
     * 刪除播放清單
     * 
     * @param {string} id - 播放清單 ID
     * 
     * 驗證需求：3.4
     */
    deletePlaylist(id) {
      const index = this.playlists.findIndex(p => p.id === id)
      if (index !== -1) {
        this.playlists.splice(index, 1)
        this.saveToStorage()
      }
    },

    /**
     * 更新播放清單
     * 
     * @param {string} id - 播放清單 ID
     * @param {object} updates - 要更新的欄位
     */
    updatePlaylist(id, updates) {
      const playlist = this.getPlaylistById(id)
      if (!playlist) return

      if (updates.name !== undefined) {
        playlist.name = updates.name
      }
      if (updates.description !== undefined) {
        playlist.description = updates.description
      }

      playlist.updatedAt = Date.now()
      this.saveToStorage()
    },

    /**
     * 將音樂加入播放清單
     * 
     * @param {string} playlistId - 播放清單 ID
     * @param {string} musicId - 音樂 ID
     * 
     * 驗證需求：3.2
     */
    addMusicToPlaylist(playlistId, musicId) {
      const playlist = this.getPlaylistById(playlistId)
      if (!playlist) return

      // 避免重複加入
      if (!playlist.musicIds.includes(musicId)) {
        playlist.musicIds.push(musicId)
        playlist.updatedAt = Date.now()
        this.saveToStorage()
      }
    },

    /**
     * 從播放清單移除音樂
     * 
     * @param {string} playlistId - 播放清單 ID
     * @param {string} musicId - 音樂 ID
     * 
     * 驗證需求：3.3
     */
    removeMusicFromPlaylist(playlistId, musicId) {
      const playlist = this.getPlaylistById(playlistId)
      if (!playlist) return

      const index = playlist.musicIds.indexOf(musicId)
      if (index !== -1) {
        playlist.musicIds.splice(index, 1)
        playlist.updatedAt = Date.now()
        this.saveToStorage()
      }
    },

    /**
     * 重新排序播放清單中的音樂
     * 
     * @param {string} playlistId - 播放清單 ID
     * @param {number} oldIndex - 原始索引
     * @param {number} newIndex - 新索引
     * 
     * 驗證需求：3.5
     */
    reorderPlaylist(playlistId, oldIndex, newIndex) {
      const playlist = this.getPlaylistById(playlistId)
      if (!playlist) return

      if (oldIndex < 0 || oldIndex >= playlist.musicIds.length) return
      if (newIndex < 0 || newIndex >= playlist.musicIds.length) return

      const musicIds = [...playlist.musicIds]
      const [removed] = musicIds.splice(oldIndex, 1)
      musicIds.splice(newIndex, 0, removed)

      playlist.musicIds = musicIds
      playlist.updatedAt = Date.now()
      this.saveToStorage()
    },

    /**
     * 匯出播放清單為 JSON
     * 
     * @param {string} id - 播放清單 ID
     * @returns {string} JSON 字串
     * 
     * 驗證需求：3.6
     */
    exportPlaylist(id) {
      const playlist = this.getPlaylistById(id)
      if (!playlist) {
        throw new Error('播放清單不存在')
      }

      // 需要包含音樂的詳細資訊以便導入
      const { useMusicLibraryStore } = require('./musicLibrary')
      const library = useMusicLibraryStore()

      const exportData = {
        name: playlist.name,
        description: playlist.description,
        createdAt: playlist.createdAt,
        music: playlist.musicIds.map(id => {
          const music = library.getMusicById(id)
          return music ? {
            title: music.title,
            artist: music.artist,
            album: music.album,
            duration: music.duration,
            format: music.format
          } : null
        }).filter(m => m !== null)
      }

      return JSON.stringify(exportData, null, 2)
    },

    /**
     * 從 JSON 導入播放清單
     * 
     * @param {string} jsonData - JSON 字串
     * @returns {object} 導入結果
     * 
     * 驗證需求：3.7, 3.8
     */
    importPlaylist(jsonData) {
      try {
        const data = JSON.parse(jsonData)

        // 驗證資料格式
        if (!data.name || typeof data.name !== 'string') {
          throw new Error('播放清單資料不完整：缺少名稱')
        }

        if (!Array.isArray(data.music)) {
          throw new Error('播放清單資料不完整：缺少音樂列表')
        }

        // 建立新播放清單
        const playlist = this.createPlaylist(
          data.name,
          data.description || ''
        )

        // 嘗試匹配音樂庫中的音樂
        const { useMusicLibraryStore } = require('./musicLibrary')
        const library = useMusicLibraryStore()

        let matchedCount = 0
        data.music.forEach(importedMusic => {
          // 嘗試在音樂庫中找到匹配的音樂
          const match = library.music.find(m => 
            m.title === importedMusic.title &&
            m.artist === importedMusic.artist &&
            m.album === importedMusic.album
          )

          if (match) {
            this.addMusicToPlaylist(playlist.id, match.id)
            matchedCount++
          }
        })

        return {
          success: true,
          playlist,
          totalMusic: data.music.length,
          matchedMusic: matchedCount,
          unmatchedMusic: data.music.length - matchedCount
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error('無效的播放清單檔案：JSON 格式錯誤')
        }
        throw error
      }
    },

    /**
     * 從本地儲存載入
     */
    loadFromStorage() {
      try {
        const data = loadFromStorage('playlists', { playlists: [] })
        this.playlists = data.playlists || []
      } catch (error) {
        console.error('載入播放清單失敗', error)
      }
    },

    /**
     * 儲存到本地儲存
     */
    saveToStorage() {
      try {
        saveToStorage('playlists', {
          playlists: this.playlists
        })
      } catch (error) {
        console.error('儲存播放清單失敗', error)
        throw error
      }
    }
  }
})
