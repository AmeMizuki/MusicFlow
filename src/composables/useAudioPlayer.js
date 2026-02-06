/**
 * 音訊播放器組合式函數
 * 整合 audioService 和 player store
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useMusicLibraryStore } from '../stores/musicLibrary'
import audioService from '../services/audioService'

export function useAudioPlayer() {
  const playerStore = usePlayerStore()
  const libraryStore = useMusicLibraryStore()

  const currentTime = ref(0)
  const duration = ref(0)
  const isLoading = ref(false)

  // 狀態對照 Store
  const currentMusic = computed(() => playerStore.currentMusic)
  const isPlaying = computed(() => playerStore.isPlaying)
  const volume = computed(() => playerStore.volume)
  const isMuted = computed(() => playerStore.isMuted)
  const playMode = computed(() => playerStore.playMode)
  const hasNext = computed(() => playerStore.hasNext)
  const hasPrevious = computed(() => playerStore.hasPrevious)

  // 播放進度（百分比）
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  // 格式化時間
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  // 載入並播放音樂
  const loadAndPlay = async (musicId) => {
    try {
      isLoading.value = true

      const music = libraryStore.getMusicById(musicId)
      if (!music) {
        throw new Error('音樂不存在')
      }

      // 在這裡處理實際播放邏輯（如果有的話）
      playerStore.play(musicId)
      libraryStore.updateLastPlayed(musicId)

      duration.value = music.duration || 0
    } catch (error) {
      console.error('載入音樂失敗', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 播放/暫停
  const togglePlayPause = async () => {
    if (playerStore.isPlaying) {
      audioService.pause()
      playerStore.pause()
    } else {
      if (playerStore.currentMusicId) {
        await audioService.play()
        playerStore.play(playerStore.currentMusicId)
      }
    }
  }

  // 下一首
  const playNext = () => {
    playerStore.next()
    if (playerStore.currentMusicId) {
      loadAndPlay(playerStore.currentMusicId)
    }
  }

  // 上一首
  const playPrevious = () => {
    playerStore.previous()
    if (playerStore.currentMusicId) {
      loadAndPlay(playerStore.currentMusicId)
    }
  }

  // 跳轉
  const seek = (time) => {
    audioService.seek(time)
    playerStore.seek(time)
    currentTime.value = time
  }

  // 設定音量
  const setVolume = (v) => {
    audioService.setVolume(v)
    playerStore.setVolume(v)
  }

  // 靜音開關
  const toggleMute = () => {
    playerStore.toggleMute()
    audioService.setMuted(playerStore.isMuted)
  }

  // 設定播放模式
  const setPlayMode = (mode) => {
    playerStore.setPlayMode(mode)
  }

  // 設定事件監聽器
  onMounted(() => {
    // 時間更新
    audioService.onTimeUpdate((time) => {
      currentTime.value = time
      playerStore.currentTime = time
    })

    // 播放完畢
    audioService.onEnded(() => {
      playNext()
    })

    // 錯誤處理
    audioService.onError((error) => {
      console.error('播放錯誤', error)
      playerStore.pause()
    })

    // 同步音量
    audioService.setVolume(playerStore.volume)
    audioService.setMuted(playerStore.isMuted)
  })

  onUnmounted(() => {
    // 清理
  })

  return {
    // 狀態
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playMode,
    hasNext,
    hasPrevious,
    progress,
    isLoading,
    formattedCurrentTime,
    formattedDuration,

    // 方法
    loadAndPlay,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    setPlayMode,
    formatTime
  }
}
