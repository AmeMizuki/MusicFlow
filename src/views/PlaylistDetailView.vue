<template>
  <div v-if="playlist" class="view-container playlist-detail">
    <div class="header-overlay">
      <Button 
        icon="pi pi-arrow-left" 
        rounded 
        text 
        severity="secondary" 
        @click="viewStore.setView('playlists')"
        class="back-btn"
      />
      
      <div class="playlist-header">
        <div class="playlist-cover-large glass-panel">
          <div v-if="covers.length > 0" class="cover-mosaic-large">
            <div v-for="(cover, index) in covers" :key="index" class="mosaic-tile-lg">
              <img :src="cover" loading="lazy" />
            </div>
          </div>
          <div v-else class="default-cover-large">
            <i class="pi pi-list"></i>
          </div>
        </div>

        <div class="playlist-meta-info">
          <Tag :value="$t('playlists.collection')" severity="secondary" class="type-badge" />
          <h1 class="playlist-name-lg">{{ playlist.name }}</h1>
          <p v-if="playlist.description" class="playlist-desc-lg">{{ playlist.description }}</p>
          
          <div class="playlist-stats-row">
            <div class="stat-pill">
              <i class="pi pi-music"></i>
              <span>{{ playlist.musicIds.length }} {{ $t('stats.music') }}</span>
            </div>
            <span class="dot-sep">•</span>
            <span class="create-date">{{ $t('playlists.created_at', { date: formatDate(playlist.createdAt) }) }}</span>
          </div>
          
          <div class="header-action-row">
            <Button 
              :label="$t('player.play')" 
              icon="pi pi-play" 
              rounded 
              size="large"
              class="play-hero-btn"
              @click="playPlaylist" 
              :disabled="playlist.musicIds.length === 0"
            />
            <Button 
              icon="pi pi-refresh" 
              rounded 
              outlined 
              severity="primary" 
              v-tooltip.bottom="$t('player.shuffle')"
              @click="shufflePlaylist" 
              class="shuffle-btn"
            />
            <Button 
              icon="pi pi-trash" 
              rounded 
              text 
              severity="danger" 
              v-tooltip.bottom="$t('common.delete')"
              @click="deletePlaylist" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tracks Section -->
    <div class="tracks-layout">
      <div v-if="tracks.length > 0" class="premium-table">
        <div class="table-header">
          <span class="col-idx">#</span>
          <span class="col-main">{{ $t('music.title') }}</span>
          <span class="col-sub">{{ $t('music.album') }}</span>
          <span class="col-time"><i class="pi pi-clock"></i></span>
          <span class="col-ops"></span>
        </div>

        <div 
          v-for="(track, index) in tracks" 
          :key="track.id" 
          class="table-row" 
          :class="{ 'is-active': playerStore.currentMusicId === track.id }"
          @click="playTrack(track.id)"
        >
          <div class="col-idx">
            <span v-if="playerStore.currentMusicId !== track.id || !playerStore.isPlaying">{{ index + 1 }}</span>
            <div v-else class="playing-mini-anim">
              <span></span><span></span><span></span>
            </div>
          </div>
          
          <div class="col-main track-essence">
            <img v-if="track.coverArt" :src="track.coverArt" class="track-mini-thumb" />
            <div class="track-naming">
              <span class="t-title">{{ track.title }}</span>
              <span class="t-artist">{{ track.artist }}</span>
            </div>
          </div>
          
          <span class="col-sub album-dim">{{ track.album }}</span>
          <span class="col-time duration-dim">{{ formatDuration(track.duration) }}</span>
          
          <div class="col-ops">
            <Button 
              icon="pi pi-minus-circle" 
              text 
              rounded 
              severity="danger" 
              size="small"
              class="row-action-btn"
              v-tooltip.left="$t('playlists.remove')"
              @click.stop="removeTrack(track.id)" 
            />
          </div>
        </div>
      </div>

      <div v-else class="empty-detail-state glass-panel">
        <div class="empty-icon-box">
          <i class="pi pi-list"></i>
        </div>
        <p>{{ $t('playlists.no_tracks') }}</p>
        <Button 
          :label="$t('playlists.add_now')" 
          icon="pi pi-plus" 
          rounded
          class="add-first-track-btn"
          @click="viewStore.setView('library')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlaylistStore } from '../stores/playlist'
import { useMusicLibraryStore } from '../stores/musicLibrary'
import { useViewStore } from '../stores/viewStore'
import { usePlayerStore } from '../stores/player'

const playlistStore = usePlaylistStore()
const libraryStore = useMusicLibraryStore()
const viewStore = useViewStore()
const playerStore = usePlayerStore()

const playlist = computed(() => playlistStore.getPlaylistById(viewStore.selectedPlaylistId))

const tracks = computed(() => {
  if (!playlist.value) return []
  return playlist.value.musicIds.map(id => libraryStore.getMusicById(id)).filter(Boolean)
})

const covers = computed(() => {
  if (!playlist.value) return []
  const c = []
  for (const id of playlist.value.musicIds) {
    const music = libraryStore.getMusicById(id)
    if (music?.coverArt && !c.includes(music.coverArt)) {
      c.push(music.coverArt)
      if (c.length >= 4) break
    }
  }
  return c
})

const formatDate = (ts) => {
  return new Date(ts).toLocaleDateString()
}

const formatDuration = (sec) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const playPlaylist = () => {
  if (playlist.value?.musicIds.length > 0) {
    playerStore.setQueue(playlist.value.musicIds)
    playerStore.play(playlist.value.musicIds[0])
  }
}

const playTrack = (id) => {
  if (playlist.value) {
    playerStore.setQueue(playlist.value.musicIds)
    playerStore.play(id)
  }
}

const shufflePlaylist = () => {
  if (playlist.value?.musicIds.length > 0) {
    const shuffled = [...playlist.value.musicIds].sort(() => Math.random() - 0.5)
    playerStore.setQueue(shuffled)
    playerStore.play(shuffled[0])
  }
}

const removeTrack = (musicId) => {
  playlistStore.removeMusicFromPlaylist(playlist.value.id, musicId)
}

const deletePlaylist = () => {
  if (confirm('確定要刪除此播放清單嗎？')) {
    playlistStore.deletePlaylist(playlist.value.id)
    viewStore.setView('playlists')
  }
}
</script>

<style scoped>
.playlist-detail {
  padding: 0;
  animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-overlay {
  padding: 40px var(--spacing-xl);
  background: linear-gradient(to bottom, rgba(59, 130, 246, 0.2), transparent);
  position: relative;
}

.back-btn {
  margin-bottom: 24px;
}

.playlist-header {
  display: flex;
  gap: 40px;
  align-items: flex-end;
}

.playlist-cover-large {
  width: 260px;
  height: 260px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  padding: 0;
  border: 4px solid rgba(255, 255, 255, 0.05);
}

.cover-mosaic-large {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 100%;
  height: 100%;
}

.mosaic-tile-lg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover-large {
  width: 100%;
  height: 100%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
  color: var(--text-tertiary);
  background: linear-gradient(45deg, var(--bg-primary), var(--bg-secondary));
}

.playlist-meta-info {
  flex: 1;
  padding-bottom: 10px;
}

.type-badge {
  font-weight: 800 !important;
  font-size: 0.75rem !important;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.playlist-name-lg {
  font-size: 4.8rem;
  font-weight: 950;
  margin: 8px 0 16px;
  letter-spacing: -3px;
  line-height: 0.95;
  color: #fff;
}

.playlist-desc-lg {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 1.15rem;
  font-weight: 500;
  max-width: 800px;
}

.playlist-stats-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-pill i { color: var(--accent-primary); }
.dot-sep { color: var(--text-tertiary); }
.create-date { color: var(--text-tertiary); font-weight: 600; }

.header-action-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.play-hero-btn {
  padding-left: 36px !important;
  padding-right: 36px !important;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
}

 /* Global PrimeVue Icon Visibility Fix */
.p-button .p-button-icon,
.p-button .pi,
.pi {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  color: inherit !important;
  visibility: visible !important;
}

/* Specific fix for shuffle icon */
.pi-shuffle {
  display: inline-flex !important;
}

.shuffle-btn {
  border-width: 2px !important;
  width: 48px !important;
  height: 48px !important;
}

.shuffle-btn :deep(.p-button-icon) {
  font-size: 1.2rem !important;
  color: var(--accent-primary) !important;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

/* Tracks Table */
.tracks-layout {
  padding: 0 var(--spacing-xl) 80px;
}

.premium-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 2fr 1.2fr 100px 80px;
  padding: 0 20px 14px;
  border-bottom: 1px solid var(--glass-border);
  color: var(--text-tertiary);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 2fr 1.2fr 100px 80px;
  align-items: center;
  padding: 12px 20px;
  border-radius: 14px;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--glass-border);
}

.table-row.is-active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
  border-color: rgba(59, 130, 246, 0.2);
}

.table-row.is-active .t-title { color: var(--accent-primary); }

.col-idx { display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--text-tertiary); font-variant-numeric: tabular-nums; }

.playing-mini-anim {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}
.playing-mini-anim span {
  width: 2px;
  background: var(--accent-primary);
  animation: barBounce 1s infinite alternate;
}

.track-essence {
  display: flex;
  align-items: center;
  gap: 16px;
}

.track-mini-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.track-naming { display: flex; flex-direction: column; min-width: 0; }
.t-title { font-weight: 700; font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.t-artist { font-size: 0.85rem; color: var(--text-tertiary); font-weight: 500; }

.album-dim, .duration-dim { color: var(--text-tertiary); font-size: 0.95rem; font-weight: 500; }

.row-action-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.table-row:hover .row-action-btn { opacity: 1; }

/* Empty State */
.empty-detail-state {
  padding: 100px;
  text-align: center;
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.01);
}

.empty-icon-box {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  color: var(--text-tertiary);
  font-size: 3rem;
  border: 1px dashed var(--glass-border);
}

.add-first-track-btn {
  margin-top: 30px;
  padding: 10px 24px !important;
  font-weight: 700 !important;
}

@media (max-width: 1024px) {
  .col-sub { display: none; }
  .table-header, .table-row { grid-template-columns: 50px 1fr 100px 60px; }
  .playlist-name-lg { font-size: 3.2rem; }
  .playlist-header { flex-direction: column; align-items: flex-start; gap: 30px; }
  .playlist-cover-large { width: 220px; height: 220px; }
}
</style>
