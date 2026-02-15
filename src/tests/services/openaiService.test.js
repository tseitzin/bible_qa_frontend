import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'

vi.mock('axios', () => {
  const instance = {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
  return {
    default: {
      create: vi.fn(() => instance)
    }
  }
})

describe('openaiService', () => {
  let openaiService
  let mockClient

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    // Set the API key env var before importing
    vi.stubEnv('VITE_OPENAI_API_KEY', 'test-api-key')

    vi.doMock('axios', () => {
      const instance = {
        post: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      return {
        default: {
          create: vi.fn(() => instance)
        }
      }
    })

    const mod = await import('../../services/openaiService')
    openaiService = mod.openaiService

    const axiosMod = await import('axios')
    mockClient = axiosMod.default.create()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('generateKidsImage', () => {
    it('calls DALL-E API and returns image URL', async () => {
      const imageUrl = 'https://example.com/image.png'
      mockClient.post.mockResolvedValueOnce({
        data: { data: [{ url: imageUrl }] }
      })

      const result = await openaiService.generateKidsImage('Who is Jesus?', 'Jesus is the Son of God')

      expect(mockClient.post).toHaveBeenCalledWith('/images/generations', expect.objectContaining({
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
        prompt: expect.any(String)
      }))
      expect(result).toBe(imageUrl)
    })

    it('includes style guidelines in the prompt', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { data: [{ url: 'https://example.com/img.png' }] }
      })

      await openaiService.generateKidsImage('Tell me about Moses', 'Moses led the Israelites')

      const callArgs = mockClient.post.mock.calls[0][1]
      expect(callArgs.prompt).toContain('bright and cheerful colors')
      expect(callArgs.prompt).toContain('children')
      expect(callArgs.prompt).toContain('biblically accurate')
    })

    it('propagates API errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockClient.post.mockRejectedValueOnce(new Error('Rate limit exceeded'))

      await expect(
        openaiService.generateKidsImage('test?', 'test answer')
      ).rejects.toThrow('Rate limit exceeded')

      consoleSpy.mockRestore()
    })

    it('throws when API key is not configured', async () => {
      vi.resetModules()
      vi.stubEnv('VITE_OPENAI_API_KEY', '')

      vi.doMock('axios', () => {
        const instance = {
          post: vi.fn(),
          interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
          }
        }
        return { default: { create: vi.fn(() => instance) } }
      })

      const mod = await import('../../services/openaiService')

      await expect(
        mod.openaiService.generateKidsImage('test?', 'answer')
      ).rejects.toThrow('OpenAI API key not configured')
    })
  })

  describe('createKidsImagePrompt', () => {
    it('appends style guidelines to the base scene', () => {
      const prompt = openaiService.createKidsImagePrompt('Who is Jesus?', 'Jesus is the Son of God')

      expect(prompt).toContain('bright and cheerful colors')
      expect(prompt).toContain('safe and comforting for children')
      expect(prompt).toContain('ages 3-12')
      expect(prompt).toContain("children's Bible illustration style")
    })
  })

  describe('createBiblicalSceneFromQuestion', () => {
    it('returns a Jesus scene for questions about Jesus', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion('Who is Jesus?', 'Jesus is the Son of God')

      expect(scene).toContain('Jesus')
      expect(scene).toContain('Good Shepherd')
    })

    it('returns a Moses scene for questions about Moses', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion('Tell me about Moses', 'Moses led the people')

      expect(scene).toContain('Moses')
      expect(scene).toContain('Red Sea')
    })

    it('returns a David and Goliath scene when both are mentioned', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'What happened with David and Goliath?',
        'David defeated Goliath'
      )

      expect(scene).toContain('David')
      expect(scene).toContain('Goliath')
    })

    it('returns a King David scene without Goliath for general David questions', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'Who was David?',
        'David was a king of Israel'
      )

      expect(scene).toContain('David')
      expect(scene).toContain('King')
    })

    it('returns a Noah/ark scene for flood questions', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'What happened during the flood?',
        'God sent a great flood'
      )

      expect(scene).toContain('ark')
      expect(scene).toContain('flood')
    })

    it('returns a creation scene for creation questions', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'How was creation done?',
        'God created the heavens and earth'
      )

      expect(scene).toContain('creation')
    })

    it('returns a Bethlehem scene for Bethlehem place questions', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'What is Bethlehem?',
        'Bethlehem is where Jesus was born'
      )

      expect(scene).toContain('Bethlehem')
    })

    it('returns a prayer scene for prayer concept questions', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'What is prayer?',
        'Prayer is talking to God'
      )

      expect(scene).toContain('praying')
    })

    it('returns a faith scene for faith concept questions', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'What is faith?',
        'Faith is believing in God'
      )

      expect(scene).toContain('starry Middle Eastern sky')
    })

    it('returns a default scene for unrecognized questions', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'What are some interesting facts?',
        'There are many interesting things in the Bible'
      )

      expect(scene).toContain('Biblical scene')
      expect(scene).toContain('ancient Middle Eastern setting')
    })

    it('returns a Joseph coat scene when coat is mentioned', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'Tell me about Joseph and his coat',
        'Joseph had a coat of many colors'
      )

      expect(scene).toContain('Joseph')
      expect(scene).toContain('coat of many colors')
    })

    it('returns a general Joseph scene without coat mention', () => {
      const scene = openaiService.createBiblicalSceneFromQuestion(
        'Who was Joseph?',
        'Joseph became governor of Egypt'
      )

      expect(scene).toContain('Joseph')
      expect(scene).toContain('Egyptian')
    })
  })

  describe('handleComparativeQuestions', () => {
    it('returns David scene for best king questions when answer mentions David', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the best king?',
        'king david was considered the best king'
      )

      expect(result).toContain('King David')
      expect(result).toContain('harp')
    })

    it('returns Solomon scene for greatest king when answer mentions Solomon', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the greatest king?',
        'solomon was known for his wisdom'
      )

      expect(result).toContain('Solomon')
      expect(result).toContain('wisdom')
    })

    it('returns Josiah scene for good king when answer mentions Josiah', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was a good king?',
        'josiah was a righteous king'
      )

      expect(result).toContain('Josiah')
      expect(result).toContain('Torah')
    })

    it('returns default good king scene when no specific king is mentioned', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the best king in the bible?',
        'there were several righteous kings'
      )

      expect(result).toContain('righteous king')
      expect(result).toContain('prayer')
    })

    it('returns Ahab scene for worst king when answer mentions Ahab', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the worst king?',
        'ahab was very evil'
      )

      expect(result).toContain('Ahab')
    })

    it('returns Manasseh scene for evil king when answer mentions Manasseh', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the most evil king?',
        'manasseh did much wickedness'
      )

      expect(result).toContain('Manasseh')
    })

    it('returns Jeroboam scene for bad king when answer mentions Jeroboam', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the bad king?',
        'jeroboam led people astray'
      )

      expect(result).toContain('Jeroboam')
      expect(result).toContain('golden calf')
    })

    it('returns default wicked king scene for unspecified bad king', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the wicked king?',
        'many kings turned away from God'
      )

      expect(result).toContain('turning away')
    })

    it('returns Samson scene for strongest person when answer mentions Samson', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the strongest person?',
        'samson had incredible strength'
      )

      expect(result).toContain('Samson')
    })

    it('returns Solomon scene for wisest person when answer mentions Solomon', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the wisest king?',
        'solomon was the wisest'
      )

      expect(result).toContain('Solomon')
      expect(result).toContain('wisdom')
    })

    it('returns Methuselah scene for oldest person when answer mentions Methuselah', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the oldest person in the bible?',
        'methuselah lived 969 years'
      )

      expect(result).toContain('Methuselah')
    })

    it('returns Adam and Eve scene for first person when answer mentions Adam', () => {
      const result = openaiService.handleComparativeQuestions(
        'who was the first person?',
        'adam was the first man'
      )

      expect(result).toContain('Adam and Eve')
      expect(result).toContain('Garden of Eden')
    })

    it('returns null for non-comparative questions', () => {
      const result = openaiService.handleComparativeQuestions(
        'what is the bible?',
        'the bible is the word of god'
      )

      expect(result).toBeNull()
    })
  })

  describe('createPersonScene', () => {
    it('returns a scene for known persons', () => {
      const scene = openaiService.createPersonScene('noah', 'noah', 'noah built the ark')

      expect(scene).toContain('Noah')
      expect(scene).toContain('ark')
    })

    it('returns a Daniel scene', () => {
      const scene = openaiService.createPersonScene('daniel', 'daniel', 'daniel prayed')

      expect(scene).toContain('Daniel')
      expect(scene).toContain('lions')
    })

    it('returns a fallback scene for unknown persons', () => {
      const scene = openaiService.createPersonScene('zacchaeus', 'zacchaeus', 'climbed a tree')

      expect(scene).toContain('zacchaeus')
      expect(scene).toContain('ancient Middle Eastern')
    })
  })

  describe('createEventScene', () => {
    it('returns a scene for known events', () => {
      const scene = openaiService.createEventScene('nativity', 'nativity', 'birth of jesus')

      expect(scene).toContain('nativity')
      expect(scene).toContain('Bethlehem')
    })

    it('returns a fallback scene for unknown events', () => {
      const scene = openaiService.createEventScene('the exodus march', 'exodus march', 'the people marched')

      expect(scene).toContain('the exodus march')
      expect(scene).toContain('ancient Middle Eastern')
    })
  })

  describe('createPlaceScene', () => {
    it('returns a scene for known places', () => {
      const scene = openaiService.createPlaceScene('jerusalem', 'jerusalem', 'the holy city')

      expect(scene).toContain('Jerusalem')
      expect(scene).toContain('temple')
    })

    it('returns a scene for heaven', () => {
      const scene = openaiService.createPlaceScene('heaven', 'heaven', 'where god dwells')

      expect(scene).toContain('heaven')
      expect(scene).toContain('angels')
    })

    it('returns a fallback scene for unknown places', () => {
      const scene = openaiService.createPlaceScene('nineveh', 'nineveh', 'a great city')

      expect(scene).toContain('nineveh')
      expect(scene).toContain('ancient Middle Eastern')
    })
  })

  describe('createConceptScene', () => {
    it('returns a scene for known concepts', () => {
      const scene = openaiService.createConceptScene('love', 'love', 'god is love')

      expect(scene).toContain('Jesus')
      expect(scene).toContain('children')
    })

    it('returns a scene for angels concept', () => {
      const scene = openaiService.createConceptScene('angels', 'angels', 'heavenly beings')

      expect(scene).toContain('angel')
      expect(scene).toContain('divine light')
    })

    it('returns a fallback scene for unknown concepts', () => {
      const scene = openaiService.createConceptScene('stewardship', 'stewardship', 'taking care')

      expect(scene).toContain('stewardship')
      expect(scene).toContain('ancient Middle Eastern')
    })
  })
})
