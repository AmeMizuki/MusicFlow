/**
 * 檔案處理工具單元測試
 * 
 * 驗證需求：1.1, 1.4
 */

import { describe, it, expect } from 'vitest'
import {
  isValidAudioFile,
  getFileExtension,
  validateFiles,
  formatFileSize,
  getSupportedFormats,
  getAcceptAttribute,
  readFileAsArrayBuffer,
  readFileAsDataURL
} from './fileUtils'

describe('fileUtils', () => {
  describe('isValidAudioFile', () => {
    it('應該接受支援的音訊格式', () => {
      const validFormats = [
        { name: 'song.mp3', type: 'audio/mpeg' },
        { name: 'song.flac', type: 'audio/flac' },
        { name: 'song.wav', type: 'audio/wav' },
        { name: 'song.m4a', type: 'audio/mp4' },
        { name: 'song.aac', type: 'audio/aac' },
        { name: 'song.ogg', type: 'audio/ogg' }
      ]

      validFormats.forEach(({ name, type }) => {
        const file = new File([''], name, { type })
        expect(isValidAudioFile(file)).toBe(true)
      })
    })

    it('應該拒絕不支援的檔案格式', () => {
      const invalidFormats = [
        { name: 'document.pdf', type: 'application/pdf' },
        { name: 'image.jpg', type: 'image/jpeg' },
        { name: 'video.mp4', type: 'video/mp4' },
        { name: 'text.txt', type: 'text/plain' }
      ]

      invalidFormats.forEach(({ name, type }) => {
        const file = new File([''], name, { type })
        expect(isValidAudioFile(file)).toBe(false)
      })
    })

    it('應該在副檔名正確但 MIME 類型錯誤時接受檔案', () => {
      const file = new File([''], 'song.mp3', { type: 'application/octet-stream' })
      expect(isValidAudioFile(file)).toBe(true)
    })

    it('應該在 MIME 類型正確但副檔名錯誤時接受檔案', () => {
      const file = new File([''], 'song.unknown', { type: 'audio/mpeg' })
      expect(isValidAudioFile(file)).toBe(true)
    })

    it('應該拒絕無效的輸入', () => {
      expect(isValidAudioFile(null)).toBe(false)
      expect(isValidAudioFile(undefined)).toBe(false)
      expect(isValidAudioFile({})).toBe(false)
      expect(isValidAudioFile('not a file')).toBe(false)
    })

    it('應該處理大寫副檔名', () => {
      const file = new File([''], 'SONG.MP3', { type: 'audio/mpeg' })
      expect(isValidAudioFile(file)).toBe(true)
    })
  })

  describe('getFileExtension', () => {
    it('應該正確提取副檔名', () => {
      expect(getFileExtension('song.mp3')).toBe('mp3')
      expect(getFileExtension('album.flac')).toBe('flac')
      expect(getFileExtension('track.WAV')).toBe('wav')
    })

    it('應該處理多個點的檔案名稱', () => {
      expect(getFileExtension('my.song.mp3')).toBe('mp3')
      expect(getFileExtension('track.1.2.3.flac')).toBe('flac')
    })

    it('應該在沒有副檔名時返回空字串', () => {
      expect(getFileExtension('noextension')).toBe('')
      expect(getFileExtension('')).toBe('')
    })

    it('應該處理無效輸入', () => {
      expect(getFileExtension(null)).toBe('')
      expect(getFileExtension(undefined)).toBe('')
      expect(getFileExtension(123)).toBe('')
    })
  })

  describe('validateFiles', () => {
    it('應該正確分類有效和無效檔案', () => {
      const files = [
        new File([''], 'valid1.mp3', { type: 'audio/mpeg' }),
        new File([''], 'invalid.pdf', { type: 'application/pdf' }),
        new File([''], 'valid2.flac', { type: 'audio/flac' }),
        new File([''], 'invalid.jpg', { type: 'image/jpeg' })
      ]

      const result = validateFiles(files)

      expect(result.validFiles).toHaveLength(2)
      expect(result.invalidFiles).toHaveLength(2)
      expect(result.hasInvalid).toBe(true)
      expect(result.invalidFiles[0].reason).toContain('不支援的檔案格式')
    })

    it('應該處理全部有效的檔案', () => {
      const files = [
        new File([''], 'song1.mp3', { type: 'audio/mpeg' }),
        new File([''], 'song2.flac', { type: 'audio/flac' })
      ]

      const result = validateFiles(files)

      expect(result.validFiles).toHaveLength(2)
      expect(result.invalidFiles).toHaveLength(0)
      expect(result.hasInvalid).toBe(false)
    })

    it('應該處理全部無效的檔案', () => {
      const files = [
        new File([''], 'doc.pdf', { type: 'application/pdf' }),
        new File([''], 'pic.jpg', { type: 'image/jpeg' })
      ]

      const result = validateFiles(files)

      expect(result.validFiles).toHaveLength(0)
      expect(result.invalidFiles).toHaveLength(2)
      expect(result.hasInvalid).toBe(true)
    })

    it('應該處理空檔案列表', () => {
      const result = validateFiles([])

      expect(result.validFiles).toHaveLength(0)
      expect(result.invalidFiles).toHaveLength(0)
      expect(result.hasInvalid).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('應該正確格式化位元組', () => {
      expect(formatFileSize(0)).toBe('0.00 B')
      expect(formatFileSize(500)).toBe('500.00 B')
      expect(formatFileSize(1023)).toBe('1023.00 B')
    })

    it('應該正確格式化 KB', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(2048)).toBe('2.00 KB')
      expect(formatFileSize(1536)).toBe('1.50 KB')
    })

    it('應該正確格式化 MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB')
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB')
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.50 MB')
    })

    it('應該正確格式化 GB', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB')
      expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB')
    })

    it('應該處理無效輸入', () => {
      expect(formatFileSize(-1)).toBe('0 B')
      expect(formatFileSize(null)).toBe('0 B')
      expect(formatFileSize(undefined)).toBe('0 B')
      expect(formatFileSize('not a number')).toBe('0 B')
    })
  })

  describe('getSupportedFormats', () => {
    it('應該返回支援的格式陣列', () => {
      const formats = getSupportedFormats()

      expect(Array.isArray(formats)).toBe(true)
      expect(formats.length).toBeGreaterThan(0)
      expect(formats).toContain('mp3')
      expect(formats).toContain('flac')
      expect(formats).toContain('wav')
    })

    it('應該返回新的陣列（不是引用）', () => {
      const formats1 = getSupportedFormats()
      const formats2 = getSupportedFormats()

      expect(formats1).not.toBe(formats2)
      expect(formats1).toEqual(formats2)
    })
  })

  describe('getAcceptAttribute', () => {
    it('應該返回有效的 accept 屬性字串', () => {
      const accept = getAcceptAttribute()

      expect(typeof accept).toBe('string')
      expect(accept).toContain('audio/')
      expect(accept.split(',')).toContain('audio/mpeg')
    })
  })

  describe('readFileAsArrayBuffer', () => {
    it('應該拒絕無效的檔案物件', async () => {
      await expect(readFileAsArrayBuffer(null)).rejects.toThrow('無效的檔案物件')
      await expect(readFileAsArrayBuffer(undefined)).rejects.toThrow('無效的檔案物件')
      await expect(readFileAsArrayBuffer({})).rejects.toThrow('無效的檔案物件')
    })
  })

  describe('readFileAsDataURL', () => {
    it('應該拒絕無效的檔案物件', async () => {
      await expect(readFileAsDataURL(null)).rejects.toThrow('無效的檔案物件')
      await expect(readFileAsDataURL(undefined)).rejects.toThrow('無效的檔案物件')
      await expect(readFileAsDataURL({})).rejects.toThrow('無效的檔案物件')
    })
  })
})
