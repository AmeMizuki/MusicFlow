<template>
  <div 
    class="app-player glass" 
    :style="playerStyle"
  >
    <div class="player-content">
      <!-- 音樂資訊 - 靠左 -->
      <div class="music-info-container">
        <div v-if="currentMusic" class="album-cover-small">
          <img v-if="currentMusic.coverArt" :src="currentMusic.coverArt" :alt="currentMusic.title" />
          <div v-else class="default-cover">
            <i class="pi pi-music"></i>
          </div>
        </div>
        <div class="music-details">
          <div class="music-title" :title="currentMusic?.title || $t('player.none')">
            {{ currentMusic?.title || $t('player.none') }}
          </div>
          <div class="music-artist" :title="currentMusic?.artist || '-'">
            {{ currentMusic?.artist || '-' }}
          </div>
        </div>
        
        <Button 
          v-if="currentMusic"
          :icon="currentMusic?.liked ? 'pi pi-heart-fill' : 'pi pi-heart'" 
          text 
          rounded 
          :severity="currentMusic?.liked ? 'danger' : 'secondary'"
          @click="libraryStore.toggleLike(currentMusic.id)" 
          v-tooltip.top="currentMusic?.liked ? $t('library.unlike') : $t('library.like')"
          class="player-like-btn"
        />
      </div>

      <!-- 播放控制 - 居中 -->
      <div class="player-controls">
        <div class="control-buttons">
          <div class="mode-controls">
            <Button 
              icon="pi pi-refresh" 
              rounded 
              text
              :severity="playMode === 'shuffle' ? 'primary' : 'secondary'"
              :class="{ 'mode-active': playMode === 'shuffle' }"
              @click="toggleShuffle" 
              v-tooltip.top="$t('player.playMode.shuffle')"
            />
            
            <div class="mode-btn-wrapper">
              <Button 
                icon="pi pi-sync" 
                text
                rounded 
                :severity="(playMode === 'repeat-all' || playMode === 'repeat-one') ? 'primary' : 'secondary'"
                :class="{ 'mode-active': (playMode === 'repeat-all' || playMode === 'repeat-one') }"
                @click="cycleLoopMode" 
                v-tooltip.top="loopTooltip"
              />
              <span v-if="playMode === 'repeat-one'" class="mode-badge">1</span>
            </div>
          </div>
          
          <div class="core-controls">
            <Button 
              icon="pi pi-step-backward" 
              text 
              rounded 
              @click="playPrevious" 
              :disabled="!hasPrevious" 
              class="nav-btn"
            />
            
            <Button 
              :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'" 
              rounded 
              @click="togglePlayPause" 
              class="play-toggle-btn"
            />
            
            <Button 
              icon="pi pi-step-forward" 
              text 
              rounded 
              @click="playNext" 
              :disabled="!hasNext" 
              class="nav-btn"
            />
          </div>
          
          <Button 
            :icon="volumeIcon" 
            text 
            rounded 
            severity="secondary" 
            @click="toggleMute" 
            v-tooltip.top="isMuted ? $t('player.unmute') : $t('player.mute')"
            class="mute-btn"
          />
        </div>

        <div class="progress-container">
          <span class="time-label">{{ formattedCurrentTime }}</span>
          <div class="slider-wrapper">
            <input
              type="range"
              min="0"
              :max="duration"
              :value="currentTime"
              @input="handleSeek"
              class="progress-slider"
              :style="progressStyle"
            />
          </div>
          <span class="time-label">{{ formattedDuration }}</span>
        </div>
      </div>

      <!-- 右側控制 - 靠右 -->
      <div class="player-extras">
        <Button 
          icon="pi pi-list" 
          text 
          rounded 
          :severity="viewStore.isQueueOpen ? 'primary' : 'secondary'"
          @click="viewStore.toggleQueue"
          v-tooltip.top="$t('player.queue')"
          :class="{ active: viewStore.isQueueOpen }"
        />

        <div class="volume-container">
          <i class="pi pi-volume-down volume-icon"></i>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            @input="handleVolumeChange"
            class="volume-slider"
            :style="volumeStyle"
          />
          <i class="pi pi-volume-up volume-icon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '../../stores/player'
import { useViewStore } from '../../stores/viewStore'
import { useAudioPlayer } from '../../composables/useAudioPlayer'
import { usePreferencesStore } from '../../stores/preferences'
import { useMusicLibraryStore } from '../../stores/musicLibrary'
import { extractDominantColor, getColorBrightness } from '../../services/colorExtractor'

const playerStore = usePlayerStore()
const libraryStore = useMusicLibraryStore()
const viewStore = useViewStore()
const preferencesStore = usePreferencesStore()
const { t } = useI18n()

const {
  currentMusic,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playMode,
  togglePlayPause,
  playNext,
  playPrevious,
  hasNext,
  hasPrevious,
  seek,
  setVolume,
  toggleMute,
  formattedCurrentTime,
  formattedDuration
} = useAudioPlayer()

// 動態佈景主題顏色
const dominantColor = ref(null)
const isDarkColor = ref(true)

watch(() => currentMusic.value?.coverArt, async (newArt) => {
  if (newArt && preferencesStore.adaptiveColor) {
    try {
      const color = await extractDominantColor(newArt)
      dominantColor.value = color
      isDarkColor.value = getColorBrightness(color) < 128
    } catch (e) {
      dominantColor.value = null
    }
  } else {
    dominantColor.value = null
  }
}, { immediate: true })

const playerStyle = computed(() => {
  if (!dominantColor.value || !preferencesStore.adaptiveColor) return {}
  return {
    '--accent-primary': dominantColor.value,
    '--player-glow': `0 8px 32px ${dominantColor.value}44`
  }
})

const toggleShuffle = () => {
  if (playMode.value === 'shuffle') {
    playerStore.setPlayMode('sequential')
  } else {
    playerStore.setPlayMode('shuffle')
  }
}

const cycleLoopMode = () => {
  if (playMode.value === 'repeat-all') {
    playerStore.setPlayMode('repeat-one')
  } else if (playMode.value === 'repeat-one') {
    playerStore.setPlayMode('sequential')
  } else {
    playerStore.setPlayMode('repeat-all')
  }
}

const loopTooltip = computed(() => {
  if (playMode.value === 'repeat-one') return t('player.playMode.repeatOne')
  if (playMode.value === 'repeat-all') return t('player.playMode.repeatAll')
  return t('player.playMode.repeatAll') // Default tooltip when off
})

const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) return 'pi pi-volume-off'
  if (volume.value < 0.5) return 'pi pi-volume-down'
  return 'pi pi-volume-up'
})
const handleSeek = (e) => {
  seek(parseFloat(e.target.value))
}

const handleVolumeChange = (e) => {
  setVolume(parseFloat(e.target.value))
}

const progressStyle = computed(() => {
  const percent = (currentTime.value / duration.value) * 100 || 0
  return { background: `linear-gradient(90deg, var(--accent-primary) ${percent}%, rgba(255,255,255,0.1) ${percent}%)` }
})

const volumeStyle = computed(() => {
  const percent = volume.value * 100
  return { background: `linear-gradient(90deg, var(--accent-primary) ${percent}%, rgba(255,255,255,0.1) ${percent}%)` }
})
</script>

<style scoped>
.app-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: rgba(5, 11, 24, 0.7);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-top: 1px solid var(--glass-border);
  z-index: 1000;
  padding: 0 var(--spacing-xl);
  box-shadow: var(--player-glow, 0 -15px 40px rgba(0,0,0,0.4));
  transition: all var(--transition-slow);
}

.player-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

/* 音樂資訊 */
.music-info-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 180px;
  max-width: 320px;
}

.album-cover-small {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  flex-shrink: 0;
}

.album-cover-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  width: 100%;
  height: 100%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.music-details {
  min-width: 0;
}

.music-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.music-artist {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-like-btn {
  margin-left: 8px;
  transition: all 0.3s ease !important;
}

.player-like-btn:hover {
  transform: scale(1.1);
}

/* 控制區域 */
.player-controls {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 600px;
}

.mode-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mode-btn-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.mode-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--text-tertiary);
  color: white;
  font-size: 0.55rem;
  font-weight: 800;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  border: 1px solid var(--bg-primary);
  transform: translate(25%, -25%);
  z-index: 10;
  transition: all 0.3s ease;
}

.mode-active + .mode-badge,
.mode-active .mode-badge {
  background: white;
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.mode-active {
  background: rgba(59, 130, 246, 0.15) !important;
  color: var(--accent-primary) !important;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.core-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.play-btn {
  width: 54px !important;
  height: 54px !important;
  background: var(--grad-primary) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.play-btn:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 12px 25px rgba(59, 130, 246, 0.5) !important;
}

.nav-btn:hover {
  color: var(--text-primary) !important;
}

.progress-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  width: 40px;
  font-variant-numeric: tabular-nums;
}

.slider-wrapper {
  flex: 1;
  height: 4px;
  position: relative;
  display: flex;
  align-items: center;
}

.progress-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-primary);
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
  transition: transform 0.2s;
}

.progress-slider:hover::-webkit-slider-thumb {
  transform: scale(1.2);
}

/* 額外控制 */
.player-extras {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 180px;
  max-width: 320px;
}

.volume-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 120px;
}

.volume-icon {
  font-size: 0.9rem;
  color: var(--text-tertiary);
}

.volume-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text-primary);
}

@media (max-width: 768px) {
  .music-info-container { display: none; }
  .volume-container { display: none; }
  .app-player { padding: 0 var(--spacing-md); }
}
</style>
