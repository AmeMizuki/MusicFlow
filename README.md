# 本地音樂播放器 | Local Music Player

一個基於 Vue 3 的現代化本地音樂播放器，支援多種音訊格式、播放清單管理、主題切換和多語言介面。

## 功能特色

### 核心功能
- ✅ **音樂檔案管理**
  - 支援 MP3、FLAC、WAV、M4A、AAC、OGG 等格式
  - 自動解析 ID3 標籤（標題、藝術家、專輯、封面）
  - 拖放上傳或選擇檔案
  - 本地儲存持久化

- ✅ **播放控制**
  - 播放/暫停/上一首/下一首
  - 進度條控制
  - 音量調整
  - 四種播放模式：順序播放、單曲循環、播放清單循環、隨機播放

- ✅ **播放清單管理**
  - 建立自訂播放清單
  - 加入/移除音樂
  - 重新排序
  - 匯出/導入 JSON 格式

- ✅ **收藏功能**
  - 標記喜愛的音樂
  - 快速存取收藏清單

- ✅ **搜尋功能**
  - 即時模糊搜尋
  - 多欄位搜尋（標題、藝術家、專輯）

- ✅ **智慧分類**
  - 按藝術家分組
  - 按專輯分組
  - 平面/分類檢視切換

### 介面特色
- ✅ **現代化設計**
  - 磨砂玻璃效果（Glassmorphism）
  - 響應式佈局
  - 流暢動畫過渡

- ✅ **主題系統**
  - 暗色/亮色主題切換
  - 適應性配色（根據專輯封面）

- ✅ **多語言支援**
  - 繁體中文
  - English

- ✅ **鍵盤快捷鍵**
  - 空白鍵：播放/暫停
  - 方向鍵：導航和音量控制
  - L：切換收藏
  - S：聚焦搜尋
  - R：切換播放模式

## 技術棧

- **前端框架**: Vue 3 (Composition API)
- **狀態管理**: Pinia
- **UI 元件庫**: PrimeVue
- **建置工具**: Vite
- **測試框架**: Vitest + fast-check
- **國際化**: vue-i18n
- **元資料解析**: jsmediatags

## 安裝

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 執行測試
npm test

# 測試覆蓋率
npm run coverage
```

## 專案結構

```
src/
├── components/          # Vue 元件
│   ├── layout/         # 佈局元件
│   ├── music/          # 音樂相關元件
│   ├── playlist/       # 播放清單元件
│   ├── search/         # 搜尋元件
│   ├── settings/       # 設定元件
│   └── common/         # 通用元件
├── composables/        # 組合式函數
│   ├── useAudioPlayer.js
│   ├── useKeyboardShortcuts.js
│   └── useFuzzySearch.js
├── services/           # 服務層
│   ├── audioService.js
│   ├── metadataService.js
│   ├── storageService.js
│   ├── themeService.js
│   └── colorExtractor.js
├── stores/             # Pinia stores
│   ├── musicLibrary.js
│   ├── player.js
│   ├── playlist.js
│   └── preferences.js
├── utils/              # 工具函數
│   └── fileUtils.js
├── i18n/               # 國際化
│   ├── zh-TW.json
│   └── en.json
├── styles/             # 樣式
│   ├── variables.css
│   ├── theme-dark.css
│   ├── theme-light.css
│   └── glassmorphism.css
├── App.vue             # 根元件
└── main.js             # 應用程式入口
```

## 使用說明

### 導入音樂
1. 點擊上傳區域或拖放音樂檔案
2. 支援多檔案同時上傳
3. 系統會自動解析元資料和專輯封面

### 播放音樂
1. 點擊音樂卡片開始播放
2. 使用底部播放器控制播放
3. 支援鍵盤快捷鍵操作

### 建立播放清單
1. 點擊側邊欄的「新增播放清單」
2. 輸入名稱和描述
3. 將音樂加入播放清單

### 鍵盤快捷鍵
- `空白鍵`: 播放/暫停
- `→`: 下一首
- `←`: 上一首
- `↑`: 增加音量
- `↓`: 減少音量
- `L`: 切換收藏
- `S`: 聚焦搜尋
- `R`: 切換播放模式

## 開發

### 測試
```bash
# 執行所有測試
npm test

# 執行特定測試
npm test -- storageService

# 測試覆蓋率
npm run coverage
```

### 建置
```bash
# 開發建置
npm run dev

# 生產建置
npm run build

# 預覽生產建置
npm run preview
```

## 瀏覽器支援

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 注意事項

- 音樂檔案僅儲存在瀏覽器的 localStorage 中（元資料）
- 實際音訊檔案不會上傳到伺服器
- 建議定期匯出播放清單以備份
- localStorage 有大小限制（通常 5-10MB）

## 未來計畫

- [ ] 等化器
- [ ] 歌詞顯示
- [ ] 更多主題選項
- [ ] 播放歷史記錄
- [ ] 智慧播放清單
- [ ] 音樂視覺化

---

Made with ❤️ using Vue 3
