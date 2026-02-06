/**
 * 鍵盤快捷鍵組合式函數
 * 
 * 驗證需求：14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9
 */

import { onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useMusicLibraryStore } from '../stores/musicLibrary'

export function useKeyboardShortcuts(options = {}) {
  const playerStore = usePlayerStore()
  const libraryStore = useMusicLibraryStore()

  const {
    onTogglePlay,
    onNext,
    onPrevious,
    onVolumeUp,
    onVolumeDown,
    onToggleLike,
    onFocusSearch,
    onTogglePlayMode
  } = options

  /**
   * 檢查是否在輸入框中
   * 
   * 驗證需求：14.9
   */
  const isInputFocused = () => {
    const activeElement = document.activeElement
    const tagName = activeElement?.tagName?.toLowerCase()
    return tagName === 'input' || tagName === 'textarea' || activeElement?.isContentEditable
  }

  /**
   * 鍵盤事件處理器
   */
  const handleKeyDown = (event) => {
    // 在輸入框中時，停用播放控制快捷鍵
    if (isInputFocused()) {
      // 只允許 Escape 鍵
      if (event.key === 'Escape') {
        document.activeElement?.blur()
      }
      return
    }

    // 防止預設行為（某些快捷鍵）
    const shouldPreventDefault = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
    if (shouldPreventDefault) {
      event.preventDefault()
    }

    switch (event.key) {
      // 空白鍵：播放/暫停
      case ' ':
        if (onTogglePlay) {
          onTogglePlay()
        } else {
          playerStore.togglePlayPause()
        }
        break

      // 右方向鍵：下一首
      case 'ArrowRight':
        if (onNext) {
          onNext()
        } else {
          playerStore.next()
        }
        break

      // 左方向鍵：上一首
      case 'ArrowLeft':
        if (onPrevious) {
          onPrevious()
        } else {
          playerStore.previous()
        }
        break

      // 上方向鍵：增加音量
      case 'ArrowUp':
        if (onVolumeUp) {
          onVolumeUp()
        } else {
          const newVolume = Math.min(1, playerStore.volume + 0.1)
          playerStore.setVolume(newVolume)
        }
        break

      // 下方向鍵：減少音量
      case 'ArrowDown':
        if (onVolumeDown) {
          onVolumeDown()
        } else {
          const newVolume = Math.max(0, playerStore.volume - 0.1)
          playerStore.setVolume(newVolume)
        }
        break

      // L 鍵：切換收藏
      case 'l':
      case 'L':
        if (onToggleLike) {
          onToggleLike()
        } else if (playerStore.currentMusicId) {
          libraryStore.toggleLike(playerStore.currentMusicId)
        }
        break

      // S 鍵：聚焦搜尋框
      case 's':
      case 'S':
        if (onFocusSearch) {
          onFocusSearch()
        } else {
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="搜尋"]')
          searchInput?.focus()
        }
        break

      // R 鍵：切換播放模式
      case 'r':
      case 'R':
        if (onTogglePlayMode) {
          onTogglePlayMode()
        } else {
          const modes = ['sequential', 'repeat-one', 'repeat-all', 'shuffle']
          const currentIndex = modes.indexOf(playerStore.playMode)
          const nextIndex = (currentIndex + 1) % modes.length
          playerStore.setPlayMode(modes[nextIndex])
        }
        break
    }
  }

  // 註冊事件監聽器
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  // 清理事件監聽器
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    isInputFocused
  }
}
