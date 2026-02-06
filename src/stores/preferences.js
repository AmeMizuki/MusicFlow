import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    theme: 'dark',
    language: 'zh-TW',
    adaptiveColor: true,
    categorizeView: false,
    volume: 0.7,
    playMode: 'sequential'
  }),

  actions: {
    setTheme(theme) {
      this.theme = theme
      this.saveToStorage()
    },

    setLanguage(language) {
      this.language = language
      this.saveToStorage()
    },

    toggleAdaptiveColor() {
      this.adaptiveColor = !this.adaptiveColor
      this.saveToStorage()
    },

    toggleCategorizeView() {
      this.categorizeView = !this.categorizeView
      this.saveToStorage()
    },

    setVolume(volume) {
      this.volume = Math.max(0, Math.min(1, volume))
      this.saveToStorage()
    },

    setPlayMode(mode) {
      this.playMode = mode
      this.saveToStorage()
    },

    loadFromStorage() {
      try {
        const stored = localStorage.getItem('music-player:preferences')
        if (stored) {
          const data = JSON.parse(stored)
          this.theme = data.theme || 'dark'
          this.language = data.language || 'zh-TW'
          this.adaptiveColor = data.adaptiveColor !== undefined ? data.adaptiveColor : true
          this.categorizeView = data.categorizeView || false
          this.volume = data.volume !== undefined ? data.volume : 0.7
          this.playMode = data.playMode || 'sequential'
        }
      } catch (error) {
        console.error('Failed to load preferences from storage:', error)
      }
    },

    saveToStorage() {
      try {
        const data = {
          theme: this.theme,
          language: this.language,
          adaptiveColor: this.adaptiveColor,
          categorizeView: this.categorizeView,
          volume: this.volume,
          playMode: this.playMode
        }
        localStorage.setItem('music-player:preferences', JSON.stringify(data))
      } catch (error) {
        console.error('Failed to save preferences to storage:', error)
      }
    }
  }
})
