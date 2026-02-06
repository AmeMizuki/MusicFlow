/**
 * 顏色提取服務
 * 從專輯封面提取主要顏色
 * 
 * 驗證需求：8.1, 8.2
 */

/**
 * 從圖片 URL 提取主要顏色
 * 
 * @param {string} imageUrl - 圖片 URL（data URL 或 blob URL）
 * @returns {Promise<string>} 主要顏色（hex 格式）
 * 
 * 驗證需求：8.1, 8.2
 */
export async function extractDominantColor(imageUrl) {
  if (!imageUrl) {
    return null
  }

  try {
    // 建立圖片元素
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    
    // 等待圖片載入
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    // 建立 canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // 縮小圖片以提高效能
    const size = 100
    canvas.width = size
    canvas.height = size

    // 繪製圖片
    ctx.drawImage(img, 0, 0, size, size)

    // 獲取像素資料
    const imageData = ctx.getImageData(0, 0, size, size)
    const pixels = imageData.data

    // 分析顏色
    const colorMap = {}
    let maxCount = 0
    let dominantColor = null

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]

      // 忽略透明和接近白色/黑色的像素
      if (a < 128) continue
      if (r > 240 && g > 240 && b > 240) continue
      if (r < 15 && g < 15 && b < 15) continue

      // 量化顏色（減少顏色數量）
      const quantizedR = Math.round(r / 32) * 32
      const quantizedG = Math.round(g / 32) * 32
      const quantizedB = Math.round(b / 32) * 32

      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`

      colorMap[colorKey] = (colorMap[colorKey] || 0) + 1

      if (colorMap[colorKey] > maxCount) {
        maxCount = colorMap[colorKey]
        dominantColor = { r: quantizedR, g: quantizedG, b: quantizedB }
      }
    }

    if (!dominantColor) {
      return '#6366f1' // 預設顏色
    }

    // 轉換為 hex
    const hex = rgbToHex(dominantColor.r, dominantColor.g, dominantColor.b)
    return hex
  } catch (error) {
    console.error('提取顏色失敗', error)
    return '#6366f1' // 預設顏色
  }
}

/**
 * 從圖片 URL 提取調色板
 * 
 * @param {string} imageUrl - 圖片 URL
 * @param {number} count - 要提取的顏色數量
 * @returns {Promise<string[]>} 顏色陣列（hex 格式）
 */
export async function extractColorPalette(imageUrl, count = 5) {
  if (!imageUrl) {
    return []
  }

  try {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const size = 100
    canvas.width = size
    canvas.height = size

    ctx.drawImage(img, 0, 0, size, size)

    const imageData = ctx.getImageData(0, 0, size, size)
    const pixels = imageData.data

    const colorMap = {}

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]

      if (a < 128) continue
      if (r > 240 && g > 240 && b > 240) continue
      if (r < 15 && g < 15 && b < 15) continue

      const quantizedR = Math.round(r / 32) * 32
      const quantizedG = Math.round(g / 32) * 32
      const quantizedB = Math.round(b / 32) * 32

      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
      colorMap[colorKey] = (colorMap[colorKey] || 0) + 1
    }

    // 排序並取前 N 個顏色
    const sortedColors = Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([color]) => {
        const [r, g, b] = color.split(',').map(Number)
        return rgbToHex(r, g, b)
      })

    return sortedColors
  } catch (error) {
    console.error('提取調色板失敗', error)
    return []
  }
}

/**
 * RGB 轉 Hex
 * 
 * @param {number} r - 紅色 (0-255)
 * @param {number} g - 綠色 (0-255)
 * @param {number} b - 藍色 (0-255)
 * @returns {string} Hex 顏色
 */
function rgbToHex(r, g, b) {
  const rHex = r.toString(16).padStart(2, '0')
  const gHex = g.toString(16).padStart(2, '0')
  const bHex = b.toString(16).padStart(2, '0')
  return `#${rHex}${gHex}${bHex}`
}

/**
 * 計算顏色亮度
 * 
 * @param {string} hex - Hex 顏色
 * @returns {number} 亮度 (0-255)
 */
export function getColorBrightness(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  // 使用相對亮度公式
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
}

/**
 * Hex 轉 RGB
 * 
 * @param {string} hex - Hex 顏色
 * @returns {object|null} RGB 物件
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}
