/**
 * 音樂庫 Store 單元測試
 * 
 * 驗證需求：1.1, 1.3, 1.5, 4.1, 4.2, 9.1, 9.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMusicLibraryStore } from './musicLibrary'

// Mock services
vi.mock('../services/storageService', () => ({
  saveToStorage: vi.fn(),
  loadFromStorage: vi.fn(() => ({ music: [], likedMusic: [] }))
}))

vi.mock('../services/metadataService', () => ({
  parseFullMusicInfo: vi.fn((file) => Promise.resolve({
    title: file.name.replace(/\.[^/.]+$/, ''),
    artist: 'Test Artist',
    album: 'Test Album',
    duration: 180,
    fileSize: file.size,
    format: 'mp3',
    fileName: file.name,
    coverArt: null,
    year: '2024',
    genre: 'Rock',
    track: '1'
  }))
}))

describe('musicLibrary store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('初始狀態', () => {
    it('應該有正確的初始狀態', () => {
      const store = useMusicLibraryStore()

      expect(store.music).toEqual([])
      expect(store.artists).toEqual({})
      expect(store.albums).toEqual({})
      expect(store.likedMusic).toEqual([])
      expect(store.isLoading).toBe(false)
    })
  })

  describe('addMusic', () => {
    it('應該成功加入音樂檔案', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test-song.mp3', { type: 'audio/mpeg' })

      const result = await store.addMusic([mockFile])

      expect(result.success).toHaveLength(1)
      expect(result.failed).toHaveLength(0)
      expect(store.music).toHaveLength(1)
      expect(store.music[0].title).toBe('test-song')
      expect(store.music[0].artist).toBe('Test Artist')
    })

    it('應該加入多個音樂檔案', async () => {
      const store = useMusicLibraryStore()
      const files = [
        new File(['content1'], 'song1.mp3', { type: 'audio/mpeg' }),
        new File(['content2'], 'song2.mp3', { type: 'audio/mpeg' })
      ]

      const result = await store.addMusic(files)

      expect(result.success).toHaveLength(2)
      expect(store.music).toHaveLength(2)
    })

    it('應該在加入音樂後自動分類', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' })

      await store.addMusic([mockFile])

      expect(store.artists['Test Artist']).toBeDefined()
      expect(store.albums['Test Album']).toBeDefined()
      expect(store.artists['Test Artist']).toHaveLength(1)
    })
  })

  describe('removeMusic', () => {
    it('應該成功移除音樂', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' })

      await store.addMusic([mockFile])
      const musicId = store.music[0].id

      store.removeMusic(musicId)

      expect(store.music).toHaveLength(0)
    })

    it('應該在移除音樂時同時移除收藏', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' })

      await store.addMusic([mockFile])
      const musicId = store.music[0].id

      store.toggleLike(musicId)
      expect(store.likedMusic).toContain(musicId)

      store.removeMusic(musicId)

      expect(store.likedMusic).not.toContain(musicId)
    })

    it('應該在移除音樂後重新分類', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' })

      await store.addMusic([mockFile])
      store.removeMusic(store.music[0].id)

      expect(store.artists['Test Artist']).toBeUndefined()
    })
  })

  describe('toggleLike', () => {
    it('應該成功收藏音樂', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' })

      await store.addMusic([mockFile])
      const musicId = store.music[0].id

      store.toggleLike(musicId)

      expect(store.likedMusic).toContain(musicId)
      expect(store.music[0].liked).toBe(true)
    })

    it('應該成功取消收藏', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' })

      await store.addMusic([mockFile])
      const musicId = store.music[0].id

      store.toggleLike(musicId)
      expect(store.likedMusic).toContain(musicId)

      store.toggleLike(musicId)

      expect(store.likedMusic).not.toContain(musicId)
      expect(store.music[0].liked).toBe(false)
    })

    it('應該處理不存在的音樂 ID', () => {
      const store = useMusicLibraryStore()

      expect(() => store.toggleLike('non-existent-id')).not.toThrow()
    })
  })

  describe('categorizeMusic', () => {
    it('應該正確按藝術家分類', async () => {
      const store = useMusicLibraryStore()
      
      // 手動加入音樂（繞過 addMusic 以便控制資料）
      store.music = [
        { id: '1', artist: 'Artist A', album: 'Album 1', title: 'Song 1' },
        { id: '2', artist: 'Artist A', album: 'Album 1', title: 'Song 2' },
        { id: '3', artist: 'Artist B', album: 'Album 2', title: 'Song 3' }
      ]

      store.categorizeMusic()

      expect(store.artists['Artist A']).toHaveLength(2)
      expect(store.artists['Artist B']).toHaveLength(1)
    })

    it('應該正確按專輯分類', async () => {
      const store = useMusicLibraryStore()
      
      store.music = [
        { id: '1', artist: 'Artist A', album: 'Album 1', title: 'Song 1' },
        { id: '2', artist: 'Artist A', album: 'Album 1', title: 'Song 2' },
        { id: '3', artist: 'Artist B', album: 'Album 2', title: 'Song 3' }
      ]

      store.categorizeMusic()

      expect(store.albums['Album 1']).toHaveLength(2)
      expect(store.albums['Album 2']).toHaveLength(1)
    })
  })

  describe('getters', () => {
    it('getMusicById 應該返回正確的音樂', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' })

      await store.addMusic([mockFile])
      const musicId = store.music[0].id

      const music = store.getMusicById(musicId)

      expect(music).toBeDefined()
      expect(music.id).toBe(musicId)
    })

    it('getLikedMusic 應該只返回收藏的音樂', async () => {
      const store = useMusicLibraryStore()
      const files = [
        new File(['content1'], 'song1.mp3', { type: 'audio/mpeg' }),
        new File(['content2'], 'song2.mp3', { type: 'audio/mpeg' })
      ]

      await store.addMusic(files)
      store.toggleLike(store.music[0].id)

      const liked = store.getLikedMusic

      expect(liked).toHaveLength(1)
      expect(liked[0].id).toBe(store.music[0].id)
    })

    it('getArtists 應該返回排序的藝術家列表', () => {
      const store = useMusicLibraryStore()
      
      store.music = [
        { id: '1', artist: 'C Artist', album: 'Album', title: 'Song' },
        { id: '2', artist: 'A Artist', album: 'Album', title: 'Song' },
        { id: '3', artist: 'B Artist', album: 'Album', title: 'Song' }
      ]
      store.categorizeMusic()

      const artists = store.getArtists

      expect(artists).toEqual(['A Artist', 'B Artist', 'C Artist'])
    })

    it('totalMusic 應該返回音樂總數', async () => {
      const store = useMusicLibraryStore()
      const files = [
        new File(['content1'], 'song1.mp3', { type: 'audio/mpeg' }),
        new File(['content2'], 'song2.mp3', { type: 'audio/mpeg' })
      ]

      await store.addMusic(files)

      expect(store.totalMusic).toBe(2)
    })

    it('totalLiked 應該返回收藏總數', async () => {
      const store = useMusicLibraryStore()
      const files = [
        new File(['content1'], 'song1.mp3', { type: 'audio/mpeg' }),
        new File(['content2'], 'song2.mp3', { type: 'audio/mpeg' })
      ]

      await store.addMusic(files)
      store.toggleLike(store.music[0].id)

      expect(store.totalLiked).toBe(1)
    })
  })

  describe('updateLastPlayed', () => {
    it('應該更新最後播放時間', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' })

      await store.addMusic([mockFile])
      const musicId = store.music[0].id

      expect(store.music[0].lastPlayedAt).toBe(null)

      store.updateLastPlayed(musicId)

      expect(store.music[0].lastPlayedAt).toBeGreaterThan(0)
    })
  })

  describe('clearLibrary', () => {
    it('應該清空所有資料', async () => {
      const store = useMusicLibraryStore()
      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' })

      await store.addMusic([mockFile])
      store.toggleLike(store.music[0].id)

      store.clearLibrary()

      expect(store.music).toHaveLength(0)
      expect(store.likedMusic).toHaveLength(0)
      expect(store.artists).toEqual({})
      expect(store.albums).toEqual({})
    })
  })
})
