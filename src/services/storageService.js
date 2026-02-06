/**
 * 本地儲存服務
 * 提供 localStorage 的封裝，包含錯誤處理和資料驗證
 * 
 * 驗證需求：15.1, 15.2, 15.3, 15.4, 15.6
 */

const STORAGE_PREFIX = 'music-player:'

/**
 * 儲存資料到 localStorage
 * 
 * @param {string} key - 儲存鍵值（會自動加上前綴）
 * @param {any} data - 要儲存的資料（會被序列化為 JSON）
 * @throws {Error} 當儲存失敗時拋出錯誤
 * @returns {boolean} 儲存成功返回 true
 * 
 * 驗證需求：15.1, 15.2, 15.3, 15.4
 */
export function saveToStorage(key, data) {
  if (!key || typeof key !== 'string') {
    throw new Error('儲存鍵值必須是非空字串')
  }

  const fullKey = STORAGE_PREFIX + key

  try {
    // 檢查 localStorage 是否可用
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage 不可用')
    }

    // 序列化資料
    const serializedData = JSON.stringify(data)

    // 嘗試儲存
    localStorage.setItem(fullKey, serializedData)

    // 驗證儲存是否成功
    const verification = localStorage.getItem(fullKey)
    if (verification !== serializedData) {
      throw new Error('資料驗證失敗：儲存的資料與原始資料不符')
    }

    return true
  } catch (error) {
    // 處理 QuotaExceededError（儲存空間已滿）
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      const storageError = new Error('儲存空間不足，請清理部分資料')
      storageError.name = 'QuotaExceededError'
      storageError.originalError = error
      throw storageError
    }

    // 處理 JSON 序列化錯誤
    if (error instanceof TypeError && error.message.includes('circular')) {
      const serializationError = new Error('無法序列化資料：包含循環引用')
      serializationError.name = 'SerializationError'
      serializationError.originalError = error
      throw serializationError
    }

    // 處理其他錯誤
    if (error.message && (
      error.message.includes('儲存空間不足') ||
      error.message.includes('資料驗證失敗') ||
      error.message.includes('localStorage 不可用')
    )) {
      throw error
    }

    // 包裝未知錯誤
    const storageError = new Error(`儲存失敗：${error.message}`)
    storageError.name = 'StorageError'
    storageError.originalError = error
    throw storageError
  }
}

/**
 * 從 localStorage 載入資料
 * 
 * @param {string} key - 儲存鍵值（會自動加上前綴）
 * @param {any} defaultValue - 當資料不存在或載入失敗時的預設值
 * @returns {any} 載入的資料或預設值
 * 
 * 驗證需求：15.1, 15.2, 15.5, 15.6
 */
export function loadFromStorage(key, defaultValue = null) {
  if (!key || typeof key !== 'string') {
    console.warn('載入鍵值必須是非空字串，返回預設值')
    return defaultValue
  }

  const fullKey = STORAGE_PREFIX + key

  try {
    // 檢查 localStorage 是否可用
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage 不可用，返回預設值')
      return defaultValue
    }

    // 讀取資料
    const serializedData = localStorage.getItem(fullKey)

    // 如果資料不存在，返回預設值
    if (serializedData === null) {
      return defaultValue
    }

    // 反序列化資料
    const data = JSON.parse(serializedData)

    return data
  } catch (error) {
    // 處理 JSON 解析錯誤（資料損壞）
    if (error instanceof SyntaxError) {
      console.error(`資料已損壞，無法解析 JSON：${key}`, error)
      
      // 嘗試清除損壞的資料
      try {
        localStorage.removeItem(fullKey)
        console.info(`已清除損壞的資料：${key}`)
      } catch (removeError) {
        console.error('無法清除損壞的資料', removeError)
      }

      // 返回預設值
      return defaultValue
    }

    // 處理其他錯誤
    console.error(`載入資料失敗：${key}`, error)
    return defaultValue
  }
}

/**
 * 從 localStorage 移除資料
 * 
 * @param {string} key - 儲存鍵值（會自動加上前綴）
 * @returns {boolean} 移除成功返回 true
 */
export function removeFromStorage(key) {
  if (!key || typeof key !== 'string') {
    console.warn('移除鍵值必須是非空字串')
    return false
  }

  const fullKey = STORAGE_PREFIX + key

  try {
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage 不可用')
      return false
    }

    localStorage.removeItem(fullKey)
    return true
  } catch (error) {
    console.error(`移除資料失敗：${key}`, error)
    return false
  }
}

/**
 * 清除所有應用程式的 localStorage 資料
 * 
 * @returns {boolean} 清除成功返回 true
 */
export function clearAllStorage() {
  try {
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage 不可用')
      return false
    }

    // 只清除帶有應用程式前綴的鍵值
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    return true
  } catch (error) {
    console.error('清除所有資料失敗', error)
    return false
  }
}

/**
 * 檢查 localStorage 是否可用
 * 
 * @returns {boolean} 可用返回 true
 */
export function isStorageAvailable() {
  try {
    if (typeof localStorage === 'undefined') {
      return false
    }

    // 嘗試寫入測試資料
    const testKey = STORAGE_PREFIX + '__test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 獲取 localStorage 使用情況（估算）
 * 
 * @returns {object} 包含 used（已使用位元組）和 available（是否可用）的物件
 */
export function getStorageInfo() {
  try {
    if (!isStorageAvailable()) {
      return { used: 0, available: false }
    }

    let used = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key)
        // 估算：key + value 的字元數 * 2（UTF-16 編碼）
        used += (key.length + (value ? value.length : 0)) * 2
      }
    }

    return { used, available: true }
  } catch (error) {
    console.error('獲取儲存資訊失敗', error)
    return { used: 0, available: false }
  }
}
