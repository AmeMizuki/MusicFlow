<template>
  <div 
    class="music-card glass-panel" 
    :class="{ active: isActive }"
    @click="$emit('play', music.id)"
  >
    <div class="music-cover-area">
      <img v-if="music.coverArt" :src="music.coverArt" :alt="music.title" class="cover-image" />
      <div v-else class="default-cover">
        <i class="pi pi-music"></i>
      </div>
      
      <!-- Overlay controls -->
      <div class="cover-overlay">
        <div class="play-btn-glow">
          <i :class="isPlaying && isActive ? 'pi pi-pause' : 'pi pi-play'"></i>
        </div>
        
        <div class="top-actions">
          <Button
            icon="pi pi-plus"
            rounded
            text
            severity="secondary"
            class="mini-action-btn"
            v-tooltip.top="$t('playlists.add_to')"
            @click.stop="$emit('add-to-playlist', music.id)"
          />
          
          <Button
            :icon="music.liked ? 'pi pi-heart-fill' : 'pi pi-heart'"
            rounded
            text
            :severity="music.liked ? 'danger' : 'secondary'"
            class="mini-action-btn"
            :class="{ liked: music.liked }"
            v-tooltip.top="music.liked ? $t('library.unlike') : $t('library.like')"
            @click.stop="$emit('toggle-like', music.id)"
          />
        </div>
      </div>
    </div>
    
    <div class="music-info">
      <h3 class="music-title" :title="music.title">{{ music.title }}</h3>
      <div class="music-meta">
        <i class="pi pi-user meta-icon"></i>
        <p class="music-artist" :title="music.artist">{{ music.artist }}</p>
      </div>
    </div>
    
    <!-- Playing Indicator -->
    <div v-if="isActive && isPlaying" class="playing-indicator-bars">
      <span></span><span></span><span></span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  music: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
})

defineEmits(['play', 'toggle-like', 'add-to-playlist'])
</script>

<style scoped>
.music-card {
  display: flex;
  flex-direction: column;
  padding: 14px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
}

.music-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-8px);
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.music-card.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-color: rgba(139, 92, 246, 0.4);
}

.music-cover-area {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
  background: var(--bg-tertiary);
  margin-bottom: 14px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.2, 1, 0.3, 1);
}

.music-card:hover .cover-image {
  transform: scale(1.12);
}

.default-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  color: var(--text-tertiary);
  background: linear-gradient(45deg, var(--bg-secondary), var(--bg-tertiary));
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
}

.music-card:hover .cover-overlay {
  opacity: 1;
}

.play-btn-glow {
  width: 56px;
  height: 56px;
  background: var(--grad-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  transform: scale(0.8);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 20px rgba(59, 130, 246, 0.5);
}

.music-card:hover .play-btn-glow {
  transform: scale(1);
}

.top-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  transform: translateY(-8px);
  transition: transform 0.4s ease;
}

.music-card:hover .top-actions {
  transform: translateY(0);
}

.mini-action-btn {
  width: 34px !important;
  height: 34px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.mini-action-btn:hover {
  background: var(--accent-primary) !important;
  border-color: var(--accent-primary) !important;
}

.mini-action-btn.liked {
  color: #ef4444 !important;
}

.music-info {
  min-width: 0;
}

.music-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
}

.music-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
}

.meta-icon {
  font-size: 0.8rem;
}

.music-artist {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playing-indicator-bars {
  position: absolute;
  bottom: 14px;
  right: 14px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
}

.playing-indicator-bars span {
  width: 3px;
  background: var(--accent-secondary);
  border-radius: 2px;
  animation: barBounce 1s infinite alternate;
}

.playing-indicator-bars span:nth-child(2) { animation-delay: 0.2s; height: 100%; }
.playing-indicator-bars span:nth-child(1) { animation-delay: 0.4s; height: 60%; }
.playing-indicator-bars span:nth-child(3) { animation-delay: 0s; height: 80%; }

@keyframes barBounce {
  0% { transform: scaleY(0.4); opacity: 0.5; }
  100% { transform: scaleY(1); opacity: 1; }
}
</style>
