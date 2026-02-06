/**
 * 主題管理服務
 * 處理暗色/亮色主題切換
 * 
 * 驗證需求：10.1, 10.2, 11.1, 11.2, 11.4
 */

/**
 * 應用主題
 * 
 * @param {string} theme - 主題名稱 ('dark' 或 'light')
 * 
 * 驗證需求：10.1, 10.2
 */
export function applyTheme(theme) {
  const validThemes = ['dark', 'light']
  if (!validThemes.includes(theme)) {
    console.warn(`無效的主題：${theme}，使用預設主題 'dark'`)
    theme = 'dark'
  }

  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark-theme')
    root.classList.remove('light-theme')
  } else {
    root.classList.add('light-theme')
    root.classList.remove('dark-theme')
  }
}

/**
 * 獲取當前主題
 * 
 * @returns {string} 當前主題名稱
 */
export function getCurrentTheme() {
  const root = document.documentElement
  
  if (root.classList.contains('dark-theme')) {
    return 'dark'
  } else if (root.classList.contains('light-theme')) {
    return 'light'
  }
  
  return 'dark' // 預設
}

/**
 * 切換主題
 * 
 * @returns {string} 切換後的主題名稱
 * 
 * 驗證需求：10.1
 */
export function toggleTheme() {
  const currentTheme = getCurrentTheme()
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  applyTheme(newTheme)
  return newTheme
}

/**
 * 應用適應性配色
 * 
 * @param {string} color - 主要顏色（hex 格式）
 * 
 * 驗證需求：8.1, 8.2
 */
export function applyAdaptiveColor(color) {
  if (!color || typeof color !== 'string') {
    return
  }

  const root = document.documentElement
  root.style.setProperty('--adaptive-color', color)
  
  // 計算較淺和較深的變體
  const lighterColor = adjustColorBrightness(color, 20)
  const darkerColor = adjustColorBrightness(color, -20)
  
  root.style.setProperty('--adaptive-color-light', lighterColor)
  root.style.setProperty('--adaptive-color-dark', darkerColor)
}

/**
 * 清除適應性配色
 * 
 * 驗證需求：8.4
 */
export function clearAdaptiveColor() {
  const root = document.documentElement
  root.style.removeProperty('--adaptive-color')
  root.style.removeProperty('--adaptive-color-light')
  root.style.removeProperty('--adaptive-color-dark')
}

/**
 * 調整顏色亮度
 * 
 * @param {string} color - 顏色（hex 格式）
 * @param {number} amount - 調整量（-100 到 100）
 * @returns {string} 調整後的顏色
 */
function adjustColorBrightness(color, amount) {
  // 移除 # 符號
  let hex = color.replace('#', '')
  
  // 轉換為 RGB
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)
  
  // 調整亮度
  r = Math.max(0, Math.min(255, r + amount))
  g = Math.max(0, Math.min(255, g + amount))
  b = Math.max(0, Math.min(255, b + amount))
  
  // 轉換回 hex
  const rHex = r.toString(16).padStart(2, '0')
  const gHex = g.toString(16).padStart(2, '0')
  const bHex = b.toString(16).padStart(2, '0')
  
  return `#${rHex}${gHex}${bHex}`
}

/**
 * 初始化主題系統
 * 
 * @param {string} theme - 初始主題
 */
export function initTheme(theme = 'dark') {
  applyTheme(theme)
}
