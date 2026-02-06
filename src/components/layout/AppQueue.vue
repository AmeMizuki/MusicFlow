<template>
  <aside 
    class="app-queue glass-panel" 
    :class="{ open: viewStore.isQueueOpen }"
  >
    <div class="queue-header">
      <div class="header-left">
        <i class="pi pi-list-check queue-icon"></i>
        <h3>{{ $t('player.queue') }}</h3>
        <Tag v-if="queueList.length > 0" :value="queueList.length" rounded severity="primary" class="q-badge" />
      </div>
      <Button 
        icon="pi pi-times" 
        rounded 
        text 
        severity="secondary" 
        @click="viewStore.closeQueue" 
        class="close-btn"
      />
    </div>

    <div class="queue-content">
      <!-- Now Playing -->
      <div v-if="currentTrack" class="current-track-section">
        <span class="section-label">{{ $t('player.now_playing') }}</span>
        <div class="current-track-card glass-card active-playing">
          <div class="q-cover-wrapper">
            <img v-if="currentTrack.coverArt" :src="currentTrack.coverArt" class="q-cover" />
            <div v-else class="default-q-cover">
              <i class="pi pi-music"></i>
            </div>
            <div class="playing-overlay">
              <div class="bar-anim">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div class="track-info">
            <span class="q-title" v-tooltip.top="currentTrack.title">{{ currentTrack.title }}</span>
            <span class="q-artist">{{ currentTrack.artist }}</span>
          </div>
        </div>
      </div>

      <!-- Up Next -->
      <div class="next-up-section">
        <div class="section-header">
          <span class="section-label">{{ $t('player.up_next') }}</span>
          <Button 
            v-if="queueList.length > 0" 
            :label="$t('common.clear')" 
            icon="pi pi-trash" 
            text 
            size="small"
            severity="danger"
            @click="clearQueue"
          />
        </div>

        <div v-if="nextTracks.length > 0" class="next-list">
          <div 
            v-for="(track, index) in nextTracks" 
            :key="track.id" 
            class="next-track-card"
            @click="playFromQueue(index + playerStore.queueIndex + 1)"
          >
            <div class="q-cover-sm-wrapper">
              <img v-if="track.coverArt" :src="track.coverArt" class="q-cover-sm" />
              <div v-else class="default-q-cover-sm">
                <i class="pi pi-music"></i>
              </div>
            </div>
            <div class="track-info">
              <span class="q-title-sm" v-tooltip.top="track.title">{{ track.title }}</span>
              <span class="q-artist-sm">{{ track.artist }}</span>
            </div>
            <Button 
              icon="pi pi-times" 
              text 
              rounded 
              severity="secondary" 
              size="small"
              @click.stop="removeFromQueue(index + playerStore.queueIndex + 1)" 
              class="remove-q-btn"
            />
          </div>
        </div>

        <div v-else class="empty-queue-state">
          <div class="empty-icon-circle">
            <i class="pi pi-list"></i>
          </div>
          <p>{{ $t('player.queue_empty') }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '../../stores/player'
import { useViewStore } from '../../stores/viewStore'
import { useMusicLibraryStore } from '../../stores/musicLibrary'

const playerStore = usePlayerStore()
const viewStore = useViewStore()
const libraryStore = useMusicLibraryStore()

const queueList = computed(() => playerStore.currentQueue)
const currentTrack = computed(() => playerStore.currentMusic)

const nextTracks = computed(() => {
  const queue = playerStore.currentQueue
  const currentIndex = playerStore.queueIndex
  if (currentIndex === -1) return queue.map(id => libraryStore.getMusicById(id)).filter(Boolean)
  
  return queue.slice(currentIndex + 1).map(id => libraryStore.getMusicById(id)).filter(Boolean)
})

const playFromQueue = (index) => {
  playerStore.queueIndex = index
  playerStore.play(playerStore.currentQueue[index])
}

const removeFromQueue = (index) => {
  const newQueue = [...playerStore.queue]
  newQueue.splice(index, 1)
  playerStore.setQueue(newQueue)
}

const clearQueue = () => {
  playerStore.setQueue([])
}
</script>

<style scoped>
.app-queue {
  position: fixed;
  top: 0;
  right: -340px;
  width: 340px;
  height: calc(100vh - 100px);
  background: var(--bg-secondary);
  border-left: 1px solid var(--glass-border);
  z-index: 900;
  display: flex;
  flex-direction: column;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.4);
}

.app-queue.open {
  right: 0;
}

.queue-header {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.02);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.queue-icon {
  font-size: 1.2rem;
  color: var(--accent-primary);
}

.header-left h3 {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.q-badge {
  font-size: 0.7rem !important;
  font-weight: 800 !important;
}

.queue-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

/* Section Label */
.section-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 16px;
  letter-spacing: 2px;
}

/* Now Playing Section */
.current-track-section {
  margin-bottom: 40px;
}

.current-track-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  transition: all 0.3s ease;
}

.active-playing {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.q-cover-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.q-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-q-cover {
  width: 100%;
  height: 100%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.playing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-anim {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
}

.bar-anim span {
  width: 3px;
  background: var(--accent-secondary);
  border-radius: 2px;
  animation: barBounce 1s infinite;
}

.bar-anim span:nth-child(2) { animation-delay: 0.2s; height: 100%; }
.bar-anim span:nth-child(1) { animation-delay: 0.4s; height: 60%; }
.bar-anim span:nth-child(3) { animation-delay: 0s; height: 80%; }

@keyframes barBounce {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

.track-info {
  flex: 1;
  min-width: 0;
}

.q-title {
  display: block;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.q-artist {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Next Up Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.next-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.next-track-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.next-track-card:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--glass-border);
  transform: translateX(4px);
}

.q-cover-sm-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.q-cover-sm {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-q-cover-sm {
  width: 100%;
  height: 100%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.q-title-sm {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.q-artist-sm {
  display: block;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.remove-q-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.next-track-card:hover .remove-q-btn {
  opacity: 1;
}

/* Empty State */
.empty-queue-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-tertiary);
  text-align: center;
}

.empty-icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px dashed var(--glass-border);
}

.empty-icon-circle i {
  font-size: 2.222rem;
}

.empty-queue-state p {
  font-weight: 600;
}
</style>
