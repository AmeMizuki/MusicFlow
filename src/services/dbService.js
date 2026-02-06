/**
 * IndexedDB 服務
 * 用於儲存大體積的音訊檔案，實現跨次瀏覽持久化
 */

const DB_NAME = 'MusicFlowDB'
const STORE_NAME = 'audioFiles'
const DB_VERSION = 1

class DBService {
  constructor() {
    this.db = null
  }

  /**
   * 初始化資料庫
   */
  async init() {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onerror = (event) => {
        console.error('IndexedDB 初始化失敗', event.target.error)
        reject(event.target.error)
      }
    })
  }

  /**
   * 儲存檔案
   * 
   * @param {string} id - 音樂 ID
   * @param {File|Blob} file - 音訊檔案
   */
  async saveFile(id, file) {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(file, id)

      request.onsuccess = () => resolve(true)
      request.onerror = (event) => reject(event.target.error)
    })
  }

  /**
   * 獲取檔案
   * 
   * @param {string} id - 音樂 ID
   * @returns {Promise<Blob|null>}
   */
  async getFile(id) {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = (event) => resolve(event.target.result || null)
      request.onerror = (event) => reject(event.target.error)
    })
  }

  /**
   * 移除檔案
   * 
   * @param {string} id - 音樂 ID
   */
  async removeFile(id) {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve(true)
      request.onerror = (event) => reject(event.target.error)
    })
  }

  /**
   * 清空所有檔案
   */
  async clearAll() {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve(true)
      request.onerror = (event) => reject(event.target.error)
    })
  }
}

const dbService = new DBService()
export default dbService
