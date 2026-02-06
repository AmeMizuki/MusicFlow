/**
 * 音樂元資料解析服務單元測試
 * 
 * 驗證需求：1.2, 7.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseMetadata, getAudioDuration, parseFullMusicInfo } from './metadataService'

// Mock jsmediatags - 使用動態導入的方式
vi.mock('jsmediatags/dist/jsmediatags.min.js', () => ({
  default: {
    read: vi.fn()
  },
  read: vi.fn()
}))

describe('metadataService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseMetadata', () => {
    it('應該成功解析包含完整標籤的音樂檔案', async () => {
      const mockFile = new File([''], 'test.mp3', { type: 'audio/mpeg' })
      
      jsmediatags.read.mockImplementation((file, { onSuccess }) => {
        onSuccess({
          tags: {
            title: 'Test Song',
            artist: 'Test Artist',
            album: 'Test Album',
            year: '2024',
            genre: 'Rock',
            track: '1',
            picture: {
              data: [255, 216, 255, 224],
              format: 'image/jpeg'
            }
          }
        })
      })

      const metadata = await parseMetadata(mockFile)

      expect(metadata.title).toBe('Test Song')
      expect(metadata.artist).toBe('Test Artist')
      expect(metadata.album).toBe('Test Album')
      expect(metadata.year).toBe('2024')
      expect(metadata.genre).toBe('Rock')
      expect(metadata.track).toBe('1')
      expect(metadata.coverArt).toContain('data:image/jpeg;base64,')
    })

    it('應該在標籤不存在時使用預設值', async () => {
      const mockFile = new File([''], 'my-song.mp3', { type: 'audio/mpeg' })
      
      jsmediatags.read.mockImplementation((file, { onSuccess }) => {
        onSuccess({ tags: {} })
      })

      const metadata = await parseMetadata(mockFile)

      expect(metadata.title).toBe('my-song')
      expect(metadata.artist).toBe('未知藝術家')
      expect(metadata.album).toBe('未知專輯')
      expect(metadata.coverArt).toBe(null)
    })

    it('應該在解析失敗時返回基本資訊', async () => {
      const mockFile = new File([''], 'fallback.mp3', { type: 'audio/mpeg' })
      
      jsmediatags.read.mockImplementation((file, { onError }) => {
        onError(new Error('Parse failed'))
      })

      const metadata = await parseMetadata(mockFile)

      expect(metadata.title).toBe('fallback')
      expect(metadata.artist).toBe('未知藝術家')
      expect(metadata.album).toBe('未知專輯')
    })

    it('應該拒絕無效的檔案物件', async () => {
      await expect(parseMetadata(null)).rejects.toThrow('無效的檔案物件')
      await expect(parseMetadata(undefined)).rejects.toThrow('無效的檔案物件')
      await expect(parseMetadata({})).rejects.toThrow('無效的檔案物件')
    })

    it('應該處理沒有專輯封面的檔案', async () => {
      const mockFile = new File([''], 'no-cover.mp3', { type: 'audio/mpeg' })
      
      jsmediatags.read.mockImplementation((file, { onSuccess }) => {
        onSuccess({
          tags: {
            title: 'No Cover Song',
            artist: 'Artist',
            album: 'Album'
          }
        })
      })

      const metadata = await parseMetadata(mockFile)

      expect(metadata.coverArt).toBe(null)
    })
  })

  describe('getAudioDuration', () => {
    it('應該拒絕無效的檔案物件', async () => {
      await expect(getAudioDuration(null)).rejects.toThrow('無效的檔案物件')
    })

    it('應該在音訊載入錯誤時返回 0', async () => {
      const mockFile = new File(['invalid'], 'test.mp3', { type: 'audio/mpeg' })
      
      // Mock Audio constructor
      const mockAudio = {
        addEventListener: vi.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('Load error')), 0)
          }
        }),
        src: ''
      }
      
      global.Audio = vi.fn(() => mockAudio)
      global.URL.createObjectURL = vi.fn(() => 'blob:test')
      global.URL.revokeObjectURL = vi.fn()

      const duration = await getAudioDuration(mockFile)

      expect(duration).toBe(0)
    })
  })

  describe('parseFullMusicInfo', () => {
    it('應該解析完整的音樂檔案資訊', async () => {
      const mockFile = new File(['test content'], 'complete.mp3', { 
        type: 'audio/mpeg'
      })
      Object.defineProperty(mockFile, 'size', { value: 1024 })
      
      jsmediatags.read.mockImplementation((file, { onSuccess }) => {
        onSuccess({
          tags: {
            title: 'Complete Song',
            artist: 'Complete Artist',
            album: 'Complete Album'
          }
        })
      })

      // Mock Audio for duration
      const mockAudio = {
        addEventListener: vi.fn((event, callback) => {
          if (event === 'loadedmetadata') {
            mockAudio.duration = 180
            setTimeout(() => callback(), 0)
          }
        }),
        src: '',
        duration: 0
      }
      
      global.Audio = vi.fn(() => mockAudio)
      global.URL.createObjectURL = vi.fn(() => 'blob:test')
      global.URL.revokeObjectURL = vi.fn()

      const info = await parseFullMusicInfo(mockFile)

      expect(info.title).toBe('Complete Song')
      expect(info.artist).toBe('Complete Artist')
      expect(info.album).toBe('Complete Album')
      expect(info.duration).toBe(180)
      expect(info.fileSize).toBe(1024)
      expect(info.format).toBe('mp3')
      expect(info.fileName).toBe('complete.mp3')
    })

    it('應該處理不同的檔案格式', async () => {
      const formats = ['test.mp3', 'test.flac', 'test.wav', 'test.m4a']
      
      for (const fileName of formats) {
        const mockFile = new File([''], fileName, { type: 'audio/mpeg' })
        
        jsmediatags.read.mockImplementation((file, { onSuccess }) => {
          onSuccess({ tags: {} })
        })

        const mockAudio = {
          addEventListener: vi.fn((event, callback) => {
            if (event === 'loadedmetadata') {
              mockAudio.duration = 100
              setTimeout(() => callback(), 0)
            }
          }),
          src: '',
          duration: 0
        }
        
        global.Audio = vi.fn(() => mockAudio)
        global.URL.createObjectURL = vi.fn(() => 'blob:test')
        global.URL.revokeObjectURL = vi.fn()

        const info = await parseFullMusicInfo(mockFile)
        const expectedFormat = fileName.split('.').pop()
        
        expect(info.format).toBe(expectedFormat)
      }
    })
  })
})
