import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'

vi.mock('axios')

import { studyResourcesService } from '../../services/studyResourcesService'

describe('studyResourcesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCrossReferences', () => {
    it('sends GET with book, chapter, and verse params', async () => {
      const mockData = { references: [{ ref: 'John 3:16' }] }
      axios.get.mockResolvedValueOnce({ data: mockData })

      const result = await studyResourcesService.getCrossReferences({
        book: 'Genesis',
        chapter: 1,
        verse: 1
      })

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/cross-references'),
        { params: { book: 'Genesis', chapter: 1, verse: 1 } }
      )
      expect(result).toEqual(mockData)
    })

    it('throws when book is missing', async () => {
      await expect(
        studyResourcesService.getCrossReferences({ chapter: 1, verse: 1 })
      ).rejects.toThrow('book, chapter, and verse are required')
    })

    it('throws when chapter is missing', async () => {
      await expect(
        studyResourcesService.getCrossReferences({ book: 'Genesis', verse: 1 })
      ).rejects.toThrow('book, chapter, and verse are required')
    })

    it('throws when verse is missing', async () => {
      await expect(
        studyResourcesService.getCrossReferences({ book: 'Genesis', chapter: 1 })
      ).rejects.toThrow('book, chapter, and verse are required')
    })

    it('throws when all params are missing', async () => {
      await expect(
        studyResourcesService.getCrossReferences({})
      ).rejects.toThrow('book, chapter, and verse are required')
    })

    it('propagates API errors', async () => {
      axios.get.mockRejectedValueOnce(new Error('Server error'))

      await expect(
        studyResourcesService.getCrossReferences({ book: 'Genesis', chapter: 1, verse: 1 })
      ).rejects.toThrow('Server error')
    })
  })

  describe('searchTopics', () => {
    it('sends GET with keyword and limit params', async () => {
      const mockData = { topics: ['love', 'faith'] }
      axios.get.mockResolvedValueOnce({ data: mockData })

      const result = await studyResourcesService.searchTopics('love', 5)

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/topics'),
        { params: { keyword: 'love', limit: 5 } }
      )
      expect(result).toEqual(mockData)
    })

    it('uses default limit of 10', async () => {
      axios.get.mockResolvedValueOnce({ data: [] })

      await studyResourcesService.searchTopics('faith')

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/topics'),
        { params: { keyword: 'faith', limit: 10 } }
      )
    })

    it('omits keyword param when keyword is falsy', async () => {
      axios.get.mockResolvedValueOnce({ data: [] })

      await studyResourcesService.searchTopics('')

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/topics'),
        { params: { limit: 10 } }
      )
    })

    it('omits keyword param when keyword is null', async () => {
      axios.get.mockResolvedValueOnce({ data: [] })

      await studyResourcesService.searchTopics(null)

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/topics'),
        { params: { limit: 10 } }
      )
    })

    it('propagates API errors', async () => {
      axios.get.mockRejectedValueOnce(new Error('Timeout'))

      await expect(studyResourcesService.searchTopics('test')).rejects.toThrow('Timeout')
    })
  })

  describe('listReadingPlans', () => {
    it('sends GET to /api/study/reading-plans and returns data', async () => {
      const plans = [{ slug: 'plan-1', name: 'Plan 1' }]
      axios.get.mockResolvedValueOnce({ data: plans })

      const result = await studyResourcesService.listReadingPlans()

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/reading-plans')
      )
      expect(result).toEqual(plans)
    })

    it('returns empty array when data is null', async () => {
      axios.get.mockResolvedValueOnce({ data: null })

      const result = await studyResourcesService.listReadingPlans()

      expect(result).toEqual([])
    })

    it('returns empty array when data is undefined', async () => {
      axios.get.mockResolvedValueOnce({ data: undefined })

      const result = await studyResourcesService.listReadingPlans()

      expect(result).toEqual([])
    })

    it('propagates API errors', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(studyResourcesService.listReadingPlans()).rejects.toThrow('Network error')
    })
  })

  describe('getReadingPlan', () => {
    it('sends GET with slug in URL', async () => {
      const planData = { slug: 'gospels-30', name: 'Gospels in 30 days', days: [] }
      axios.get.mockResolvedValueOnce({ data: planData })

      const result = await studyResourcesService.getReadingPlan('gospels-30')

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/reading-plans/gospels-30'),
        { params: {} }
      )
      expect(result).toEqual(planData)
    })

    it('passes days and startDate as query params', async () => {
      axios.get.mockResolvedValueOnce({ data: {} })

      await studyResourcesService.getReadingPlan('plan-1', {
        days: 30,
        startDate: '2024-01-01'
      })

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/reading-plans/plan-1'),
        { params: { days: 30, start_date: '2024-01-01' } }
      )
    })

    it('does not include days or start_date when options are empty', async () => {
      axios.get.mockResolvedValueOnce({ data: {} })

      await studyResourcesService.getReadingPlan('plan-1', {})

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        { params: {} }
      )
    })

    it('throws when slug is missing', async () => {
      await expect(studyResourcesService.getReadingPlan('')).rejects.toThrow('slug is required')
    })

    it('throws when slug is null', async () => {
      await expect(studyResourcesService.getReadingPlan(null)).rejects.toThrow('slug is required')
    })

    it('throws when slug is undefined', async () => {
      await expect(studyResourcesService.getReadingPlan(undefined)).rejects.toThrow('slug is required')
    })
  })

  describe('listDevotionalTemplates', () => {
    it('sends GET to /api/study/devotional-templates and returns data', async () => {
      const templates = [{ slug: 'morning', name: 'Morning Devotional' }]
      axios.get.mockResolvedValueOnce({ data: templates })

      const result = await studyResourcesService.listDevotionalTemplates()

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/devotional-templates')
      )
      expect(result).toEqual(templates)
    })

    it('returns empty array when data is null', async () => {
      axios.get.mockResolvedValueOnce({ data: null })

      const result = await studyResourcesService.listDevotionalTemplates()

      expect(result).toEqual([])
    })

    it('returns empty array when data is falsy', async () => {
      axios.get.mockResolvedValueOnce({ data: '' })

      const result = await studyResourcesService.listDevotionalTemplates()

      expect(result).toEqual([])
    })
  })

  describe('generateDevotional', () => {
    it('sends POST with topic and optional fields', async () => {
      const devotional = { title: 'On Love', content: 'God is love...' }
      axios.post.mockResolvedValueOnce({ data: devotional })

      const result = await studyResourcesService.generateDevotional({
        topic: 'Love',
        templateSlug: 'morning',
        passage: 'John 3:16',
        planSlug: 'gospels-30',
        day: 5
      })

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/study/devotionals'),
        {
          topic: 'Love',
          template_slug: 'morning',
          passage: 'John 3:16',
          plan_slug: 'gospels-30',
          day: 5
        }
      )
      expect(result).toEqual(devotional)
    })

    it('accepts snake_case field names as well', async () => {
      axios.post.mockResolvedValueOnce({ data: {} })

      await studyResourcesService.generateDevotional({
        topic: 'Faith',
        template_slug: 'evening',
        plan_slug: 'psalms-14'
      })

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          topic: 'Faith',
          template_slug: 'evening',
          plan_slug: 'psalms-14'
        })
      )
    })

    it('sends undefined fields when not provided', async () => {
      axios.post.mockResolvedValueOnce({ data: {} })

      await studyResourcesService.generateDevotional({ topic: 'Hope' })

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        {
          topic: 'Hope',
          template_slug: undefined,
          passage: undefined,
          plan_slug: undefined,
          day: undefined
        }
      )
    })

    it('throws when topic is missing', async () => {
      await expect(
        studyResourcesService.generateDevotional({})
      ).rejects.toThrow('topic is required')
    })

    it('throws when payload is null', async () => {
      await expect(
        studyResourcesService.generateDevotional(null)
      ).rejects.toThrow('topic is required')
    })

    it('throws when payload is undefined', async () => {
      await expect(
        studyResourcesService.generateDevotional(undefined)
      ).rejects.toThrow('topic is required')
    })

    it('propagates API errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('OpenAI quota exceeded'))

      await expect(
        studyResourcesService.generateDevotional({ topic: 'Grace' })
      ).rejects.toThrow('OpenAI quota exceeded')
    })
  })
})
