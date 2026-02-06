<template>
  <div class="view-container library-view">
    <div class="view-header">
      <div class="title-area">
        <div class="icon-box">
          <i class="pi pi-headphones title-icon"></i>
        </div>
        <div class="text-group">
          <h2>{{ $t('library.title') }}</h2>
          <Tag :value="libraryStore.totalMusic + ' ' + $t('stats.music')" severity="primary" rounded class="count-tag" />
        </div>
      </div>
    </div>

    <div v-if="libraryStore.totalMusic > 0" class="music-grid-container">
      <div class="music-grid">
        <MusicItem
          v-for="music in libraryStore.music"
          :key="music.id"
          :music="music"
          :isActive="playerStore.currentMusicId === music.id"
          :isPlaying="playerStore.isPlaying"
          @play="playMusic"
          @toggle-like="toggleLike"
          @add-to-playlist="openPlaylistSelector"
        />
      </div>
    </div>

    <div v-else class="empty-state-container glass-panel">
      <div class="empty-icon-wrapper">
        <i class="pi pi-headphones"></i>
      </div>
      <h3>{{ $t('library.empty') }}</h3>
      <p>{{ $t('library.empty_hint') }}</p>
      <Button 
        :label="$t('nav.upload')" 
        icon="pi pi-cloud-upload" 
        rounded
        @click="viewStore.setView('upload')"
        class="upload-btn-lg"
      />
    </div>

    <!-- Playlist Selector Dialog -->
    <Dialog 
      v-model:visible="showSelector" 
      modal 
      :header="$t('playlists.add_to')" 
      style="width: 420px"
      :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
      class="playlist-dialog"
    >
      <div v-if="playlistStore.playlists.length > 0" class="selector-list">
        <button 
          v-for="playlist in playlistStore.playlists" 
          :key="playlist.id"
          class="selector-item-card"
          @click="addToPlaylist(playlist.id)"
        >
          <div class="s-icon">
            <i class="pi pi-list"></i>
          </div>
          <div class="s-info">
            <span class="s-name">{{ playlist.name }}</span>
            <span class="s-count">{{ playlist.musicIds.length }} {{ $t('stats.music') }}</span>
          </div>
          <i class="pi pi-chevron-right s-arrow"></i>
        </button>
      </div>

      <div v-else class="selector-empty-state">
        <i class="pi pi-folder-open empty-folder-ic"></i>
        <p>{{ $t('playlists.empty') }}</p>
        <Button 
          :label="$t('playlists.create')" 
          icon="pi pi-plus" 
          text
          @click="goToPlaylists"
          class="create-btn-link"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMusicLibraryStore } from '../stores/musicLibrary'
import { usePlayerStore } from '../stores/player'
import { usePlaylistStore } from '../stores/playlist'
import { useViewStore } from '../stores/viewStore'
import MusicItem from '../components/music/MusicItem.vue'

const libraryStore = useMusicLibraryStore()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const viewStore = useViewStore()

const showSelector = ref(false)
const selectedMusicId = ref(null)

const playMusic = (id) => {
  const musicIds = libraryStore.music.map(m => m.id)
  playerStore.setQueue(musicIds)
  playerStore.play(id)
}

const toggleLike = (id) => {
  libraryStore.toggleLike(id)
}

const openPlaylistSelector = (id) => {
  selectedMusicId.value = id
  showSelector.value = true
}

const addToPlaylist = (playlistId) => {
  playlistStore.addMusicToPlaylist(playlistId, selectedMusicId.value)
  showSelector.value = false
  selectedMusicId.value = null
}

const goToPlaylists = () => {
  showSelector.value = false
  viewStore.setView('playlists')
}
</script>

<style scoped>
.library-view {
  padding-top: var(--spacing-xl);
}

.view-header {
  margin-bottom: 40px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-box {
  width: 56px;
  height: 56px;
  background: var(--grad-primary);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.title-icon {
  font-size: 1.8rem;
  color: white;
}

.text-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-area h2 {
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1;
  background: linear-gradient(to right, #fff, var(--text-tertiary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.count-tag {
  align-self: flex-start;
  font-weight: 700 !important;
  font-size: 0.75rem !important;
}

.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: var(--spacing-xl);
}

/* Empty State */
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 40px;
  text-align: center;
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.01);
}

.empty-icon-wrapper {
  width: 110px;
  height: 110px;
  background: var(--grad-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.empty-icon-wrapper i {
  font-size: 3.5rem;
  color: #ffffff !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.empty-state-container h3 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.empty-state-container p {
  color: var(--text-tertiary);
  max-width: 450px;
  line-height: 1.7;
  font-size: 1.05rem;
}

.upload-btn-lg {
  margin-top: 40px;
  padding: 12px 32px !important;
  font-weight: 700 !important;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
}

/* Playlist Dialog Styles */
.selector-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
}

.selector-item-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.selector-item-card:hover {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
  border-color: var(--accent-primary);
  transform: translateX(6px);
}

.s-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  font-size: 1.2rem;
}

.s-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.s-name {
  font-weight: 700;
  font-size: 1.05rem;
}

.s-count {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.s-arrow {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  opacity: 0.5;
}

.selector-empty-state {
  text-align: center;
  padding: 40px 0;
}

.empty-folder-ic {
  font-size: 3rem;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.create-btn-link {
  margin-top: 16px;
  font-weight: 700 !important;
}

@media (max-width: 768px) {
  .music-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }
  .title-area h2 { font-size: 1.8rem; }
}
</style>
