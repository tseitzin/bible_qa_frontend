<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <button @click="$router.push('/main')" class="back-button">← Back to App</button>
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
        :class="{ active: activeTab === 'moderation' }" 
        @click="activeTab = 'moderation'"
      >
        Moderation
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

    <!-- Moderation Tab -->
    <div v-if="activeTab === 'moderation'" class="tab-content">
      <div class="moderation-section">
        <h2>Content Moderation</h2>
        <p class="info-text">
          This section allows you to moderate user-generated content such as questions and saved answers.
        </p>
        <button @click="$router.push('/admin')" class="btn-primary">
          Go to Moderation Panel
        </button>
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
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
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
</style>
