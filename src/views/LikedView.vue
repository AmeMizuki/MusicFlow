<template>
  <div class="view-container liked-view">
    <header class="view-header">
      <div class="header-content">
        <div class="icon-box liked-icon">
          <i class="pi pi-heart-fill"></i>
        </div>
        <div class="header-text">
          <h1>{{ $t('library.liked_title') || '我喜歡的音樂' }}</h1>
          <p class="stats">{{ likedMusic.length }} {{ $t('stats.music') }}</p>
        </div>
      </div>
      
      <div v-if="likedMusic.length > 0" class="header-actions">
        <Button 
          :label="$t('player.play')" 
          icon="pi pi-play" 
          rounded 
          class="play-all-btn"
          @click="playAll"
        />
      </div>
    </header>

    <div v-if="likedMusic.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <i class="pi pi-heart"></i>
      </div>
      <h3>{{ $t('library.no_liked') || '尚未收藏任何音樂' }}</h3>
      <p>{{ $t('library.no_liked_hint') || '點擊歌曲上的愛心圖標，將喜歡的音樂加入收藏。' }}</p>
      <Button 
        :label="$t('nav.library')" 
        class="p-button-outlined" 
        @click="viewStore.setView('library')"
      />
    </div>

    <div v-else class="music-grid">
      <MusicItem 
        v-for="item in likedMusic" 
        :key="item.id" 
        :music="item"
        :isActive="playerStore.currentMusicId === item.id"
        :isPlaying="playerStore.isPlaying"
        @play="playMusic"
        @toggle-like="toggleLike"
        @add-to-playlist="showAddToPlaylist"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMusicLibraryStore } from '../stores/musicLibrary'
import { usePlayerStore } from '../stores/player'
import { useViewStore } from '../stores/viewStore'
import MusicItem from '../components/music/MusicItem.vue'

const libraryStore = useMusicLibraryStore()
const playerStore = usePlayerStore()
const viewStore = useViewStore()

const likedMusic = computed(() => libraryStore.getLikedMusic)

const playMusic = (id) => {
  playerStore.setQueue(likedMusic.value.map(m => m.id))
  playerStore.play(id)
}

const playAll = () => {
  if (likedMusic.value.length > 0) {
    playMusic(likedMusic.value[0].id)
  }
}

const toggleLike = (id) => {
  libraryStore.toggleLike(id)
}

const showAddToPlaylist = (id) => {
  console.log('Add to playlist:', id)
}
</script>

<style scoped>
.liked-view {
  padding-bottom: 120px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-xl);
  padding: 20px 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.liked-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f43f5e 0%, #fb7185 100%);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(244, 63, 94, 0.4);
}

.liked-icon i {
  font-size: 2.5rem;
  color: white;
}

.header-text h1 {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 4px;
  letter-spacing: -1px;
}

.stats {
  color: var(--text-tertiary);
  font-weight: 600;
}

.play-all-btn {
  padding: 12px 32px !important;
  font-weight: 700 !important;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3) !important;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border: 1px solid var(--glass-border);
}

.empty-icon-wrapper i {
  font-size: 3.5rem;
  color: var(--text-tertiary);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
  max-width: 450px;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* Grid */
.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .music-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }
}
</style>
