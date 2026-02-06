# MusicFlow 🎵

一個現代化的本地音樂播放器，使用 Vue 3 + Vite 構建，具有精美的 UI 設計和豐富的功能。

## ✨ 特色功能

- 🎨 **精美的 UI 設計** - 採用 Navy Blue & Mystic Purple 配色方案，搭配玻璃擬態效果
- 🎵 **完整的音樂管理** - 支援音樂上傳、分類、收藏等功能
- 📱 **響應式設計** - 完美適配各種螢幕尺寸
- 🌍 **多語言支援** - 支援繁體中文和英文
- 🎛️ **豐富的播放控制** - 支援隨機播放、循環播放、單曲循環等模式
- 💾 **本地存儲** - 使用 localStorage 保存音樂庫和播放列表
- 🎨 **自適應主題** - 根據專輯封面自動調整播放器顏色

## 🛠️ 技術棧

- **前端框架**: Vue 3 (Composition API)
- **構建工具**: Vite
- **狀態管理**: Pinia
- **UI 組件**: PrimeVue
- **國際化**: Vue I18n
- **音樂標籤**: jsmediatags

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 生產構建

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 📦 專案結構

```
music-player-website/
├── src/
│   ├── components/      # 組件
│   │   ├── common/      # 通用組件
│   │   ├── layout/      # 佈局組件
│   │   └── music/       # 音樂相關組件
│   ├── composables/     # 組合式函數
│   ├── i18n/           # 國際化配置
│   ├── services/       # 服務層
│   ├── stores/         # Pinia 狀態管理
│   ├── styles/         # 全局樣式
│   └── views/          # 頁面視圖
├── public/             # 靜態資源
└── .github/
    └── workflows/      # GitHub Actions 配置
```

## 🎯 主要功能

### 音樂管理
- 上傳本地音樂文件
- 自動解析音樂標籤（標題、藝術家、專輯等）
- 按藝術家、專輯分類瀏覽
- 收藏喜愛的歌曲

### 播放控制
- 播放/暫停
- 上一首/下一首
- 進度條拖動
- 音量調節
- 播放模式切換（順序、隨機、循環、單曲循環）

### 播放列表
- 創建自定義播放列表
- 添加/移除歌曲
- 播放隊列管理

### 個性化
- 深色/淺色主題切換
- 自適應顏色（根據專輯封面）
- 多語言切換

## 📝 開發說明

本專案使用 Vue 3 的 Composition API 和 `<script setup>` 語法，採用模組化設計，易於維護和擴展。

### 關鍵技術點

- **音樂文件處理**: 使用 jsmediatags 解析音樂元數據
- **狀態管理**: Pinia stores 管理全局狀態
- **本地存儲**: localStorage 持久化用戶數據
- **響應式音頻**: HTML5 Audio API 實現音樂播放

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 🙏 致謝

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [PrimeVue](https://primevue.org/)
- [jsmediatags](https://github.com/aadsm/jsmediatags)

---

Made with ❤️ by [Your Name]
