/**
 * 播放器 Store
 * 管理音樂播放狀態和控制
 * 
 * 驗證需求：2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
 */

import { defineStore } from 'pinia'
import { saveToStorage, loadFromStorage } from '../services/storageService'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentMusicId: null,
    isPlaying: false,
    currentTime: 0,
    volume: 0.7,
    isMuted: false,
    playMode: 'sequential', // 'sequential', 'repeat-one', 'repeat-all', 'shuffle'
    queue: [],
    queueIndex: -1,
    shuffleQueue: null
  }),

  getters: {
    /**
     * 獲取當前播放的音樂
     */
    currentMusic: (state) => {
      if (!state.currentMusicId) return null
      
      // 需要從 musicLibrary store 獲取
      const { useMusicLibraryStore } = require('./musicLibrary')
      const library = useMusicLibraryStore()
      return library.getMusicById(state.currentMusicId)
    },

    /**
     * 是否有下一首
     */
    hasNext: (state) => {
      if (state.playMode === 'repeat-one') return true
      if (state.playMode === 'repeat-all') return true
      if (state.playMode === 'shuffle' && state.shuffleQueue) {
        return state.queueIndex < state.shuffleQueue.length - 1
      }
      return state.queueIndex < state.queue.length - 1
    },

    /**
     * 是否有上一首
     */
    hasPrevious: (state) => {
      if (state.playMode === 'repeat-one') return true
      if (state.playMode === 'repeat-all') return true
      return state.queueIndex > 0
    },

    /**
     * 獲取當前播放佇列
     */
    currentQueue: (state) => {
      if (state.playMode === 'shuffle' && state.shuffleQueue) {
        return state.shuffleQueue
      }
      return state.queue
    }
  },

  actions: {
    /**
     * 播放音樂
     * 
     * @param {string} musicId - 音樂 ID
     * 
     * 驗證需求：2.1
     */
    play(musicId) {
      if (!musicId) return

      this.currentMusicId = musicId
      this.isPlaying = true

      // 更新佇列索引
      const queue = this.playMode === 'shuffle' && this.shuffleQueue 
        ? this.shuffleQueue 
        : this.queue
      
      const index = queue.indexOf(musicId)
      if (index !== -1) {
        this.queueIndex = index
      }

      this.saveToStorage()
    },

    /**
     * 暫停播放
     * 
     * 驗證需求：2.2
     */
    pause() {
      this.isPlaying = false
      this.saveToStorage()
    },

    /**
     * 切換播放/暫停
     * 
     * 驗證需求：2.1, 2.2
     */
    togglePlayPause() {
      this.isPlaying = !this.isPlaying
      this.saveToStorage()
    },

    /**
     * 下一首
     * 
     * 驗證需求：2.3
     */
    next() {
      if (!this.hasNext) return

      const queue = this.playMode === 'shuffle' && this.shuffleQueue 
        ? this.shuffleQueue 
        : this.queue

      if (this.playMode === 'repeat-one') {
        // 單曲循環：重新播放當前歌曲
        this.currentTime = 0
        return
      }

      if (this.queueIndex < queue.length - 1) {
        // 播放下一首
        this.queueIndex++
        this.currentMusicId = queue[this.queueIndex]
        this.currentTime = 0
      } else if (this.playMode === 'repeat-all' || this.playMode === 'shuffle') {
        // 播放清單循環或隨機播放：回到第一首
        this.queueIndex = 0
        this.currentMusicId = queue[0]
        this.currentTime = 0
      }

      this.saveToStorage()
    },

    /**
     * 上一首
     * 
     * 驗證需求：2.4
     */
    previous() {
      if (!this.hasPrevious) return

      const queue = this.playMode === 'shuffle' && this.shuffleQueue 
        ? this.shuffleQueue 
        : this.queue

      if (this.playMode === 'repeat-one') {
        // 單曲循環：重新播放當前歌曲
        this.currentTime = 0
        return
      }

      if (this.queueIndex > 0) {
        // 播放上一首
        this.queueIndex--
        this.currentMusicId = queue[this.queueIndex]
        this.currentTime = 0
      } else if (this.playMode === 'repeat-all' || this.playMode === 'shuffle') {
        // 播放清單循環或隨機播放：回到最後一首
        this.queueIndex = queue.length - 1
        this.currentMusicId = queue[this.queueIndex]
        this.currentTime = 0
      }

      this.saveToStorage()
    },

    /**
     * 跳轉到指定時間
     * 
     * @param {number} time - 時間（秒）
     * 
     * 驗證需求：2.5
     */
    seek(time) {
      if (typeof time !== 'number' || time < 0) return
      this.currentTime = time
    },

    /**
     * 設定音量
     * 
     * @param {number} volume - 音量（0-1）
     * 
     * 驗證需求：2.6
     */
    setVolume(volume) {
      if (typeof volume !== 'number') return
      this.volume = Math.max(0, Math.min(1, volume))
      this.saveToStorage()
    },

    /**
     * 切換靜音
     */
    toggleMute() {
      this.isMuted = !this.isMuted
      this.saveToStorage()
    },

    /**
     * 設定播放模式
     * 
     * @param {string} mode - 播放模式
     * 
     * 驗證需求：2.7, 2.8, 2.9
     */
    setPlayMode(mode) {
      const validModes = ['sequential', 'repeat-one', 'repeat-all', 'shuffle']
      if (!validModes.includes(mode)) return

      this.playMode = mode

      // 如果切換到隨機播放，生成隨機佇列
      if (mode === 'shuffle') {
        this.shuffleQueue = this.generateShuffleQueue()
      } else {
        this.shuffleQueue = null
      }

      this.saveToStorage()
    },

    /**
     * 設定播放佇列
     * 
     * @param {string[]} musicIds - 音樂 ID 陣列
     */
    setQueue(musicIds) {
      if (!Array.isArray(musicIds)) return

      this.queue = musicIds
      this.queueIndex = -1

      // 如果是隨機播放模式，重新生成隨機佇列
      if (this.playMode === 'shuffle') {
        this.shuffleQueue = this.generateShuffleQueue()
      }

      this.saveToStorage()
    },

    /**
     * 生成隨機播放佇列（Fisher-Yates 洗牌演算法）
     * 
     * @returns {string[]} 隨機排序的音樂 ID 陣列
     * 
     * 驗證需求：2.9
     */
    generateShuffleQueue() {
      if (this.queue.length === 0) return []

      const shuffled = [...this.queue]
      
      // Fisher-Yates 洗牌演算法
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      return shuffled
    },

    /**
     * 從本地儲存載入
     */
    loadFromStorage() {
      try {
        const data = loadFromStorage('player-state', {
          volume: 0.7,
          isMuted: false,
          playMode: 'sequential',
          queue: [],
          queueIndex: -1
        })

        this.volume = data.volume || 0.7
        this.isMuted = data.isMuted || false
        this.playMode = data.playMode || 'sequential'
        this.queue = data.queue || []
        this.queueIndex = data.queueIndex || -1

        // 不恢復播放狀態，避免自動播放
        this.currentMusicId = null
        this.isPlaying = false
        this.currentTime = 0
        this.shuffleQueue = null
      } catch (error) {
        console.error('載入播放器狀態失敗', error)
      }
    },

    /**
     * 儲存到本地儲存
     */
    saveToStorage() {
      try {
        saveToStorage('player-state', {
          volume: this.volume,
          isMuted: this.isMuted,
          playMode: this.playMode,
          queue: this.queue,
          queueIndex: this.queueIndex
        })
      } catch (error) {
        console.error('儲存播放器狀態失敗', error)
      }
    }
  }
})
