import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'

vi.mock('axios')

import { userReadingPlanService } from '../../services/userReadingPlanService'

describe('userReadingPlanService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('listPlans', () => {
    it('sends GET to /api/user-reading-plans and returns data', async () => {
      const plans = [
        { id: 1, plan_slug: 'gospels-30', nickname: 'My Gospels Plan' },
        { id: 2, plan_slug: 'psalms-14', nickname: null }
      ]
      axios.get.mockResolvedValueOnce({ data: plans })

      const result = await userReadingPlanService.listPlans()

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/user-reading-plans')
      )
      expect(result).toEqual(plans)
    })

    it('returns empty array when data is null', async () => {
      axios.get.mockResolvedValueOnce({ data: null })

      const result = await userReadingPlanService.listPlans()

      expect(result).toEqual([])
    })

    it('returns empty array when data is undefined', async () => {
      axios.get.mockResolvedValueOnce({ data: undefined })

      const result = await userReadingPlanService.listPlans()

      expect(result).toEqual([])
    })

    it('returns empty array when data is empty string', async () => {
      axios.get.mockResolvedValueOnce({ data: '' })

      const result = await userReadingPlanService.listPlans()

      expect(result).toEqual([])
    })

    it('propagates API errors', async () => {
      axios.get.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(userReadingPlanService.listPlans()).rejects.toThrow('Unauthorized')
    })
  })

  describe('startPlan', () => {
    it('sends POST with camelCase field names', async () => {
      const createdPlan = { id: 1, plan_slug: 'gospels-30', start_date: '2024-01-01' }
      axios.post.mockResolvedValueOnce({ data: createdPlan })

      const result = await userReadingPlanService.startPlan({
        planSlug: 'gospels-30',
        startDate: '2024-01-01',
        nickname: 'My Plan'
      })

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/user-reading-plans'),
        {
          plan_slug: 'gospels-30',
          start_date: '2024-01-01',
          nickname: 'My Plan'
        }
      )
      expect(result).toEqual(createdPlan)
    })

    it('sends POST with snake_case field names', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 2 } })

      await userReadingPlanService.startPlan({
        plan_slug: 'psalms-14',
        start_date: '2024-02-01'
      })

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        {
          plan_slug: 'psalms-14',
          start_date: '2024-02-01',
          nickname: null
        }
      )
    })

    it('defaults nickname to null when not provided', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 3 } })

      await userReadingPlanService.startPlan({
        planSlug: 'test-plan',
        startDate: '2024-03-01'
      })

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ nickname: null })
      )
    })

    it('propagates API errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('Plan already started'))

      await expect(
        userReadingPlanService.startPlan({ planSlug: 'test', startDate: '2024-01-01' })
      ).rejects.toThrow('Plan already started')
    })
  })

  describe('getPlanDetail', () => {
    it('sends GET with userPlanId in URL', async () => {
      const planDetail = {
        id: 1,
        plan_slug: 'gospels-30',
        days: [{ day: 1, is_complete: false }]
      }
      axios.get.mockResolvedValueOnce({ data: planDetail })

      const result = await userReadingPlanService.getPlanDetail(1)

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/user-reading-plans\/1$/)
      )
      expect(result).toEqual(planDetail)
    })

    it('throws when userPlanId is falsy (0)', async () => {
      await expect(
        userReadingPlanService.getPlanDetail(0)
      ).rejects.toThrow('userPlanId is required')
    })

    it('throws when userPlanId is null', async () => {
      await expect(
        userReadingPlanService.getPlanDetail(null)
      ).rejects.toThrow('userPlanId is required')
    })

    it('throws when userPlanId is undefined', async () => {
      await expect(
        userReadingPlanService.getPlanDetail(undefined)
      ).rejects.toThrow('userPlanId is required')
    })

    it('throws when userPlanId is empty string', async () => {
      await expect(
        userReadingPlanService.getPlanDetail('')
      ).rejects.toThrow('userPlanId is required')
    })

    it('propagates API errors', async () => {
      axios.get.mockRejectedValueOnce(new Error('Not found'))

      await expect(
        userReadingPlanService.getPlanDetail(999)
      ).rejects.toThrow('Not found')
    })
  })

  describe('updateDayCompletion', () => {
    it('sends PATCH with is_complete true', async () => {
      const updatedDay = { day: 3, is_complete: true }
      axios.patch.mockResolvedValueOnce({ data: updatedDay })

      const result = await userReadingPlanService.updateDayCompletion(1, 3, true)

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/user-reading-plans\/1\/days\/3$/),
        { is_complete: true }
      )
      expect(result).toEqual(updatedDay)
    })

    it('sends PATCH with is_complete false', async () => {
      axios.patch.mockResolvedValueOnce({ data: { day: 2, is_complete: false } })

      await userReadingPlanService.updateDayCompletion(1, 2, false)

      expect(axios.patch).toHaveBeenCalledWith(
        expect.any(String),
        { is_complete: false }
      )
    })

    it('coerces isComplete to boolean', async () => {
      axios.patch.mockResolvedValueOnce({ data: {} })

      await userReadingPlanService.updateDayCompletion(1, 1, 1)

      expect(axios.patch).toHaveBeenCalledWith(
        expect.any(String),
        { is_complete: true }
      )
    })

    it('coerces falsy isComplete (0) to false', async () => {
      axios.patch.mockResolvedValueOnce({ data: {} })

      await userReadingPlanService.updateDayCompletion(1, 1, 0)

      expect(axios.patch).toHaveBeenCalledWith(
        expect.any(String),
        { is_complete: false }
      )
    })

    it('coerces undefined isComplete to false', async () => {
      axios.patch.mockResolvedValueOnce({ data: {} })

      await userReadingPlanService.updateDayCompletion(1, 1, undefined)

      expect(axios.patch).toHaveBeenCalledWith(
        expect.any(String),
        { is_complete: false }
      )
    })

    it('throws when userPlanId is missing', async () => {
      await expect(
        userReadingPlanService.updateDayCompletion(null, 1, true)
      ).rejects.toThrow('userPlanId and dayNumber are required')
    })

    it('throws when dayNumber is missing', async () => {
      await expect(
        userReadingPlanService.updateDayCompletion(1, null, true)
      ).rejects.toThrow('userPlanId and dayNumber are required')
    })

    it('throws when both userPlanId and dayNumber are missing', async () => {
      await expect(
        userReadingPlanService.updateDayCompletion(0, 0, true)
      ).rejects.toThrow('userPlanId and dayNumber are required')
    })

    it('propagates API errors', async () => {
      axios.patch.mockRejectedValueOnce(new Error('Conflict'))

      await expect(
        userReadingPlanService.updateDayCompletion(1, 3, true)
      ).rejects.toThrow('Conflict')
    })
  })

  describe('deletePlan', () => {
    it('sends DELETE with userPlanId in URL', async () => {
      axios.delete.mockResolvedValueOnce({})

      await userReadingPlanService.deletePlan(5)

      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/user-reading-plans\/5$/)
      )
    })

    it('returns undefined (void method)', async () => {
      axios.delete.mockResolvedValueOnce({})

      const result = await userReadingPlanService.deletePlan(5)

      expect(result).toBeUndefined()
    })

    it('throws when userPlanId is falsy (0)', async () => {
      await expect(
        userReadingPlanService.deletePlan(0)
      ).rejects.toThrow('userPlanId is required')
    })

    it('throws when userPlanId is null', async () => {
      await expect(
        userReadingPlanService.deletePlan(null)
      ).rejects.toThrow('userPlanId is required')
    })

    it('throws when userPlanId is undefined', async () => {
      await expect(
        userReadingPlanService.deletePlan(undefined)
      ).rejects.toThrow('userPlanId is required')
    })

    it('propagates API errors', async () => {
      axios.delete.mockRejectedValueOnce(new Error('Forbidden'))

      await expect(
        userReadingPlanService.deletePlan(1)
      ).rejects.toThrow('Forbidden')
    })
  })
})
