import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const studyResourcesService = {
  async getCrossReferences({ book, chapter, verse }) {
    if (!book || !chapter || !verse) {
      throw new Error('book, chapter, and verse are required')
    }

    const response = await axios.get(`${API_URL}/api/study/cross-references`, {
      params: { book, chapter, verse }
    })
    return response.data
  },

  async searchTopics(keyword, limit = 10) {
    const params = { limit }
    if (keyword) {
      params.keyword = keyword
    }

    const response = await axios.get(`${API_URL}/api/study/topics`, {
      params
    })
    return response.data
  },

  async listReadingPlans() {
    const response = await axios.get(`${API_URL}/api/study/reading-plans`)
    return response.data || []
  },

  async getReadingPlan(slug, options = {}) {
    if (!slug) {
      throw new Error('slug is required')
    }

    const params = {}
    if (options.days) params.days = options.days
    if (options.startDate) params.start_date = options.startDate

    const response = await axios.get(`${API_URL}/api/study/reading-plans/${slug}`, { params })
    return response.data
  },

  async listDevotionalTemplates() {
    const response = await axios.get(`${API_URL}/api/study/devotional-templates`)
    return response.data || []
  },

  async generateDevotional(payload) {
    if (!payload?.topic) {
      throw new Error('topic is required')
    }

    const response = await axios.post(`${API_URL}/api/study/devotionals`, {
      topic: payload.topic,
      template_slug: payload.templateSlug || payload.template_slug,
      passage: payload.passage,
      plan_slug: payload.planSlug || payload.plan_slug,
      day: payload.day
    })
    return response.data
  }
}

export default studyResourcesService
