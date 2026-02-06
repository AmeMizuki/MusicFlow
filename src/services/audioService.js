/**
 * 音訊播放服務
 * 使用 HTML5 Audio API 控制音樂播放
 * 
 * 驗證需求：2.1, 2.2, 2.5, 2.6, 2.11
 */

class AudioService {
  constructor() {
    this.audio = new Audio()
    this.currentFile = null
    this.onTimeUpdateCallback = null
    this.onEndedCallback = null
    this.onErrorCallback = null
    this.onLoadedCallback = null

    this.setupEventListeners()
  }

  /**
   * 設定事件監聽器
   */
  setupEventListeners() {
    // 時間更新事件
    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audio.currentTime)
      }
    })

    // 播放完畢事件
    this.audio.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback()
      }
    })

    // 錯誤事件
    this.audio.addEventListener('error', (error) => {
      console.error('音訊播放錯誤', error)
      if (this.onErrorCallback) {
        this.onErrorCallback(error)
      }
    })

    // 載入完成事件
    this.audio.addEventListener('loadeddata', () => {
      if (this.onLoadedCallback) {
        this.onLoadedCallback()
      }
    })
  }

  /**
   * 載入音樂檔案
   * 
   * @param {File} file - 音樂檔案
   * @returns {Promise<void>}
   */
  async load(file) {
    if (!file || !(file instanceof Blob)) {
      throw new Error('無效的檔案物件')
    }

    try {
      // 釋放舊的 URL
      if (this.currentFile) {
        URL.revokeObjectURL(this.audio.src)
      }

      // 建立新的 URL
      const url = URL.createObjectURL(file)
      this.audio.src = url
      this.currentFile = file

      // 等待載入
      await new Promise((resolve, reject) => {
        const onLoad = () => {
          this.audio.removeEventListener('loadeddata', onLoad)
          this.audio.removeEventListener('error', onError)
          resolve()
        }

        const onError = (error) => {
          this.audio.removeEventListener('loadeddata', onLoad)
          this.audio.removeEventListener('error', onError)
          reject(new Error('載入音訊檔案失敗'))
        }

        this.audio.addEventListener('loadeddata', onLoad, { once: true })
        this.audio.addEventListener('error', onError, { once: true })
      })
    } catch (error) {
      console.error('載入音樂檔案失敗', error)
      throw error
    }
  }

  /**
   * 播放
   * 
   * 驗證需求：2.1
   */
  async play() {
    try {
      await this.audio.play()
    } catch (error) {
      console.error('播放失敗', error)
      throw new Error('播放失敗：' + error.message)
    }
  }

  /**
   * 暫停
   * 
   * 驗證需求：2.2
   */
  pause() {
    this.audio.pause()
  }

  /**
   * 停止
   */
  stop() {
    this.audio.pause()
    this.audio.currentTime = 0
  }

  /**
   * 跳轉到指定時間
   * 
   * @param {number} time - 時間（秒）
   * 
   * 驗證需求：2.5
   */
  seek(time) {
    if (typeof time !== 'number' || time < 0) {
      throw new Error('無效的時間值')
    }

    if (time > this.audio.duration) {
      time = this.audio.duration
    }

    this.audio.currentTime = time
  }

  /**
   * 設定音量
   * 
   * @param {number} volume - 音量（0-1）
   * 
   * 驗證需求：2.6
   */
  setVolume(volume) {
    if (typeof volume !== 'number') {
      throw new Error('音量必須是數字')
    }

    this.audio.volume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 設定靜音狀態
   * 
   * @param {boolean} muted - 是否靜音
   */
  setMuted(muted) {
    this.audio.muted = !!muted
  }

  /**
   * 獲取當前時間
   * 
   * @returns {number} 當前時間（秒）
   */
  getCurrentTime() {
    return this.audio.currentTime
  }

  /**
   * 獲取總時長
   * 
   * @returns {number} 總時長（秒）
   */
  getDuration() {
    return this.audio.duration || 0
  }

  /**
   * 獲取音量
   * 
   * @returns {number} 音量（0-1）
   */
  getVolume() {
    return this.audio.volume
  }

  /**
   * 是否正在播放
   * 
   * @returns {boolean}
   */
  isPlaying() {
    return !this.audio.paused
  }

  /**
   * 設定時間更新回調
   * 
   * @param {Function} callback - 回調函數
   */
  onTimeUpdate(callback) {
    this.onTimeUpdateCallback = callback
  }

  /**
   * 設定播放完畢回調
   * 
   * @param {Function} callback - 回調函數
   * 
   * 驗證需求：2.11
   */
  onEnded(callback) {
    this.onEndedCallback = callback
  }

  /**
   * 設定錯誤回調
   * 
   * @param {Function} callback - 回調函數
   */
  onError(callback) {
    this.onErrorCallback = callback
  }

  /**
   * 設定載入完成回調
   * 
   * @param {Function} callback - 回調函數
   */
  onLoaded(callback) {
    this.onLoadedCallback = callback
  }

  /**
   * 清理資源
   */
  destroy() {
    this.stop()
    
    if (this.currentFile) {
      URL.revokeObjectURL(this.audio.src)
    }

    this.audio.src = ''
    this.currentFile = null
    this.onTimeUpdateCallback = null
    this.onEndedCallback = null
    this.onErrorCallback = null
    this.onLoadedCallback = null
  }
}

// 建立單例
const audioService = new AudioService()

export default audioService
