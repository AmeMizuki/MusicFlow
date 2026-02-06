/**
 * 音樂庫 Store
 * 管理音樂檔案、藝術家、專輯和收藏
 * 
 * 驗證需求：1.1, 1.3, 1.5, 4.1, 4.2, 9.1, 9.2
 */

import { defineStore } from 'pinia'
import { saveToStorage, loadFromStorage } from '../services/storageService'
import { parseFullMusicInfo } from '../services/metadataService'

/**
 * 生成唯一 ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useMusicLibraryStore = defineStore('musicLibrary', {
  state: () => ({
    music: [],              // MusicFile[]
    artists: {},            // { [artist: string]: MusicFile[] }
    albums: {},             // { [album: string]: MusicFile[] }
    likedMusic: [],         // string[] (music IDs)
    isLoading: false,
    fileCache: new Map()    // { [id: string]: File } - 僅存在於記憶體中，重新整理即消失
  }),

  getters: {
    /**
     * 根據 ID 獲取音樂
     */
    getMusicById: (state) => (id) => {
      return state.music.find(m => m.id === id)
    },

    /**
     * 獲取所有收藏的音樂
     */
    getLikedMusic: (state) => {
      return state.music.filter(m => state.likedMusic.includes(m.id))
    },

    /**
     * 獲取所有藝術家列表（排序）
     */
    getArtists: (state) => {
      return Object.keys(state.artists).sort()
    },

    /**
     * 獲取所有專輯列表（排序）
     */
    getAlbums: (state) => {
      return Object.keys(state.albums).sort()
    },

    /**
     * 根據藝術家獲取音樂
     */
    getMusicByArtist: (state) => (artist) => {
      return state.artists[artist] || []
    },

    /**
     * 根據專輯獲取音樂
     */
    getMusicByAlbum: (state) => (album) => {
      return state.albums[album] || []
    },

    /**
     * 獲取音樂總數
     */
    totalMusic: (state) => state.music.length,

    /**
     * 獲取收藏總數
     */
    totalLiked: (state) => state.likedMusic.length
  },

  actions: {
    /**
     * 加入音樂檔案
     * 
     * @param {File[]} files - 音樂檔案陣列
     * @returns {Promise<object>} 加入結果
     * 
     * 驗證需求：1.1
     */
    async addMusic(files) {
      this.isLoading = true
      const results = {
        success: [],
        failed: []
      }

      try {
        for (const file of files) {
          try {
            // 解析音樂檔案資訊
            const info = await parseFullMusicInfo(file)

            // 建立音樂物件
            const music = {
              id: generateId(),
              title: info.title,
              artist: info.artist,
              album: info.album,
              duration: info.duration,
              fileSize: info.fileSize,
              format: info.format,
              fileName: info.fileName,
              coverArt: info.coverArt,
              year: info.year,
              genre: info.genre,
              track: info.track,
              liked: false,
              addedAt: Date.now(),
              lastPlayedAt: null
            }

            // 快取實際檔案到記憶體（不持久化）
            this.fileCache.set(music.id, file)

            // 加入到音樂庫
            this.music.push(music)
            results.success.push(music)
          } catch (error) {
            console.error(`加入音樂失敗：${file.name}`, error)
            results.failed.push({
              fileName: file.name,
              error: error.message
            })
          }
        }

        // 重新分類
        this.categorizeMusic()

        // 儲存到本地儲存
        this.saveToStorage()

        return results
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 移除音樂
     * 
     * @param {string} id - 音樂 ID
     * 
     * 驗證需求：1.1
     */
    removeMusic(id) {
      const index = this.music.findIndex(m => m.id === id)
      if (index !== -1) {
        this.music.splice(index, 1)

        // 從記憶體中移除
        this.fileCache.delete(id)

        // 從收藏中移除
        const likedIndex = this.likedMusic.indexOf(id)
        if (likedIndex !== -1) {
          this.likedMusic.splice(likedIndex, 1)
        }

        // 重新分類
        this.categorizeMusic()

        // 儲存到本地儲存
        this.saveToStorage()
      }
    },

    /**
     * 切換收藏狀態
     * 
     * @param {string} id - 音樂 ID
     * 
     * 驗證需求：4.1, 4.2
     */
    toggleLike(id) {
      const music = this.getMusicById(id)
      if (!music) return

      const likedIndex = this.likedMusic.indexOf(id)
      if (likedIndex !== -1) {
        // 取消收藏
        this.likedMusic.splice(likedIndex, 1)
        music.liked = false
      } else {
        // 加入收藏
        this.likedMusic.push(id)
        music.liked = true
      }

      // 儲存到本地儲存
      this.saveToStorage()
    },

    /**
     * 分類音樂（按藝術家和專輯）
     * 
     * 驗證需求：9.1, 9.2
     */
    categorizeMusic() {
      // 清空現有分類
      this.artists = {}
      this.albums = {}

      // 重新分類
      this.music.forEach(music => {
        // 按藝術家分類
        if (!this.artists[music.artist]) {
          this.artists[music.artist] = []
        }
        this.artists[music.artist].push(music)

        // 按專輯分類
        if (!this.albums[music.album]) {
          this.albums[music.album] = []
        }
        this.albums[music.album].push(music)
      })
    },

    /**
     * 從本地儲存載入
     * 
     * 驗證需求：1.3, 1.5
     */
    loadFromStorage() {
      try {
        const data = loadFromStorage('music-library', {
          music: [],
          likedMusic: []
        })

        this.music = data.music || []
        this.likedMusic = data.likedMusic || []

        // 更新音樂的 liked 狀態
        this.music.forEach(music => {
          music.liked = this.likedMusic.includes(music.id)
        })

        // 重新分類
        this.categorizeMusic()
      } catch (error) {
        console.error('載入音樂庫失敗', error)
      }
    },

    /**
     * 儲存到本地儲存
     * 
     * 驗證需求：1.3
     */
    saveToStorage() {
      try {
        // 只儲存必要的資料（不包含 coverArt，太大）
        const musicToSave = this.music.map(m => ({
          id: m.id,
          title: m.title,
          artist: m.artist,
          album: m.album,
          duration: m.duration,
          fileSize: m.fileSize,
          format: m.format,
          fileName: m.fileName,
          year: m.year,
          genre: m.genre,
          track: m.track,
          liked: m.liked,
          addedAt: m.addedAt,
          lastPlayedAt: m.lastPlayedAt
        }))

        saveToStorage('music-library', {
          music: musicToSave,
          likedMusic: this.likedMusic
        })
      } catch (error) {
        console.error('儲存音樂庫失敗', error)
        throw error
      }
    },

    /**
     * 更新音樂的最後播放時間
     * 
     * @param {string} id - 音樂 ID
     */
    updateLastPlayed(id) {
      const music = this.getMusicById(id)
      if (music) {
        music.lastPlayedAt = Date.now()
        this.saveToStorage()
      }
    },

    /**
     * 清空音樂庫
     */
    clearLibrary() {
      this.music = []
      this.artists = {}
      this.albums = {}
      this.likedMusic = []
      this.fileCache.clear()
      this.saveToStorage()
    }
  }
})
