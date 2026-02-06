/**
 * 檔案處理工具
 * 提供檔案格式驗證和讀取功能
 * 
 * 驗證需求：1.1, 1.4
 */

// 支援的音訊格式
const SUPPORTED_FORMATS = [
  'mp3',
  'flac',
  'wav',
  'm4a',
  'aac',
  'ogg',
  'opus',
  'wma'
]

// 支援的 MIME 類型
const SUPPORTED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/flac',
  'audio/x-flac',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/opus',
  'audio/x-ms-wma'
]

/**
 * 驗證檔案格式是否支援
 * 
 * @param {File} file - 檔案物件
 * @returns {boolean} 支援返回 true
 * 
 * 驗證需求：1.1, 1.4
 */
export function isValidAudioFile(file) {
  if (!file || !(file instanceof File)) {
    return false
  }

  // 檢查副檔名
  const extension = getFileExtension(file.name)
  const hasValidExtension = SUPPORTED_FORMATS.includes(extension)

  // 檢查 MIME 類型
  const hasValidMimeType = SUPPORTED_MIME_TYPES.includes(file.type)

  // 至少要符合其中一個條件
  return hasValidExtension || hasValidMimeType
}

/**
 * 獲取檔案副檔名
 * 
 * @param {string} fileName - 檔案名稱
 * @returns {string} 副檔名（小寫，不含點）
 */
export function getFileExtension(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return ''
  }

  const match = fileName.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : ''
}

/**
 * 驗證多個檔案
 * 
 * @param {FileList|File[]} files - 檔案列表
 * @returns {object} 包含有效和無效檔案的物件
 * 
 * 驗證需求：1.4
 */
export function validateFiles(files) {
  const validFiles = []
  const invalidFiles = []

  const fileArray = Array.from(files)

  fileArray.forEach(file => {
    if (isValidAudioFile(file)) {
      validFiles.push(file)
    } else {
      invalidFiles.push({
        file,
        reason: `不支援的檔案格式：${getFileExtension(file.name) || file.type || '未知'}`
      })
    }
  })

  return {
    validFiles,
    invalidFiles,
    hasInvalid: invalidFiles.length > 0
  }
}

/**
 * 讀取檔案為 ArrayBuffer
 * 
 * @param {File} file - 檔案物件
 * @returns {Promise<ArrayBuffer>} 檔案內容
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('無效的檔案物件'))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      resolve(event.target.result)
    }

    reader.onerror = (error) => {
      reject(new Error(`讀取檔案失敗：${error.message || '未知錯誤'}`))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * 讀取檔案為 Data URL
 * 
 * @param {File} file - 檔案物件
 * @returns {Promise<string>} Data URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('無效的檔案物件'))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      resolve(event.target.result)
    }

    reader.onerror = (error) => {
      reject(new Error(`讀取檔案失敗：${error.message || '未知錯誤'}`))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * 格式化檔案大小
 * 
 * @param {number} bytes - 位元組數
 * @returns {string} 格式化後的檔案大小
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * 獲取支援的檔案格式列表
 * 
 * @returns {string[]} 支援的格式陣列
 */
export function getSupportedFormats() {
  return [...SUPPORTED_FORMATS]
}

/**
 * 獲取檔案選擇器的 accept 屬性值
 * 
 * @returns {string} accept 屬性值
 */
export function getAcceptAttribute() {
  return SUPPORTED_MIME_TYPES.join(',')
}
