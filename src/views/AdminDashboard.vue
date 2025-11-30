<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <button @click="$router.push('/')" class="back-button">← Back to App</button>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'stats' }" 
        @click="activeTab = 'stats'"
      >
        Statistics
      </button>
      <button 
        :class="{ active: activeTab === 'logs' }" 
        @click="activeTab = 'logs'"
      >
        API Logs
      </button>
      <button 
        :class="{ active: activeTab === 'endpoints' }" 
        @click="activeTab = 'endpoints'"
      >
        Endpoints
      </button>
      <button 
        :class="{ active: activeTab === 'openai' }" 
        @click="switchToOpenAITab"
      >
        OpenAI Usage
      </button>
      <button 
        :class="{ active: activeTab === 'users' }" 
        @click="switchToUsersTab"
      >
        Users
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <!-- Statistics Tab -->
    <div v-if="activeTab === 'stats'" class="tab-content">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Requests</h3>
          <div class="stat-value">{{ stats.total_requests || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>Unique Users</h3>
          <div class="stat-value">{{ stats.unique_users || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>Successful Requests</h3>
          <div class="stat-value success">{{ stats.successful_requests || 0 }}</div>
          <div class="stat-percentage">
            {{ getSuccessRate() }}%
          </div>
        </div>
        <div class="stat-card">
          <h3>Error Requests</h3>
          <div class="stat-value error">{{ stats.error_requests || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>OpenAI Requests</h3>
          <div class="stat-value">{{ stats.openai_requests || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- API Logs Tab -->
    <div v-if="activeTab === 'logs'" class="tab-content">
      <div class="filters">
        <input 
          v-model="filters.endpoint" 
          placeholder="Filter by endpoint"
          @input="debouncedLoadLogs"
        />
        <select v-model="filters.status_code" @change="loadLogs">
          <option value="">All Status Codes</option>
          <option value="200">200 - Success</option>
          <option value="400">400 - Bad Request</option>
          <option value="401">401 - Unauthorized</option>
          <option value="404">404 - Not Found</option>
          <option value="500">500 - Server Error</option>
        </select>
        <button @click="resetFilters" class="btn-secondary">Reset</button>
      </div>

      <div class="table-container">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User ID</th>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Status</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ formatDate(log.timestamp) }}</td>
              <td>{{ log.user_id || 'Guest' }}</td>
              <td class="endpoint-cell">{{ log.endpoint }}</td>
              <td>
                <span class="method-badge" :class="log.method.toLowerCase()">
                  {{ log.method }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(log.status_code)">
                  {{ log.status_code }}
                </span>
              </td>
              <td>{{ log.ip_address }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="logs.length === 0" class="empty-state">
          No logs found
        </div>
      </div>

      <div class="pagination">
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="btn-secondary"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }}</span>
        <button 
          @click="nextPage" 
          :disabled="logs.length < pageSize"
          class="btn-secondary"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Endpoints Tab -->
    <div v-if="activeTab === 'endpoints'" class="tab-content">
      <h2>Top Endpoints by Request Count</h2>
      <div class="table-container">
        <table class="endpoints-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Request Count</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="endpoint in endpointStats" :key="endpoint.endpoint">
              <td class="endpoint-cell">{{ endpoint.endpoint }}</td>
              <td>{{ endpoint.request_count }}</td>
              <td>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: endpoint.success_rate + '%' }"
                  ></div>
                  <span class="progress-text">{{ endpoint.success_rate.toFixed(1) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="endpointStats.length === 0" class="empty-state">
          No endpoint data available
        </div>
      </div>
    </div>

    <!-- OpenAI Usage Tab -->
    <div v-if="activeTab === 'openai'" class="tab-content">
      <h2>OpenAI API Usage</h2>
      
      <!-- OpenAI Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total API Calls</h3>
          <div class="stat-value">{{ openaiStats.total_calls || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>Total Tokens Used</h3>
          <div class="stat-value">{{ formatNumber(openaiStats.total_tokens_used || 0) }}</div>
          <div class="stat-percentage">~${{ estimateCost(openaiStats.total_tokens_used) }}</div>
        </div>
        <div class="stat-card">
          <h3>Avg Tokens/Call</h3>
          <div class="stat-value">{{ Math.round(openaiStats.avg_tokens_per_call || 0) }}</div>
        </div>
        <div class="stat-card">
          <h3>Avg Response Time</h3>
          <div class="stat-value">{{ Math.round(openaiStats.avg_response_time_ms || 0) }}ms</div>
        </div>
        <div class="stat-card">
          <h3>Success Rate</h3>
          <div class="stat-value success">{{ getOpenAISuccessRate() }}%</div>
        </div>
      </div>

      <!-- Top Users by Token Usage -->
      <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Top Users by Token Usage</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Total Calls</th>
              <th>Total Tokens</th>
              <th>Avg Tokens/Call</th>
              <th>Est. Cost</th>
              <th>Last Call</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in openaiUserUsage" :key="user.user_id">
              <td>{{ user.user_id }}</td>
              <td>{{ user.call_count }}</td>
              <td>{{ formatNumber(user.total_tokens) }}</td>
              <td>{{ Math.round(user.avg_tokens_per_call) }}</td>
              <td>${{ estimateCost(user.total_tokens) }}</td>
              <td>{{ formatDate(user.last_call) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="openaiUserUsage.length === 0" class="empty-state">
          No user data available
        </div>
      </div>

      <!-- Recent OpenAI Calls -->
      <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Recent OpenAI API Calls</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User ID</th>
              <th>Question</th>
              <th>Total Tokens</th>
              <th>Response Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="call in openaiCalls" :key="call.id">
              <td>{{ formatDate(call.timestamp) }}</td>
              <td>{{ call.user_id || 'Guest' }}</td>
              <td class="question-cell">{{ truncate(call.question, 50) }}</td>
              <td>{{ call.total_tokens }}</td>
              <td>{{ call.response_time_ms }}ms</td>
              <td>
                <span class="status-badge" :class="call.status">
                  {{ call.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="openaiCalls.length === 0" class="empty-state">
          No OpenAI calls logged yet
        </div>
      </div>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <h2>User Management</h2>
      
      <!-- User Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Users</h3>
          <div class="stat-value">{{ userStats.total_users || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>Active Users</h3>
          <div class="stat-value success">{{ userStats.active_users || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>Admin Users</h3>
          <div class="stat-value">{{ userStats.admin_users || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>Users with Questions</h3>
          <div class="stat-value">{{ userStats.users_with_questions || 0 }}</div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="filters" style="margin-top: 2rem;">
        <input 
          v-model="userSearch" 
          placeholder="Search by email or username"
          @input="debouncedLoadUsers"
        />
        <label class="checkbox-label">
          <input type="checkbox" v-model="activeUsersOnly" @change="loadUsers" />
          Active users only
        </label>
        <button @click="resetUserFilters" class="btn-secondary">Reset</button>
        <button @click="cleanupGuestUsers" class="btn-warning" title="Remove invalid guest user accounts">
          🧹 Cleanup Guests
        </button>
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Username</th>
              <th>Status</th>
              <th>Questions</th>
              <th>Saved Answers</th>
              <th>Last Activity</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.email || 'N/A' }}</td>
              <td>{{ user.username || 'N/A' }}</td>
              <td>
                <span class="status-badge" :class="user.is_active ? 'success' : 'inactive'">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span v-if="user.is_admin" class="admin-badge">Admin</span>
              </td>
              <td>{{ user.question_count }}</td>
              <td>{{ user.saved_answer_count }}</td>
              <td>{{ formatDate(user.last_activity) || 'Never' }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="viewUserDetail(user.id)" class="btn-small" title="View Details">
                    👁️
                  </button>
                  <button @click="toggleUserActive(user.id)" class="btn-small" title="Toggle Active">
                    {{ user.is_active ? '🚫' : '✅' }}
                  </button>
                  <button @click="confirmResetAccount(user)" class="btn-small btn-warning" title="Reset Account">
                    🔄
                  </button>
                  <button @click="confirmDeleteUser(user)" class="btn-small btn-danger" title="Delete User">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="users.length === 0" class="empty-state">
          No users found
        </div>
      </div>

      <div class="pagination">
        <button 
          @click="previousUserPage" 
          :disabled="userCurrentPage === 1"
          class="btn-secondary"
        >
          Previous
        </button>
        <span class="page-info">Page {{ userCurrentPage }}</span>
        <button 
          @click="nextUserPage" 
          :disabled="users.length < userPageSize"
          class="btn-secondary"
        >
          Next
        </button>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div v-if="showUserDetail" class="modal-overlay" @click="closeUserDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>User Details</h2>
          <button @click="closeUserDetail" class="close-button">×</button>
        </div>
        <div v-if="selectedUser" class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <strong>ID:</strong> {{ selectedUser.id }}
            </div>
            <div class="detail-item">
              <strong>Email:</strong> {{ selectedUser.email || 'N/A' }}
            </div>
            <div class="detail-item">
              <strong>Username:</strong> {{ selectedUser.username || 'N/A' }}
            </div>
            <div class="detail-item">
              <strong>Status:</strong> 
              <span :class="selectedUser.is_active ? 'text-success' : 'text-inactive'">
                {{ selectedUser.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="detail-item">
              <strong>Admin:</strong> {{ selectedUser.is_admin ? 'Yes' : 'No' }}
            </div>
            <div class="detail-item">
              <strong>Created:</strong> {{ formatDate(selectedUser.created_at) }}
            </div>
            <div class="detail-item">
              <strong>Last Activity:</strong> {{ formatDate(selectedUser.last_activity) || 'Never' }}
            </div>
            <div class="detail-item">
              <strong>Total Questions:</strong> {{ selectedUser.question_count }}
            </div>
            <div class="detail-item">
              <strong>Saved Answers:</strong> {{ selectedUser.saved_answer_count }}
            </div>
            <div class="detail-item">
              <strong>Recent Questions:</strong> {{ selectedUser.recent_question_count }}
            </div>
          </div>
          <div class="modal-actions">
            <button @click="clearUserSavedAnswers(selectedUser.id)" class="btn-secondary">
              Clear Saved Answers
            </button>
            <button @click="confirmResetAccount(selectedUser)" class="btn-warning">
              Reset Account
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { bibleApi } from '../services/bibleApi.js'

const activeTab = ref('stats')
const error = ref('')
const stats = ref({})
const logs = ref([])
const endpointStats = ref([])
const openaiStats = ref({})
const openaiCalls = ref([])
const openaiUserUsage = ref([])
const currentPage = ref(1)
const pageSize = ref(50)
// User management state
const userStats = ref({})
const users = ref([])
const userSearch = ref('')
const activeUsersOnly = ref(false)
const userCurrentPage = ref(1)
const userPageSize = ref(50)
const showUserDetail = ref(false)
const selectedUser = ref(null)
const filters = ref({
  endpoint: '',
  status_code: '',
  user_id: null,
})

// Debounce timer
let debounceTimer = null

const loadStats = async () => {
  try {
    error.value = ''
    const data = await bibleApi.getApiStats()
    stats.value = data
  } catch (e) {
    error.value = 'Failed to load statistics: ' + e.message
  }
}

const loadLogs = async () => {
  try {
    error.value = ''
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value,
    }
    
    if (filters.value.endpoint) {
      params.endpoint = filters.value.endpoint
    }
    if (filters.value.status_code) {
      params.status_code = parseInt(filters.value.status_code)
    }
    if (filters.value.user_id) {
      params.user_id = parseInt(filters.value.user_id)
    }
    
    const data = await bibleApi.getApiLogs(params)
    logs.value = data.logs || []
  } catch (e) {
    error.value = 'Failed to load logs: ' + e.message
  }
}

const loadEndpointStats = async () => {
  try {
    error.value = ''
    const data = await bibleApi.getEndpointStats({ limit: 20 })
    endpointStats.value = data.endpoints || []
  } catch (e) {
    error.value = 'Failed to load endpoint stats: ' + e.message
  }
}

const debouncedLoadLogs = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    loadLogs()
  }, 300)
}

const resetFilters = () => {
  filters.value = {
    endpoint: '',
    status_code: '',
    user_id: null,
  }
  currentPage.value = 1
  loadLogs()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadLogs()
  }
}

const nextPage = () => {
  currentPage.value++
  loadLogs()
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusClass = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) return 'success'
  if (statusCode >= 400 && statusCode < 500) return 'client-error'
  if (statusCode >= 500) return 'server-error'
  return ''
}

const getSuccessRate = () => {
  if (!stats.value.total_requests) return 0
  return ((stats.value.successful_requests / stats.value.total_requests) * 100).toFixed(1)
}

const loadOpenAIStats = async () => {
  try {
    error.value = ''
    const data = await bibleApi.getOpenAIStats()
    openaiStats.value = data
  } catch (e) {
    error.value = 'Failed to load OpenAI stats: ' + e.message
  }
}

const loadOpenAICalls = async () => {
  try {
    error.value = ''
    const data = await bibleApi.getOpenAICalls({ limit: 50 })
    openaiCalls.value = data.calls || []
  } catch (e) {
    error.value = 'Failed to load OpenAI calls: ' + e.message
  }
}

const loadOpenAIUserUsage = async () => {
  try {
    error.value = ''
    const data = await bibleApi.getOpenAIUserUsage({ limit: 10 })
    openaiUserUsage.value = data.users || []
  } catch (e) {
    error.value = 'Failed to load OpenAI user usage: ' + e.message
  }
}

const switchToOpenAITab = () => {
  activeTab.value = 'openai'
  loadOpenAIStats()
  loadOpenAICalls()
  loadOpenAIUserUsage()
}

const getOpenAISuccessRate = () => {
  if (!openaiStats.value.total_calls) return 0
  return ((openaiStats.value.successful_calls / openaiStats.value.total_calls) * 100).toFixed(1)
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const estimateCost = (tokens) => {
  // GPT-4o pricing: $2.50 per 1M input tokens, $10 per 1M output tokens
  // Simplified estimate: average $5 per 1M tokens
  const costPer1M = 5
  const cost = (tokens / 1000000) * costPer1M
  return cost.toFixed(2)
}

const truncate = (text, length) => {
  if (!text) return 'N/A'
  return text.length > length ? text.substring(0, length) + '...' : text
}

// User Management Functions
const loadUserStats = async () => {
  try {
    error.value = ''
    const data = await bibleApi.getUserStats()
    userStats.value = data
  } catch (e) {
    error.value = 'Failed to load user stats: ' + e.message
  }
}

const loadUsers = async () => {
  try {
    error.value = ''
    const params = {
      limit: userPageSize.value,
      offset: (userCurrentPage.value - 1) * userPageSize.value,
    }
    
    if (userSearch.value) {
      params.search = userSearch.value
    }
    if (activeUsersOnly.value) {
      params.active_only = true
    }
    
    const data = await bibleApi.listUsers(params)
    users.value = data || []
  } catch (e) {
    error.value = 'Failed to load users: ' + e.message
  }
}

const debouncedLoadUsers = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    userCurrentPage.value = 1
    loadUsers()
  }, 300)
}

const resetUserFilters = () => {
  userSearch.value = ''
  activeUsersOnly.value = false
  userCurrentPage.value = 1
  loadUsers()
}

const previousUserPage = () => {
  if (userCurrentPage.value > 1) {
    userCurrentPage.value--
    loadUsers()
  }
}

const nextUserPage = () => {
  userCurrentPage.value++
  loadUsers()
}

const viewUserDetail = async (userId) => {
  try {
    error.value = ''
    const data = await bibleApi.getUserDetail(userId)
    selectedUser.value = data
    showUserDetail.value = true
  } catch (e) {
    error.value = 'Failed to load user details: ' + e.message
  }
}

const closeUserDetail = () => {
  showUserDetail.value = false
  selectedUser.value = null
}

const toggleUserActive = async (userId) => {
  if (!confirm('Are you sure you want to toggle this user\'s active status?')) {
    return
  }
  
  try {
    error.value = ''
    await bibleApi.toggleUserActive(userId)
    await loadUsers()
    await loadUserStats()
  } catch (e) {
    error.value = 'Failed to toggle user active status: ' + e.message
  }
}

const clearUserSavedAnswers = async (userId) => {
  if (!confirm('Are you sure you want to clear all saved answers for this user?')) {
    return
  }
  
  try {
    error.value = ''
    const result = await bibleApi.clearUserSavedAnswers(userId)
    alert(result.message)
    if (showUserDetail.value && selectedUser.value?.id === userId) {
      await viewUserDetail(userId) // Refresh details
    }
    await loadUsers()
  } catch (e) {
    error.value = 'Failed to clear saved answers: ' + e.message
  }
}

const confirmResetAccount = async (user) => {
  const confirmation = prompt(
    `This will delete ALL data for user ${user.email || user.username} (${user.question_count} questions, ${user.saved_answer_count} saved answers).\n\nType "RESET" to confirm:`
  )
  
  if (confirmation !== 'RESET') {
    return
  }
  
  try {
    error.value = ''
    const result = await bibleApi.resetUserAccount(user.id)
    alert('Account reset successfully')
    closeUserDetail()
    await loadUsers()
    await loadUserStats()
  } catch (e) {
    error.value = 'Failed to reset account: ' + e.message
  }
}

const confirmDeleteUser = async (user) => {
  const confirmation = prompt(
    `This will PERMANENTLY DELETE user ${user.email || user.username} and all their data.\n\nThis action CANNOT be undone.\n\nType "DELETE" to confirm:`
  )
  
  if (confirmation !== 'DELETE') {
    return
  }
  
  try {
    error.value = ''
    await bibleApi.deleteUser(user.id)
    alert('User permanently deleted')
    closeUserDetail()
    await loadUsers()
    await loadUserStats()
  } catch (e) {
    error.value = 'Failed to delete user: ' + e.message
  }
}

const switchToUsersTab = () => {
  activeTab.value = 'users'
  loadUserStats()
  loadUsers()
}

const cleanupGuestUsers = async () => {
  if (!confirm('This will permanently delete all guest user accounts except user_id=1.\n\nThis includes users without email addresses that may have been created by mistake.\n\nContinue?')) {
    return
  }
  
  try {
    error.value = ''
    const result = await bibleApi.cleanupGuestUsers()
    alert(`${result.message}\n\nDeleted: ${result.deleted_count} user(s)`)
    await loadUsers()
    await loadUserStats()
  } catch (e) {
    error.value = 'Failed to cleanup guest users: ' + e.message
  }
}

onMounted(() => {
  loadStats()
  loadLogs()
  loadEndpointStats()
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #2f4a7e;
  margin: 0;
}

.back-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.back-button:hover {
  background: #5a6268;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
}

.tabs button {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tabs button:hover {
  color: #2f4a7e;
}

.tabs button.active {
  color: #2f4a7e;
  border-bottom-color: #2f4a7e;
}

.error-banner {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #c33;
}

.tab-content {
  animation: fadeIn 0.3s;
  color: black;
}

.tab-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2f4a7e;
  margin-bottom: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-left: 4px solid #2f4a7e;
}

.stat-card h3 {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2f4a7e;
  margin: 0.5rem 0;
}

.stat-value.success {
  color: #28a745;
}

.stat-value.error {
  color: #dc3545;
}

.stat-percentage {
  font-size: 0.9rem;
  color: #6c757d;
}

/* Filters */
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters input,
.filters select {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  flex: 1;
  min-width: 200px;
}

.filters input:focus,
.filters select:focus {
  outline: none;
  border-color: #2f4a7e;
}

/* Tables */
.table-container {
  background: white;
  border-radius: 12px;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow-x: auto;
  color: black;
  margin-bottom: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2f4a7e;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.75rem;
}

tbody tr:hover {
  background: #f8f9fa;
}

.endpoint-cell {
  font-family: 'Monaco', 'Courier New', monospace;
  color: #2f4a7e;
  font-size: 0.85rem;
}

.question-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge.success {
  background: #e7f7ec;
  color: #28a745;
}

.status-badge.error {
  background: #fee;
  color: #dc3545;
}

.status-badge.rate_limit {
  background: #fff3e0;
  color: #ff9800;
}

.method-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.method-badge.get {
  background: #e7f3ff;
  color: #0066cc;
}

.method-badge.post {
  background: #e7f7ec;
  color: #28a745;
}

.method-badge.put {
  background: #fff3e0;
  color: #ff9800;
}

.method-badge.delete {
  background: #fee;
  color: #dc3545;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.success {
  background: #e7f7ec;
  color: #28a745;
}

.status-badge.client-error {
  background: #fff3e0;
  color: #ff9800;
}

.status-badge.server-error {
  background: #fee;
  color: #dc3545;
}

/* Progress Bar */
.progress-bar {
  position: relative;
  width: 100%;
  height: 28px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.progress-text {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  z-index: 1;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #2f4a7e;
  color: white;
}

.btn-primary:hover {
  background: #243a63;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-secondary:disabled {
  background: #c8cdd2;
  cursor: not-allowed;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.page-info {
  font-weight: 500;
  color: #2f4a7e;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.1rem;
}

/* Moderation Section */
.moderation-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-align: center;
}

.moderation-section h2 {
  color: #2f4a7e;
  margin-bottom: 1rem;
}

.info-text {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    overflow-x: auto;
  }

  .tabs button {
    white-space: nowrap;
  }

  .filters {
    flex-direction: column;
  }

  .filters input,
  .filters select {
    min-width: 100%;
  }

  table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 0.6rem;
  }
}

/* User Management Styles */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.btn-small {
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 6px;
  background: #6c757d;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover {
  background: #5a6268;
  transform: scale(1.05);
}

.btn-small.btn-warning {
  background: #ffc107;
  color: #000;
}

.btn-small.btn-warning:hover {
  background: #e0a800;
}

.btn-small.btn-danger {
  background: #dc3545;
}

.btn-small.btn-danger:hover {
  background: #c82333;
}

.status-badge.inactive {
  background: #6c757d;
}

.admin-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #007bff;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h2 {
  margin: 0;
  color: #2f4a7e;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6c757d;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-button:hover {
  color: #000;
}

.modal-body {
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item strong {
  display: block;
  color: #2f4a7e;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.text-success {
  color: #28a745;
  font-weight: 500;
}

.text-inactive {
  color: #6c757d;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.btn-warning {
  background: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background: #e0a800;
}
</style>
