import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePreferencesStore } from './preferences'

describe('Preferences Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
    // Clear localStorage
    localStorage.clear()
    // Clear all mocks
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const store = usePreferencesStore()
    
    expect(store.theme).toBe('dark')
    expect(store.language).toBe('zh-TW')
    expect(store.adaptiveColor).toBe(true)
    expect(store.categorizeView).toBe(false)
    expect(store.volume).toBe(0.7)
    expect(store.playMode).toBe('sequential')
  })

  it('should set theme and save to storage', () => {
    const store = usePreferencesStore()
    
    store.setTheme('light')
    
    expect(store.theme).toBe('light')
    
    const stored = JSON.parse(localStorage.getItem('music-player:preferences'))
    expect(stored.theme).toBe('light')
  })

  it('should set language and save to storage', () => {
    const store = usePreferencesStore()
    
    store.setLanguage('en')
    
    expect(store.language).toBe('en')
    
    const stored = JSON.parse(localStorage.getItem('music-player:preferences'))
    expect(stored.language).toBe('en')
  })

  it('should toggle adaptive color', () => {
    const store = usePreferencesStore()
    
    const initialValue = store.adaptiveColor
    store.toggleAdaptiveColor()
    
    expect(store.adaptiveColor).toBe(!initialValue)
  })

  it('should toggle categorize view', () => {
    const store = usePreferencesStore()
    
    const initialValue = store.categorizeView
    store.toggleCategorizeView()
    
    expect(store.categorizeView).toBe(!initialValue)
  })

  it('should set volume within valid range', () => {
    const store = usePreferencesStore()
    
    store.setVolume(0.5)
    expect(store.volume).toBe(0.5)
    
    // Test upper bound
    store.setVolume(1.5)
    expect(store.volume).toBe(1)
    
    // Test lower bound
    store.setVolume(-0.5)
    expect(store.volume).toBe(0)
  })

  it('should load preferences from storage', () => {
    const testData = {
      theme: 'light',
      language: 'en',
      adaptiveColor: false,
      categorizeView: true,
      volume: 0.5,
      playMode: 'shuffle'
    }
    
    localStorage.setItem('music-player:preferences', JSON.stringify(testData))
    
    const store = usePreferencesStore()
    store.loadFromStorage()
    
    expect(store.theme).toBe('light')
    expect(store.language).toBe('en')
    expect(store.adaptiveColor).toBe(false)
    expect(store.categorizeView).toBe(true)
    expect(store.volume).toBe(0.5)
    expect(store.playMode).toBe('shuffle')
  })

  it('should handle corrupted storage data gracefully', () => {
    localStorage.setItem('music-player:preferences', 'invalid json')
    
    const store = usePreferencesStore()
    
    // Should not throw error
    expect(() => store.loadFromStorage()).not.toThrow()
    
    // Should keep default values
    expect(store.theme).toBe('dark')
    expect(store.language).toBe('zh-TW')
  })

  it('should save all preferences to storage', () => {
    const store = usePreferencesStore()
    
    store.theme = 'light'
    store.language = 'en'
    store.adaptiveColor = false
    store.categorizeView = true
    store.volume = 0.8
    store.playMode = 'repeat-one'
    
    store.saveToStorage()
    
    const stored = JSON.parse(localStorage.getItem('music-player:preferences'))
    
    expect(stored).toEqual({
      theme: 'light',
      language: 'en',
      adaptiveColor: false,
      categorizeView: true,
      volume: 0.8,
      playMode: 'repeat-one'
    })
  })
})
