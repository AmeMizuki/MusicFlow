<template>
  <div class="file-uploader">
    <div
      class="upload-area glass-panel"
      :class="{ 'drag-over': isDragOver }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @click="triggerFileInput('file')"
      v-tooltip.bottom="$t('uploader.dragDropHint')"
    >
      <div class="upload-icon-pulse">
        <div class="pulse-inner">
          <i class="pi pi-cloud-upload upload-icon"></i>
        </div>
      </div>
      <h3 class="upload-text">{{ $t('uploader.clickToUpload') }}</h3>
      <p class="upload-hint">{{ $t('uploader.dragDropHint') }}</p>
      
      <div class="btn-group">
        <Button 
          :label="$t('uploader.orSelectFolder')" 
          icon="pi pi-folder-open"
          text 
          rounded 
          @click.stop="triggerFileInput('folder')"
          class="folder-btn"
        />
      </div>
      
      <p class="upload-formats">{{ $t('uploader.supportedFormats') }}</p>
    </div>

    <input
      ref="fileInput"
      type="file"
      multiple
      :accept="acceptAttribute"
      @change="handleFileSelect"
      style="display: none"
    />
    <input
      ref="folderInput"
      type="file"
      webkitdirectory
      directory
      multiple
      @change="handleFileSelect"
      style="display: none"
    />

    <div v-if="isUploading" class="upload-progress-card glass-panel">
      <div class="progress-info">
        <div class="proc-status">
          <i class="pi pi-spin pi-spinner status-ic"></i>
          <span>{{ $t('uploader.processing') }}</span>
        </div>
        <span class="count-txt">{{ processedCount }} / {{ totalCount }}</span>
      </div>
      <ProgressBar :value="Math.round(progressPercent)" :showValue="false" class="premium-progress" />
    </div>

    <div v-if="uploadResults.length > 0" class="upload-results-container">
      <div class="results-header">
        <h3 class="results-title">{{ $t('uploader.results') }}</h3>
        <Button 
          icon="pi pi-times" 
          text 
          rounded 
          size="small" 
          severity="secondary" 
          @click="uploadResults = []" 
        />
      </div>
      
      <div class="msg-stack">
        <Message v-if="successResults.length > 0" severity="success" :closable="false" class="premium-msg surface-msg">
          <div class="msg-content">
            <i class="pi pi-check-circle success-ic"></i>
            <span>{{ $t('uploader.successCount', { count: successResults.length }) }}</span>
          </div>
        </Message>

        <Message v-if="errorResults.length > 0" severity="error" :closable="false" class="premium-msg surface-msg">
          <div class="msg-content column-msg">
            <div class="msg-main">
              <i class="pi pi-times-circle error-ic"></i>
              <span>{{ $t('uploader.failedCount', { count: errorResults.length }) }}</span>
            </div>
            <ul class="error-list">
              <li v-for="(result, index) in errorResults" :key="index">
                <strong>{{ result.fileName }}</strong>: {{ result.error }}
              </li>
            </ul>
          </div>
        </Message>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMusicLibraryStore } from '../../stores/musicLibrary'
import { validateFiles, getAcceptAttribute } from '../../utils/fileUtils'

const libraryStore = useMusicLibraryStore()

const fileInput = ref(null)
const folderInput = ref(null)
const isDragOver = ref(false)
const isUploading = ref(false)
const processedCount = ref(0)
const totalCount = ref(0)
const uploadResults = ref([])

const acceptAttribute = getAcceptAttribute()

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return (processedCount.value / totalCount.value) * 100
})

const successResults = computed(() => uploadResults.value.filter(r => r.success))
const errorResults = computed(() => uploadResults.value.filter(r => !r.success))

const triggerFileInput = (type = 'file') => {
  if (type === 'folder') {
    folderInput.value?.click()
  } else {
    fileInput.value?.click()
  }
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  await processFiles(files)
  event.target.value = ''
}

const handleDrop = async (event) => {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  await processFiles(files)
}

const processFiles = async (files) => {
  if (files.length === 0) return

  const { validFiles, invalidFiles } = validateFiles(files)

  uploadResults.value = []
  isUploading.value = true
  processedCount.value = 0
  totalCount.value = validFiles.length

  try {
    const result = await libraryStore.addMusic(validFiles)

    result.success.forEach(music => {
      uploadResults.value.push({
        success: true,
        fileName: music.fileName
      })
      processedCount.value++
    })

    result.failed.forEach(failure => {
      uploadResults.value.push({
        success: false,
        fileName: failure.fileName,
        error: failure.error
      })
      processedCount.value++
    })

    invalidFiles.forEach(invalid => {
      uploadResults.value.push({
        success: false,
        fileName: invalid.file.name,
        error: invalid.reason
      })
    })
  } catch (error) {
    console.error('File processing failed', error)
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.file-uploader {
  animation: fadeIn 0.4s ease;
}

.upload-area {
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 80px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  background: rgba(255, 255, 255, 0.015);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.03);
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.upload-icon-pulse {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  position: relative;
}

.upload-icon-pulse::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 1px solid var(--accent-primary);
  opacity: 0.3;
  animation: pulseRotate 4s infinite linear;
}

@keyframes pulseRotate {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.15); opacity: 0.1; }
  100% { transform: scale(1); opacity: 0.3; }
}

.pulse-inner {
  width: 76px;
  height: 76px;
  background: var(--grad-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4);
}

.upload-icon {
  font-size: 2.222rem;
  color: white;
}

.upload-text {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -1px;
}

.upload-hint {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 32px;
  font-weight: 500;
}

.btn-group {
  margin-bottom: 30px;
}

.folder-btn {
  font-weight: 750 !important;
  font-size: 0.95rem !important;
}

.upload-formats {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  font-weight: 500;
  opacity: 0.7;
}

/* Progress Card */
.upload-progress-card {
  margin-top: 40px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.proc-status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.status-ic {
  color: var(--accent-primary);
}

.count-txt {
  font-weight: 800;
  color: var(--accent-secondary);
  font-variant-numeric: tabular-nums;
}

.premium-progress {
  height: 6px !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.premium-progress :deep(.p-progressbar-value) {
  background: var(--grad-primary) !important;
}

/* Results Section */
.upload-results-container {
  margin-top: 50px;
  animation: slideUp 0.5s ease;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-title {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.msg-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.premium-msg {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: 12px !important;
}

.msg-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.column-msg {
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.msg-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.success-ic { color: #22c55e; font-size: 1.2rem; }
.error-ic { color: #ef4444; font-size: 1.2rem; }

.error-list {
  padding-left: 32px;
  font-size: 0.9rem;
  line-height: 1.6;
}

.error-list li {
  margin-bottom: 4px;
  color: var(--text-secondary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
