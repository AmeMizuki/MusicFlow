/**
 * 音樂元資料解析服務
 * 使用 jsmediatags 解析音樂檔案的 ID3 標籤
 * 
 * 驗證需求：1.2, 7.1
 */

import jsmediatags from 'jsmediatags'

/**
 * 解析音樂檔案的元資料
 * 
 * @param {File} file - 音樂檔案物件
 * @returns {Promise<object>} 解析後的元資料
 * 
 * 驗證需求：1.2
 */
export function parseMetadata(file) {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('無效的檔案物件'))
      return
    }

    jsmediatags.read(file, {
      onSuccess: (tag) => {
        try {
          const tags = tag.tags || {}
          
          // 提取基本資訊
          const metadata = {
            title: tags.title || file.name.replace(/\.[^/.]+$/, ''),
            artist: tags.artist || '未知藝術家',
            album: tags.album || '未知專輯',
            year: tags.year || null,
            genre: tags.genre || null,
            track: tags.track || null,
            coverArt: null
          }

          // 提取專輯封面
          if (tags.picture) {
            metadata.coverArt = extractCoverArt(tags.picture)
          }

          resolve(metadata)
        } catch (error) {
          console.error('解析元資料時發生錯誤', error)
          // 即使解析失敗，也返回基本資訊
          resolve({
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: '未知藝術家',
            album: '未知專輯',
            year: null,
            genre: null,
            track: null,
            coverArt: null
          })
        }
      },
      onError: (error) => {
        console.warn('無法讀取 ID3 標籤，使用檔案名稱作為標題', error)
        // 解析失敗時，使用檔案名稱作為標題
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: '未知藝術家',
          album: '未知專輯',
          year: null,
          genre: null,
          track: null,
          coverArt: null
        })
      }
    })
  })
}

/**
 * 提取專輯封面圖片
 * 
 * @param {object} picture - jsmediatags 的 picture 物件
 * @returns {string|null} Base64 編碼的圖片資料 URL
 * 
 * 驗證需求：7.1
 */
function extractCoverArt(picture) {
  try {
    if (!picture || !picture.data || !picture.format) {
      return null
    }

    // 將位元組陣列轉換為 Base64
    const { data, format } = picture
    let base64String = ''
    
    for (let i = 0; i < data.length; i++) {
      base64String += String.fromCharCode(data[i])
    }
    
    const base64 = btoa(base64String)
    return `data:${format};base64,${base64}`
  } catch (error) {
    console.error('提取專輯封面失敗', error)
    return null
  }
}

/**
 * 獲取音訊檔案的時長
 * 
 * @param {File} file - 音樂檔案物件
 * @returns {Promise<number>} 時長（秒）
 * 
 * 驗證需求：1.2
 */
export function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('無效的檔案物件'))
      return
    }

    const audio = new Audio()
    const objectUrl = URL.createObjectURL(file)

    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration
      URL.revokeObjectURL(objectUrl)
      
      if (isNaN(duration) || !isFinite(duration)) {
        resolve(0)
      } else {
        resolve(Math.round(duration))
      }
    })

    audio.addEventListener('error', (error) => {
      URL.revokeObjectURL(objectUrl)
      console.error('無法載入音訊檔案以獲取時長', error)
      resolve(0)
    })

    audio.src = objectUrl
  })
}

/**
 * 解析完整的音樂檔案資訊（包含元資料和時長）
 * 
 * @param {File} file - 音樂檔案物件
 * @returns {Promise<object>} 完整的音樂檔案資訊
 * 
 * 驗證需求：1.2, 7.1
 */
export async function parseFullMusicInfo(file) {
  try {
    // 並行解析元資料和時長
    const [metadata, duration] = await Promise.all([
      parseMetadata(file),
      getAudioDuration(file)
    ])

    return {
      ...metadata,
      duration,
      fileSize: file.size,
      format: getFileFormat(file.name),
      fileName: file.name
    }
  } catch (error) {
    console.error('解析音樂檔案資訊失敗', error)
    throw error
  }
}

/**
 * 從檔案名稱獲取檔案格式
 * 
 * @param {string} fileName - 檔案名稱
 * @returns {string} 檔案格式（小寫）
 */
function getFileFormat(fileName) {
  const match = fileName.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : 'unknown'
}
