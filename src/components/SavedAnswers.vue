<template>
  <div class="saved-answers">
    <div class="saved-answers-header">
      <div class="header-title">
        <h2>Saved Answers</h2>
        <span v-if="savedAnswers.length > 0" class="saved-count">{{ savedAnswers.length }} saved</span>
      </div>
      <!-- <p class="header-subtitle">
        MCP metadata such as verse citations and topical tags appears beneath each saved answer so you can reference Scripture quickly.
      </p> -->
      
      <div class="header-actions">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search saved answers..."
            class="search-input"
          />
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="search-clear"
            title="Clear search"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <BaseButton
          v-if="savedAnswers.length > 0"
          @click="openExportModal"
          variant="secondary"
          size="sm"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Export
        </BaseButton>
      </div>
    </div>

    <!-- Tags filter -->
    <div v-if="availableTags.length > 0" class="tags-filter">
      <button
        @click="selectedTag = ''"
        :class="['tag-button', { 'tag-button--active': selectedTag === '' }]"
      >
        All
      </button>
      <button
        v-for="tag in availableTags"
        :key="tag"
        @click="selectedTag = tag"
        :class="['tag-button', { 'tag-button--active': selectedTag === tag }]"
      >
        {{ tag }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="savedAnswers.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      </div>
      <h3>No Saved Answers Yet</h3>
      <p>When you find helpful answers to your Bible questions, click the "Save" button to store them here for future reference.</p>
    </div>

    <!-- Filtered empty state -->
    <div v-else-if="filteredAnswers.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
      <h3>No Results Found</h3>
      <p>No saved answers match your search criteria. Try a different search term or clear the filters.</p>
    </div>

    <!-- Saved answers list -->
    <div v-else class="answers-grid">
      <div
        v-for="savedAnswer in filteredAnswers"
        :key="savedAnswer.id"
        class="answer-card"
      >
        <div class="answer-card-header">
          <h3 class="answer-question">{{ savedAnswer.question }}</h3>
          <div class="answer-actions">
            <button
              @click="toggleExpanded(savedAnswer.id)"
              class="expand-button"
              :class="{ 'expand-button--active': expandedCards.has(savedAnswer.id) }"
              :aria-label="expandedCards.has(savedAnswer.id) ? 'Collapse answer' : 'Expand answer'"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <button
              @click="deleteAnswer(savedAnswer.id)"
              class="delete-button"
              title="Delete saved answer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM6 8a1 1 0 00-1 1v8a2 2 0 002 2h6a2 2 0 002-2V9a1 1 0 10-2 0v8H8V9a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <transition name="card-expand">
          <div v-if="expandedCards.has(savedAnswer.id)" class="answer-card-content">
            <!-- Show conversation thread if it exists -->
            <ConversationThread 
              v-if="savedAnswer.conversation_thread && savedAnswer.conversation_thread.length > 1"
              :thread="savedAnswer.conversation_thread"
            />
            
            <!-- Show single answer if no thread -->
            <div v-else class="answer-text">
              <ScriptureText :text="savedAnswer.answer" />
            </div>
            
            <div class="answer-meta">
              <div class="meta-item">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                <span>{{ formatDate(savedAnswer.saved_at) }}</span>
              </div>
              <div class="meta-item">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                </svg>
                <span>{{ savedAnswer.wordCount }} words</span>
              </div>
              <div v-if="savedAnswer.conversation_thread && savedAnswer.conversation_thread.length > 1" class="meta-item">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                </svg>
                <span>{{ savedAnswer.conversation_thread.length }} messages</span>
              </div>
            </div>

            <div v-if="savedAnswer.tags && savedAnswer.tags.length > 0" class="answer-tags">
              <span class="answer-tags-label">Metadata</span>
              <span
                v-for="tag in savedAnswer.tags"
                :key="tag"
                class="answer-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="answer-card-actions">
              <BaseButton
                @click="copyAnswer(savedAnswer)"
                variant="secondary"
                size="sm"
                :class="{ 'action-button--success': copySuccessId === savedAnswer.id }"
              >
                <svg v-if="copySuccessId !== savedAnswer.id" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                {{ copySuccessId === savedAnswer.id ? 'Copied!' : 'Copy' }}
              </BaseButton>

              <BaseButton
                @click="shareAnswer(savedAnswer)"
                variant="secondary"
                size="sm"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share
              </BaseButton>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="modal-overlay" @click="closeExportModal">
      <div class="modal modal--wide" @click.stop>
        <div class="modal-header">
          <h3>Export Saved Answers</h3>
          <button @click="closeExportModal" class="modal-close">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Select the answers you want to export and choose a format.</p>
          
          <!-- Select all toolbar -->
          <div class="export-select-toolbar">
            <label class="export-select-all">
              <input
                type="checkbox"
                :checked="isAllSelectedForExport"
                :indeterminate="isPartiallySelectedForExport"
                @change="toggleSelectAllForExport"
              />
              <span>{{ isAllSelectedForExport ? 'Deselect All' : 'Select All' }}</span>
            </label>
            <span class="export-selection-count">
              {{ exportSelectedAnswers.size }} of {{ savedAnswers.length }} selected
            </span>
          </div>

          <!-- Answer selection list -->
          <div class="export-answers-list">
            <label
              v-for="answer in savedAnswers"
              :key="answer.id"
              class="export-answer-item"
              :class="{ 'export-answer-item--selected': exportSelectedAnswers.has(answer.id) }"
            >
              <input
                type="checkbox"
                :checked="exportSelectedAnswers.has(answer.id)"
                @change="toggleExportSelection(answer.id)"
              />
              <div class="export-answer-content">
                <span class="export-answer-question">{{ answer.question }}</span>
                <span class="export-answer-meta">
                  {{ formatDate(answer.saved_at) }} · {{ answer.wordCount }} words
                </span>
              </div>
            </label>
          </div>

          <!-- Export format selection -->
          <div class="export-format-section">
            <h4 class="export-format-title">Export Format</h4>
            <div class="export-format-options">
              <label 
                class="export-format-option"
                :class="{ 'export-format-option--active': exportFormat === 'text' }"
              >
                <input type="radio" v-model="exportFormat" value="text" />
                <div class="export-format-content">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                  </svg>
                  <span>Text (.txt)</span>
                </div>
              </label>
              <label 
                class="export-format-option"
                :class="{ 'export-format-option--active': exportFormat === 'json' }"
              >
                <input type="radio" v-model="exportFormat" value="json" />
                <div class="export-format-content">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  <span>JSON (.json)</span>
                </div>
              </label>
              <label 
                class="export-format-option"
                :class="{ 'export-format-option--active': exportFormat === 'pdf' }"
              >
                <input type="radio" v-model="exportFormat" value="pdf" />
                <div class="export-format-content">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                  </svg>
                  <span>PDF (.pdf)</span>
                </div>
              </label>
            </div>
          </div>

          <div class="export-stats">
            <div class="stat-item">
              <strong>{{ exportSelectedAnswers.size }}</strong>
              <span>Answers to Export</span>
            </div>
            <div class="stat-item">
              <strong>{{ exportSelectedStats.totalWords }}</strong>
              <span>Total Words</span>
            </div>
            <div class="stat-item">
              <strong>{{ exportSelectedStats.totalTags }}</strong>
              <span>Unique Tags</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <BaseButton @click="closeExportModal" variant="secondary">
            Cancel
          </BaseButton>
          <BaseButton 
            @click="exportData" 
            variant="primary"
            :disabled="exportSelectedAnswers.size === 0"
          >
            Export {{ exportSelectedAnswers.size }} Answer{{ exportSelectedAnswers.size !== 1 ? 's' : '' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { jsPDF } from 'jspdf'
import BaseButton from './ui/BaseButton.vue'
import ConversationThread from './ConversationThread.vue'
import ScriptureText from './ScriptureText.vue'
import { savedAnswersService } from '../services/savedAnswersService.js'

const emit = defineEmits(['update'])

// Reactive data
const savedAnswers = ref([])
const searchQuery = ref('')
const selectedTag = ref('')
const expandedCards = ref(new Set())
const showExportModal = ref(false)
const copySuccessId = ref(null)
const exportSelectedAnswers = ref(new Set())
const exportFormat = ref('text')

const normalizeText = (value) => {
  if (typeof value === 'string') {
    return value
  }

  if (value == null) {
    return ''
  }

  try {
    return String(value)
  } catch (error) {
    console.warn('Failed to normalize text value:', error)
    return ''
  }
}

const calculateWordCount = (value) => {
  const normalized = normalizeText(value).trim()
  return normalized ? normalized.split(/\s+/).length : 0
}

const deriveWordCount = (item) => {
  if (Array.isArray(item?.conversation_thread) && item.conversation_thread.length > 0) {
    return item.conversation_thread.reduce((total, entry) => total + calculateWordCount(entry?.answer), 0)
  }

  return calculateWordCount(item?.answer)
}

const withDerivedFields = (item) => {
  if (!item || typeof item !== 'object') {
    return {
      wordCount: 0,
    }
  }

  const wordCount = typeof item.wordCount === 'number' ? item.wordCount : deriveWordCount(item)

  return {
    ...item,
    wordCount,
  }
}

// Computed properties
const availableTags = ref([])

const loadTags = async () => {
  try {
    availableTags.value = await savedAnswersService.getAllTags() || []
  } catch (error) {
    console.error('Error getting tags:', error)
    availableTags.value = []
  }
}

const filteredAnswers = computed(() => {
  // Start with all saved answers
  let filtered = savedAnswers.value || []

  // Apply search filter if there's a search query
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    filtered = filtered.filter(answer => {
      const questionText = normalizeText(answer.question).toLowerCase()
      const answerText = normalizeText(answer.answer).toLowerCase()
      return questionText.includes(query) || answerText.includes(query)
    })
  }

  // Apply tag filter if a tag is selected
  if (selectedTag.value && filtered.length > 0) {
    filtered = filtered.filter(answer =>
      answer.tags && Array.isArray(answer.tags) && answer.tags.includes(selectedTag.value)
    )
  }

  return filtered
})

const stats = computed(() => {
  const totalWords = savedAnswers.value.reduce((sum, item) => sum + deriveWordCount(item), 0)
  
  return {
    totalWords,
    totalTags: availableTags.value.length
  }
})

// Export selection computed properties
const isAllSelectedForExport = computed(() => {
  return savedAnswers.value.length > 0 && 
         savedAnswers.value.every(answer => exportSelectedAnswers.value.has(answer.id))
})

const isPartiallySelectedForExport = computed(() => {
  const selectedCount = savedAnswers.value.filter(answer => exportSelectedAnswers.value.has(answer.id)).length
  return selectedCount > 0 && selectedCount < savedAnswers.value.length
})

const exportSelectedAnswersData = computed(() => {
  return savedAnswers.value.filter(answer => exportSelectedAnswers.value.has(answer.id))
})

const exportSelectedStats = computed(() => {
  const selected = exportSelectedAnswersData.value
  const totalWords = selected.reduce((sum, item) => sum + deriveWordCount(item), 0)
  
  const tagsSet = new Set()
  selected.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => tagsSet.add(tag))
    }
  })
  
  return {
    totalWords,
    totalTags: tagsSet.size
  }
})

// Methods
const loadSavedAnswers = async () => {
  try {
    const fetched = await savedAnswersService.getAll()
    savedAnswers.value = (Array.isArray(fetched) ? fetched : []).map(withDerivedFields)
  } catch (error) {
    console.error('Failed to load saved answers:', error)
    savedAnswers.value = []
  }
}

const deleteAnswer = async (id) => {
  if (confirm('Are you sure you want to delete this saved answer?')) {
    const result = await savedAnswersService.delete(id)
    if (result.success) {
      await loadSavedAnswers()
      await loadTags()
      expandedCards.value.delete(id)
      emit('update')
    } else {
      console.error('Failed to delete answer:', result.message)
      // You could show an error message to the user here
    }
  }
}

const toggleExpanded = (id) => {
  if (expandedCards.value.has(id)) {
    expandedCards.value.delete(id)
  } else {
    expandedCards.value.add(id)
  }
}

const toggleExportSelection = (id) => {
  if (exportSelectedAnswers.value.has(id)) {
    exportSelectedAnswers.value.delete(id)
  } else {
    exportSelectedAnswers.value.add(id)
  }
  // Force reactivity update
  exportSelectedAnswers.value = new Set(exportSelectedAnswers.value)
}

const toggleSelectAllForExport = () => {
  if (isAllSelectedForExport.value) {
    // Deselect all
    exportSelectedAnswers.value.clear()
  } else {
    // Select all
    savedAnswers.value.forEach(answer => {
      exportSelectedAnswers.value.add(answer.id)
    })
  }
  // Force reactivity update
  exportSelectedAnswers.value = new Set(exportSelectedAnswers.value)
}

const openExportModal = () => {
  // Start with no answers selected
  exportSelectedAnswers.value.clear()
  exportSelectedAnswers.value = new Set(exportSelectedAnswers.value)
  exportFormat.value = 'text'
  showExportModal.value = true
}

const closeExportModal = () => {
  showExportModal.value = false
  exportSelectedAnswers.value.clear()
  exportSelectedAnswers.value = new Set(exportSelectedAnswers.value)
  exportFormat.value = 'text'
}

const copyAnswer = async (savedAnswer) => {
  try {
    const textToCopy = formatAnswerForShare(savedAnswer)
    await navigator.clipboard.writeText(textToCopy)
    copySuccessId.value = savedAnswer.id
    setTimeout(() => {
      copySuccessId.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const formatAnswerForShare = (savedAnswer) => {
  let textToShare = ''
  
  // If there's a conversation thread, format it nicely
  if (savedAnswer.conversation_thread && savedAnswer.conversation_thread.length > 1) {
    textToShare = savedAnswer.conversation_thread.map((item, index) => {
      const label = index === 0 ? 'Question' : `Follow-up ${index}`
      return `${label}: ${item.question}\n\nAnswer: ${item.answer}`
    }).join('\n\n' + '='.repeat(60) + '\n\n')
  } else {
    // Single Q&A
    textToShare = `Question: ${savedAnswer.question}\n\nAnswer: ${savedAnswer.answer}`
  }
  
  return textToShare
}

const shareAnswer = async (savedAnswer) => {
  const textToShare = formatAnswerForShare(savedAnswer)
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Bible Q&A - Saved Answer',
        text: textToShare,
      })
    } catch (error) {
      // User cancelled or share failed, fall back to copy
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error)
        copyAnswer(savedAnswer)
      }
    }
    return
  }

  // Fallback to copy if Web Share API is not available
  copyAnswer(savedAnswer)
}

const formatAnswerForText = (answer) => {
  let text = ''
  text += `Question: ${answer.question}\n`
  text += `Saved: ${formatDate(answer.saved_at)}\n`
  text += `${'─'.repeat(50)}\n\n`
  
  if (answer.conversation_thread && answer.conversation_thread.length > 1) {
    answer.conversation_thread.forEach((item, index) => {
      const label = index === 0 ? 'Question' : `Follow-up ${index}`
      text += `${label}: ${item.question}\n\n`
      text += `Answer: ${item.answer}\n\n`
      if (index < answer.conversation_thread.length - 1) {
        text += `${'─'.repeat(30)}\n\n`
      }
    })
  } else {
    text += `Answer:\n${answer.answer}\n`
  }
  
  if (answer.tags && answer.tags.length > 0) {
    text += `\nTags: ${answer.tags.join(', ')}\n`
  }
  
  return text
}

const exportAsText = (dataToExport) => {
  const dateStr = new Date().toISOString().split('T')[0]
  const count = dataToExport.length
  
  let content = `Bible Q&A - Saved Answers Export\n`
  content += `Exported: ${new Date().toLocaleString()}\n`
  content += `Total Answers: ${count}\n`
  content += `${'═'.repeat(60)}\n\n`
  
  dataToExport.forEach((answer, index) => {
    content += formatAnswerForText(answer)
    if (index < dataToExport.length - 1) {
      content += `\n${'═'.repeat(60)}\n\n`
    }
  })
  
  const filename = count === savedAnswers.value.length
    ? `bible-qa-saved-answers-${dateStr}.txt`
    : `bible-qa-saved-answers-${count}-selected-${dateStr}.txt`
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, filename)
}

const exportAsJson = (dataToExport) => {
  const now = new Date()
  const dateStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') + '-' +
    String(now.getMinutes()).padStart(2, '0') + '-' +
    String(now.getSeconds()).padStart(2, '0')
  const count = dataToExport.length
  
  const exportObject = {
    exportDate: new Date().toISOString(),
    count: count,
    answers: dataToExport
  }
  
  const filename = count === savedAnswers.value.length
    ? `bible-qa-saved-answers-${dateStr}.json`
    : `bible-qa-saved-answers-${count}-selected-${dateStr}.json`
  
  const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

const exportAsPdf = async (dataToExport) => {
  const now = new Date()
  const dateStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') + '-' +
    String(now.getMinutes()).padStart(2, '0') + '-' +
    String(now.getSeconds()).padStart(2, '0')
  const count = dataToExport.length
  
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const bottomMargin = 25
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = margin
  
  // Helper function to sanitize text for PDF (handle unsupported characters)
  const sanitizeText = (text) => {
    if (!text) return ''
    // Replace common problematic characters with ASCII equivalents
    return text
      // Greek letters commonly used in biblical texts
      .replace(/τέκτων/g, 'tekton')
      .replace(/[α-ωΑ-Ω]/g, (match) => {
        const greekToLatin = {
          'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'e', 'θ': 'th',
          'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
          'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'u', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
          'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'E', 'Θ': 'Th',
          'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
          'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'U', 'Φ': 'Ph', 'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'O'
        }
        return greekToLatin[match] || match
      })
      // Hebrew letters
      .replace(/[\u0590-\u05FF]/g, '')
      // Em dashes, en dashes, special quotes
      .replace(/—/g, ' - ')
      .replace(/–/g, '-')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/…/g, '...')
      // Remove any remaining non-ASCII characters that could cause issues
      .replace(/[^\x00-\x7F]/g, '')
  }
  
  // Helper function to check if we need a new page
  const checkNewPage = (neededSpace) => {
    if (yPosition + neededSpace > pageHeight - bottomMargin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }
  
  // Helper function to add text with word wrap and proper page breaks
  const addWrappedText = (text, x, y, maxWidth, fontSize, fontStyle = 'normal') => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', fontStyle)
    const sanitizedText = sanitizeText(text)
    const lines = doc.splitTextToSize(sanitizedText, maxWidth)
    const lineHeight = fontSize * 0.4
    
    let currentY = y
    
    for (let i = 0; i < lines.length; i++) {
      // Check if this line would go past the bottom margin
      if (currentY + lineHeight > pageHeight - bottomMargin) {
        doc.addPage()
        currentY = margin
      }
      
      doc.text(lines[i], x, currentY)
      currentY += lineHeight
    }
    
    return currentY
  }
  
  // Title
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(47, 74, 126)
  doc.text('Bible Q&A - Saved Answers', margin, yPosition)
  yPosition += 10
  
  // Draw title underline
  doc.setDrawColor(47, 74, 126)
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 8
  
  // Export info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Exported: ${new Date().toLocaleString()} | Total Answers: ${count}`, margin, yPosition)
  yPosition += 15
  
  // Process each answer
  dataToExport.forEach((answer, index) => {
    // Check if we need a new page (estimate space needed)
    checkNewPage(60)
    
    // Question
    doc.setTextColor(47, 74, 126)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    yPosition = addWrappedText(answer.question, margin, yPosition, contentWidth, 12, 'bold')
    yPosition += 2
    
    // Meta info
    doc.setTextColor(130, 130, 130)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Saved: ${formatDate(answer.saved_at)} | ${answer.wordCount} words`, margin, yPosition)
    yPosition += 8
    
    // Answer content
    doc.setTextColor(50, 50, 50)
    
    if (answer.conversation_thread && answer.conversation_thread.length > 1) {
      answer.conversation_thread.forEach((item, i) => {
        checkNewPage(40)
        
        const label = i === 0 ? 'Question' : `Follow-up ${i}`
        
        // Thread label
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(80, 80, 80)
        yPosition = addWrappedText(`${label}: ${item.question}`, margin + 5, yPosition, contentWidth - 10, 10, 'bold')
        yPosition += 3
        
        // Thread answer
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(50, 50, 50)
        doc.setFontSize(10)
        yPosition = addWrappedText(item.answer, margin + 5, yPosition, contentWidth - 10, 10)
        yPosition += 8
      })
    } else {
      doc.setFontSize(10)
      yPosition = addWrappedText(answer.answer, margin, yPosition, contentWidth, 10)
      yPosition += 5
    }
    
    // Tags
    if (answer.tags && answer.tags.length > 0) {
      checkNewPage(15)
      doc.setFontSize(8)
      doc.setTextColor(47, 74, 126)
      doc.text(`Tags: ${answer.tags.join(', ')}`, margin, yPosition)
      yPosition += 8
    }
    
    // Divider between answers
    if (index < dataToExport.length - 1) {
      yPosition += 5
      checkNewPage(20)
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.2)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
    }
  })
  
  // Generate filename and save
  const filename = count === savedAnswers.value.length
    ? `bible-qa-saved-answers-${dateStr}.pdf`
    : `bible-qa-saved-answers-${count}-selected-${dateStr}.pdf`
  
  doc.save(filename)
}

const escapeHtml = (text) => {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const exportData = async () => {
  try {
    const dataToExport = exportSelectedAnswersData.value
    
    switch (exportFormat.value) {
      case 'text':
        exportAsText(dataToExport)
        break
      case 'json':
        exportAsJson(dataToExport)
        break
      case 'pdf':
        await exportAsPdf(dataToExport)
        break
    }
    
    closeExportModal()
  } catch (error) {
    console.error('Failed to export data:', error)
  }
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  await loadSavedAnswers()
  await loadTags()
})

// Watch for debugging (can be removed later)
watch(searchQuery, (newQuery) => {
  console.log('Search query changed:', newQuery)
  console.log('Available answers:', savedAnswers.value.length)
  console.log('Filtered answers:', filteredAnswers.value.length)
})

// Expose methods for parent components
defineExpose({
  refresh: loadSavedAnswers
})
</script>

<style scoped>
.saved-answers {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-sm);
}

.saved-answers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  gap: var(--spacing-lg);
}

.header-title {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
}

.header-title h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.saved-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background: var(--color-background-muted);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: var(--spacing-md) var(--spacing-3xl);
  padding-left: var(--spacing-3xl);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  font-size: 0.95rem;
  background: var(--color-background);
  color: var(--color-text-primary);
  width: 340px;
  max-width: 100%;
  transition: all var(--transition-normal);
}

.search-input::placeholder {
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-clear {
  position: absolute;
  right: var(--spacing-md);
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.search-clear:hover {
  color: var(--color-text-primary);
  background: var(--color-background-muted);
}

.search-clear svg {
  width: 16px;
  height: 16px;
}

.tags-filter {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.tag-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full);
  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-button--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-4xl) var(--spacing-xl);
  color: var(--color-text-primary);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-lg);
  color: var(--color-text-muted);
  opacity: 0.6;
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.empty-state p {
  font-size: var(--font-size-base);
  max-width: 400px;
  margin: 0 auto;
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.answers-grid {
  display: grid;
  gap: var(--spacing-sm);
}

.answer-card {
  background: var(--bg-card, #ffffff) !important;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.answer-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-light);
}

.answer-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  gap: var(--spacing-sm);
}

.answer-question {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  flex-grow: 1;
  line-height: var(--line-height-tight);
}

.answer-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.expand-button,
.delete-button {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background: var(--bg-card, #ffffff);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.expand-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.expand-button--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.expand-button--active svg {
  transform: rotate(180deg);
}

.delete-button:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.expand-button svg,
.delete-button svg {
  width: 16px;
  height: 16px;
  transition: transform var(--transition-fast);
}

.answer-card-content {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
}

.answer-text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  white-space: pre-wrap;
}

.answer-text :deep(.scripture-reference),
.question-text :deep(.scripture-reference) {
  color: var(--color-primary-bright);
  text-decoration: underline dotted;
  text-decoration-thickness: 2px;
  text-decoration-color: var(--color-primary-bright);
  transition: color var(--transition-normal, 0.2s), text-decoration-color var(--transition-normal, 0.2s);
}

.answer-text :deep(.scripture-reference:hover),
.answer-text :deep(.scripture-reference:focus),
.question-text :deep(.scripture-reference:hover),
.question-text :deep(.scripture-reference:focus) {
  color: var(--color-primary);
  text-decoration-color: var(--color-primary);
}

.answer-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.answer-tags {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.answer-tags-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.answer-tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-background-muted);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border-light);
}

.answer-card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-button--success {
  background: rgba(34, 197, 94, 0.15) !important;
  color: #15803d !important;
  border-color: rgba(34, 197, 94, 0.4) !important;
}

/* Card expand animation */
.card-expand-enter-active,
.card-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.card-expand-enter-from,
.card-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.card-expand-enter-to,
.card-expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.modal {
  background: var(--color-background);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: calc(100vh - 2 * var(--spacing-lg));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: auto 0;
}

.modal--wide {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-background-muted);
  color: var(--color-text-primary);
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: var(--spacing-lg);
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body p {
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.export-select-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-background-muted);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-md);
}

.export-select-all {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.export-select-all input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.export-selection-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
}

.export-answers-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
}

.export-answer-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}

.export-answer-item:last-child {
  border-bottom: none;
}

.export-answer-item:hover {
  background: rgba(37, 99, 235, 0.03);
}

.export-answer-item--selected {
  background: rgba(37, 99, 235, 0.08);
}

.export-answer-item input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.export-answer-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.export-answer-question {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.export-answer-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.export-format-section {
  margin-bottom: var(--spacing-lg);
}

.export-format-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.export-format-options {
  display: flex;
  gap: var(--spacing-sm);
}

.export-format-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.export-format-option:hover {
  border-color: var(--color-primary);
  background: rgba(37, 99, 235, 0.05);
}

.export-format-option--active {
  border-color: var(--color-primary);
  background: rgba(37, 99, 235, 0.15);
}

.export-format-option input[type="radio"] {
  display: none;
}

.export-format-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-primary);
}

.export-format-content svg {
  width: 24px;
  height: 24px;
}

.export-format-content span {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.export-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--color-background-muted);
  border-radius: var(--border-radius-md);
}

.stat-item strong {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-item span {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

/* Responsive design */
@media (max-width: 768px) {
  .saved-answers {
    padding: var(--spacing-lg);
  }
  
  .saved-answers-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .search-input {
    width: 100%;
    flex-grow: 1;
  }
  
  .answer-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .answer-actions {
    align-self: flex-end;
  }
  
  .export-stats {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>
