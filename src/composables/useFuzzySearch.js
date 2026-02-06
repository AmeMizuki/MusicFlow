/**
 * 模糊搜尋組合式函數
 * 
 * 驗證需求：5.2, 5.3
 */

import { ref, computed } from 'vue'

export function useFuzzySearch(items, searchFields = ['title', 'artist', 'album']) {
  const searchQuery = ref('')

  /**
   * 計算 Levenshtein 距離（編輯距離）
   */
  const levenshteinDistance = (str1, str2) => {
    const len1 = str1.length
    const len2 = str2.length
    const matrix = []

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[len1][len2]
  }

  /**
   * 計算相似度分數
   */
  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()

    // 完全匹配
    if (s1 === s2) return 100

    // 包含匹配
    if (s1.includes(s2) || s2.includes(s1)) return 80

    // 開頭匹配
    if (s1.startsWith(s2) || s2.startsWith(s1)) return 70

    // 編輯距離匹配
    const distance = levenshteinDistance(s1, s2)
    const maxLen = Math.max(s1.length, s2.length)
    const similarity = ((maxLen - distance) / maxLen) * 60

    return similarity
  }

  /**
   * 搜尋項目
   */
  const searchItems = (query, itemList) => {
    if (!query || query.trim() === '') {
      return itemList
    }

    const queryLower = query.toLowerCase().trim()
    const results = []

    itemList.forEach(item => {
      let maxScore = 0

      searchFields.forEach(field => {
        const fieldValue = item[field]
        if (fieldValue && typeof fieldValue === 'string') {
          const score = calculateSimilarity(fieldValue, queryLower)
          maxScore = Math.max(maxScore, score)
        }
      })

      // 只包含分數大於 30 的結果
      if (maxScore > 30) {
        results.push({
          item,
          score: maxScore
        })
      }
    })

    // 按分數排序
    results.sort((a, b) => b.score - a.score)

    return results.map(r => r.item)
  }

  /**
   * 過濾後的項目
   */
  const filteredItems = computed(() => {
    return searchItems(searchQuery.value, items.value || items)
  })

  /**
   * 設定搜尋查詢
   */
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  /**
   * 清除搜尋
   */
  const clearSearch = () => {
    searchQuery.value = ''
  }

  /**
   * 是否有搜尋結果
   */
  const hasResults = computed(() => {
    return filteredItems.value.length > 0
  })

  /**
   * 是否正在搜尋
   */
  const isSearching = computed(() => {
    return searchQuery.value.trim() !== ''
  })

  return {
    searchQuery,
    filteredItems,
    hasResults,
    isSearching,
    setSearchQuery,
    clearSearch,
    searchItems
  }
}
