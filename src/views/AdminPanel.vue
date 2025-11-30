<template>
  <div class="admin-panel">
    <div class="panel-header">
      <h1>Admin Moderation Panel</h1>
      <button @click="$router.push('/admin/dashboard')" class="dashboard-link">📊 View Dashboard</button>
    </div>
    <section>
      <h2>Questions</h2>
      <ul>
        <li v-for="q in questions" :key="q.id">
          <span>{{ q.question }}</span>
          <button @click="deleteQuestion(q.id)">Delete</button>
        </li>
      </ul>
    </section>
    <section>
      <h2>Saved Answers</h2>
      <ul>
        <li v-for="a in answers" :key="a.id">
          <span>{{ a.answer }}</span>
          <button @click="deleteAnswer(a.id)">Delete</button>
        </li>
      </ul>
    </section>
    <section>
      <h2>System Health & Audit</h2>
      <div>
        <button @click="fetchApiUsage">Track API Usage</button>
        <button @click="fetchRedisKeys">Show Redis Keys</button>
        <button @click="fetchLogs">View Logs</button>
        <button @click="triggerMaintenance">Run Maintenance</button>
        <button @click="flushQueues">Flush Queues</button>
      </div>
      <div v-if="apiUsage">
        <h3>API Usage</h3>
        <pre>{{ apiUsage }}</pre>
      </div>
      <div v-if="redisKeys">
        <h3>Redis Keys</h3>
        <pre>{{ redisKeys }}</pre>
      </div>
      <div v-if="logs">
        <h3>Logs</h3>
        <pre>{{ logs }}</pre>
      </div>
      <div v-if="maintenanceResult">
        <h3>Maintenance Result</h3>
        <pre>{{ maintenanceResult }}</pre>
      </div>
      <div v-if="flushResult">
        <h3>Flush Queues Result</h3>
        <pre>{{ flushResult }}</pre>
      </div>
    </section>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const questions = ref([])
const answers = ref([])
const error = ref('')
const apiUsage = ref('')
const redisKeys = ref('')
const logs = ref('')
const maintenanceResult = ref('')
const flushResult = ref('')

const fetchQuestions = async () => {
  try {
    const res = await axios.get('/api/admin/questions')
    questions.value = res.data.questions || []
  } catch (e) {
    error.value = 'Failed to load questions.'
  }
}

const fetchAnswers = async () => {
  try {
    const res = await axios.get('/api/admin/saved_answers')
    answers.value = res.data.answers || []
  } catch (e) {
    error.value = 'Failed to load answers.'
  }
}

const fetchApiUsage = async () => {
  try {
    const res = await axios.get('/api/admin/audit/api_usage')
    apiUsage.value = JSON.stringify(res.data, null, 2)
  } catch (e) {
    error.value = 'Failed to fetch API usage.'
  }
}

const fetchRedisKeys = async () => {
  try {
    const res = await axios.get('/api/admin/audit/redis_keys')
    redisKeys.value = JSON.stringify(res.data, null, 2)
  } catch (e) {
    error.value = 'Failed to fetch Redis keys.'
  }
}

const fetchLogs = async () => {
  try {
    const res = await axios.get('/api/admin/audit/logs')
    logs.value = res.data.logs || ''
  } catch (e) {
    error.value = 'Failed to fetch logs.'
  }
}

const triggerMaintenance = async () => {
  try {
    const res = await axios.post('/api/admin/maintenance/run')
    maintenanceResult.value = JSON.stringify(res.data, null, 2)
  } catch (e) {
    error.value = 'Failed to run maintenance.'
  }
}

const flushQueues = async () => {
  try {
    const res = await axios.post('/api/admin/maintenance/flush_queues')
    flushResult.value = JSON.stringify(res.data, null, 2)
  } catch (e) {
    error.value = 'Failed to flush queues.'
  }
}

const deleteQuestion = async (id) => {
  try {
    await axios.delete(`/api/admin/questions/${id}`)
    questions.value = questions.value.filter(q => q.id !== id)
  } catch (e) {
    error.value = 'Failed to delete question.'
  }
}

const deleteAnswer = async (id) => {
  try {
    await axios.delete(`/api/admin/saved_answers/${id}`)
    answers.value = answers.value.filter(a => a.id !== id)
  } catch (e) {
    error.value = 'Failed to delete answer.'
  }
}

onMounted(() => {
  fetchQuestions()
  fetchAnswers()
})
</script>

<style scoped>
.admin-panel {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2.5rem 2rem;
  background: var(--color-bg-card, #fff);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(47,74,126,0.08);
  font-family: var(--font-family, 'Inter', 'Segoe UI', Arial, sans-serif);
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.dashboard-link {
  background: #2f4a7e;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 0.2s;
}
.dashboard-link:hover {
  background: #243a63;
}
h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-primary, #2f4a7e);
}
section {
  margin-bottom: 2.5rem;
}
h2 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-primary, #2f4a7e);
}
ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}
li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}
button {
  margin-left: 1rem;
  background: var(--color-danger, #d9534f);
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.15s;
}
button:hover {
  background: #c9302c;
}
pre {
  background: #f3f6fa;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.95rem;
  color: #2f4a7e;
  margin-top: 0.5rem;
  overflow-x: auto;
}
.error {
  color: #d9534f;
  margin-top: 1rem;
  font-weight: 600;
}
@media (max-width: 768px) {
  .admin-panel {
    padding: 1rem 0.5rem;
    border-radius: 8px;
  }
  h1 {
    font-size: 1.5rem;
  }
  h2 {
    font-size: 1.1rem;
  }
  li {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.7rem 0.5rem;
  }
  button {
    margin: 0.5rem 0 0 0;
    width: 100%;
  }
}
</style>
