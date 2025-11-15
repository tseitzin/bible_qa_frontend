<template>
  <div class="saved-answers">
    <div class="saved-answers-header">
      <div class="header-title">
        <h2>Saved Answers</h2>
        <span v-if="savedAnswers.length > 0" class="saved-count">{{ savedAnswers.length }} saved</span>
      </div>
      
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
          @click="showExportModal = true"
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
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V13a1 1 0 11-2 0v-1.586l.293.293a1 1 0 001.414-1.414z"/>
                </svg>
                Copy Conversation
              </BaseButton>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Export Saved Answers</h3>
          <button @click="showExportModal = false" class="modal-close">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Export your saved answers as a JSON file for backup or sharing.</p>
          <div class="export-stats">
            <div class="stat-item">
              <strong>{{ savedAnswers.length }}</strong>
              <span>Total Answers</span>
            </div>
            <div class="stat-item">
              <strong>{{ stats.totalWords }}</strong>
              <span>Total Words</span>
            </div>
            <div class="stat-item">
              <strong>{{ stats.totalTags }}</strong>
              <span>Unique Tags</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <BaseButton @click="showExportModal = false" variant="secondary">
            Cancel
          </BaseButton>
          <BaseButton @click="exportData" variant="primary">
            Download Export
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

const copyAnswer = async (savedAnswer) => {
  try {
    let textToCopy = ''
    
    // If there's a conversation thread, format it nicely
    if (savedAnswer.conversation_thread && savedAnswer.conversation_thread.length > 1) {
      textToCopy = savedAnswer.conversation_thread.map((item, index) => {
        const label = index === 0 ? 'Question' : `Follow-up ${index}`
        return `${label}: ${item.question}\n\nAnswer: ${item.answer}\n\n${'='.repeat(60)}`
      }).join('\n\n')
    } else {
      // Single Q&A
      textToCopy = `Question: ${savedAnswer.question}\n\nAnswer: ${savedAnswer.answer}`
    }
    
    await navigator.clipboard.writeText(textToCopy)
    // You could add a toast notification here
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const exportData = async () => {
  try {
    const exportString = await savedAnswersService.exportData()
    const blob = new Blob([exportString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `bible-qa-saved-answers-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showExportModal.value = false
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
  padding: var(--spacing-xl);
}

.saved-answers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
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
  color: rgba(32, 39, 101, 0.709);
  margin: 0;
}

.saved-count {
  font-size: var(--font-size-sm);
  color: white;
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
  color: black;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-lg);
  color: black;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
  color: black;
}

.empty-state p {
  font-size: var(--font-size-base);
  max-width: 400px;
  margin: 0 auto;
  line-height: var(--line-height-relaxed);
  color: black;
}

.answers-grid {
  display: grid;
  gap: var(--spacing-sm);
}

.answer-card {
  background: var(--color-background);
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
  color: white;
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
  background: var(--color-background);
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
  color: white;
  margin-bottom: var(--spacing-lg);
  white-space: pre-wrap;
}

.answer-text :deep(.scripture-reference),
.question-text :deep(.scripture-reference) {
  color: var(--color-primary-bright, #5c7fd0);
  text-decoration: underline dotted;
  text-decoration-thickness: 2px;
  text-decoration-color: var(--color-primary-bright, #5c7fd0);
  transition: color var(--transition-normal, 0.2s), text-decoration-color var(--transition-normal, 0.2s);
}

.answer-text :deep(.scripture-reference:hover),
.answer-text :deep(.scripture-reference:focus),
.question-text :deep(.scripture-reference:hover),
.question-text :deep(.scripture-reference:focus) {
  color: var(--color-primary, #2f4a7e);
  text-decoration-color: var(--color-primary, #2f4a7e);
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
  color: white;
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

.answer-tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-background-muted);
  color: white;
  font-size: var(--font-size-xs);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border-light);
}

.answer-card-actions {
  display: flex;
  gap: var(--spacing-sm);
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal {
  background: var(--color-background);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: white;
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
  padding: var(--spacing-xl);
}

.modal-body p {
  color: white;
  margin-bottom: var(--spacing-lg);
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
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-item span {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
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
