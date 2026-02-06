<template>
  <div class="view-container playlists-view">
    <div class="view-header">
      <div class="title-area">
        <div class="icon-box">
          <i class="pi pi-clone title-icon"></i>
        </div>
        <div class="text-group">
          <h2>{{ $t('nav.playlists') }}</h2>
          <Tag :value="playlistStore.totalPlaylists + ' ' + $t('nav.playlists')" severity="secondary" rounded class="count-tag" />
        </div>
      </div>
      
      <div class="header-actions">
        <Button 
          :label="$t('playlists.create')" 
          icon="pi pi-plus" 
          rounded 
          class="create-btn"
          @click="showCreateModal = true" 
        />
        <Button 
          :label="$t('playlists.import')" 
          icon="pi pi-upload" 
          outlined 
          rounded 
          severity="secondary"
          @click="triggerImport" 
        />
      </div>
    </div>

    <!-- Playlist Grid -->
    <div v-if="playlistStore.playlists.length > 0" class="playlists-grid">
      <div 
        v-for="playlist in playlistStore.playlists" 
        :key="playlist.id"
        class="playlist-card glass-panel"
        @click="viewStore.setView('playlist-detail', { playlistId: playlist.id })"
      >
        <div class="playlist-cover-container">
          <div class="playlist-cover-stack">
            <div v-if="getPlaylistCovers(playlist).length > 0" class="cover-mosaic">
              <div 
                v-for="(cover, index) in getPlaylistCovers(playlist)" 
                :key="index"
                class="mosaic-tile"
              >
                <img :src="cover" loading="lazy" />
              </div>
            </div>
            <div v-else class="default-playlist-bg">
              <i class="pi pi-clone"></i>
            </div>
          </div>
          
          <div class="card-overlay">
            <div class="play-circle">
              <i class="pi pi-play"></i>
            </div>
          </div>
        </div>

        <div class="playlist-details">
          <h3 class="playlist-name">{{ playlist.name }}</h3>
          <div class="playlist-stats">
            <i class="pi pi-music"></i>
            <span>{{ playlist.musicIds.length }} {{ $t('stats.music') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-playlists glass-panel">
      <div class="empty-icon-circle">
        <i class="pi pi-clone"></i>
      </div>
      <h3>{{ $t('playlists.empty') }}</h3>
      <p>{{ $t('playlists.empty_desc') }}</p>
      <Button 
        :label="$t('playlists.create_first')" 
        icon="pi pi-plus" 
        rounded
        @click="showCreateModal = true"
        class="first-create-btn"
      />
    </div>

    <!-- Create Playlist Dialog -->
    <Dialog 
      v-model:visible="showCreateModal" 
      modal 
      :header="$t('playlists.new_title')" 
      style="width: 380px"
      class="playlist-dialog"
    >
      <div class="dialog-body">
        <div class="field">
          <label class="input-label">{{ $t('playlists.name_placeholder') }}</label>
          <InputText 
            v-model="newPlaylistName" 
            :placeholder="$t('playlists.name_placeholder')"
            autofocus
            class="w-full"
            @keyup.enter="handleCreate"
          />
        </div>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" text severity="secondary" @click="showCreateModal = false" />
        <Button :label="$t('common.ok')" @click="handleCreate" :disabled="!newPlaylistName" class="confirm-btn" />
      </template>
    </Dialog>

    <!-- Hidden Input -->
    <input ref="importInput" type="file" accept=".json" style="display: none" @change="handleImport" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlaylistStore } from '../stores/playlist'
import { useMusicLibraryStore } from '../stores/musicLibrary'
import { useViewStore } from '../stores/viewStore'
import { usePlayerStore } from '../stores/player'

const playlistStore = usePlaylistStore()
const libraryStore = useMusicLibraryStore()
const viewStore = useViewStore()
const playerStore = usePlayerStore()

const showCreateModal = ref(false)
const newPlaylistName = ref('')
const importInput = ref(null)

const getPlaylistCovers = (playlist) => {
  const covers = []
  for (const id of playlist.musicIds) {
    const music = libraryStore.getMusicById(id)
    if (music?.coverArt && !covers.includes(music.coverArt)) {
      covers.push(music.coverArt)
      if (covers.length >= 4) break
    }
  }
  return covers
}

const handleCreate = () => {
  if (newPlaylistName.value.trim()) {
    playlistStore.createPlaylist(newPlaylistName.value)
    newPlaylistName.value = ''
    showCreateModal.value = false
  }
}

const triggerImport = () => {
  importInput.value?.click()
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      playlistStore.importPlaylist(e.target.result)
    } catch (err) {
      alert(err.message)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>

<style scoped>
.playlists-view {
  padding-top: var(--spacing-xl);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
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
}

.header-actions {
  display: flex;
  gap: 16px;
}

.create-btn {
  padding: 8px 24px !important;
  font-weight: 700 !important;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.35);
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 30px;
}

.playlist-card {
  padding: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  border: 1px solid transparent;
}

.playlist-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.playlist-cover-container {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.playlist-cover-stack {
  width: 100%;
  height: 100%;
  background: var(--bg-tertiary);
}

.cover-mosaic {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 100%;
  height: 100%;
}

.mosaic-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-playlist-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  color: var(--text-tertiary);
  background: linear-gradient(45deg, var(--bg-primary), var(--bg-secondary));
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.playlist-card:hover .card-overlay {
  opacity: 1;
}

.play-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--grad-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.5);
  transform: scale(0.8);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.playlist-card:hover .play-circle {
  transform: scale(1);
}

.playlist-name {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.playlist-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  font-weight: 600;
}

/* Empty State */
.empty-playlists {
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

.empty-icon-circle {
  width: 100px;
  height: 100px;
  background: var(--grad-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  color: white;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.empty-icon-circle i { font-size: 3rem; }

.first-create-btn {
  margin-top: 40px;
  padding: 12px 32px !important;
  font-weight: 700 !important;
}

/* Dialog Styles */
.dialog-body {
  padding: 20px 0;
}

.input-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.confirm-btn {
  padding-left: 20px;
  padding-right: 20px;
}

.w-full { width: 100%; }

@media (max-width: 768px) {
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>
