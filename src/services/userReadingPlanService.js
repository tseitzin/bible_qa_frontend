import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const userReadingPlanService = {
  async listPlans() {
    const response = await axios.get(`${API_URL}/api/user-reading-plans`)
    return response.data || []
  },

  async startPlan(payload) {
    const response = await axios.post(`${API_URL}/api/user-reading-plans`, {
      plan_slug: payload.planSlug || payload.plan_slug,
      start_date: payload.startDate || payload.start_date,
      nickname: payload.nickname || null
    })
    return response.data
  },

  async getPlanDetail(userPlanId) {
    if (!userPlanId) {
      throw new Error('userPlanId is required')
    }
    const response = await axios.get(`${API_URL}/api/user-reading-plans/${userPlanId}`)
    return response.data
  },

  async updateDayCompletion(userPlanId, dayNumber, isComplete) {
    if (!userPlanId || !dayNumber) {
      throw new Error('userPlanId and dayNumber are required')
    }
    const response = await axios.patch(
      `${API_URL}/api/user-reading-plans/${userPlanId}/days/${dayNumber}`,
      { is_complete: Boolean(isComplete) }
    )
    return response.data
  },

  async deletePlan(userPlanId) {
    if (!userPlanId) {
      throw new Error('userPlanId is required')
    }
    await axios.delete(`${API_URL}/api/user-reading-plans/${userPlanId}`)
  }
}

export default userReadingPlanService
