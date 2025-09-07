import axios from 'axios'

const OPENAI_API_URL = 'https://api.openai.com/v1'
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const openaiClient = axios.create({
  baseURL: OPENAI_API_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
})

// Response interceptor for handling errors
openaiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error?.message || 
                        error.message || 
                        'An unexpected error occurred'
    
    return Promise.reject(new Error(errorMessage))
  }
)

export const openaiService = {
  /**
   * Generate a kid-friendly biblical image based on the question and answer
   * @param {string} question - The original question
   * @param {string} answer - The biblical answer
   * @returns {Promise<string>} - URL of the generated image
   */
  async generateKidsImage(question, answer) {
    if (!API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      // Create a kid-friendly prompt based on the question and answer
      const imagePrompt = this.createKidsImagePrompt(question, answer)
      
      const response = await openaiClient.post('/images/generations', {
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      })
      
      return response.data.data[0].url
    } catch (error) {
      console.error('Failed to generate image:', error)
      throw error
    }
  },

  /**
   * Create a kid-friendly image prompt based on the question and biblical context
   * @param {string} question - The original question
   * @param {string} answer - The biblical answer
   * @returns {string} - Optimized prompt for DALL-E
   */
  createKidsImagePrompt(question, answer) {
    // Create a dynamic prompt based on the child's question
    const basePrompt = this.createBiblicalSceneFromQuestion(question, answer)
    
    // Add consistent style guidelines for all images
    const styleGuidelines = ', bright and cheerful colors, safe and comforting for children, no scary or dark elements, cartoon-like but reverent and biblically accurate, ancient Middle Eastern biblical setting, suitable for ages 3-12, children\'s Bible illustration style'
    
    return basePrompt + styleGuidelines
  },

  /**
   * Create a biblical scene description based on the child's question
   * @param {string} question - The child's question
   * @param {string} answer - The biblical answer
   * @returns {string} - Biblical scene description
   */
  createBiblicalSceneFromQuestion(question, answer) {
    const questionLower = question.toLowerCase()
    const answerLower = answer.toLowerCase()
    
    // Handle comparative and evaluative questions first
    const comparativeResult = this.handleComparativeQuestions(questionLower, answerLower)
    if (comparativeResult) {
      return comparativeResult
    }
    
    // Clean the question to focus on the main biblical subject
    const cleanedQuestion = question
      .replace(/^(who is|who was|what is|what was|tell me about|what about|how|why|when|where)/i, '')
      .replace(/\?/g, '')
      .trim()
    
    // Determine if this is about a person, place, event, or concept
    let sceneType = 'general'
    let mainSubject = cleanedQuestion
    
    // Check for biblical persons
    const biblicalPersons = [
      'jesus', 'christ', 'moses', 'david', 'solomon', 'abraham', 'noah', 'jonah', 'daniel', 
      'joseph', 'mary', 'adam', 'eve', 'elijah', 'elisha', 'samuel', 'saul', 'joshua', 
      'gideon', 'samson', 'esther', 'ruth', 'jacob', 'isaac', 'sarah', 'rachel', 'leah',
      'cain', 'abel', 'rebekah', 'esau', 'pharaoh', 'goliath', 'shadrach', 'meshach', 'abednego'
    ]
    
    // Check for biblical events/stories
    const biblicalEvents = [
      'flood', 'ark', 'exodus', 'creation', 'nativity', 'crucifixion', 'resurrection', 
      'easter', 'christmas', 'passover', 'red sea', 'ten commandments', 'burning bush',
      'lions den', 'fiery furnace', 'walls of jericho', 'david and goliath'
    ]
    
    // Check for biblical places
    const biblicalPlaces = [
      'bethlehem', 'jerusalem', 'egypt', 'promised land', 'garden of eden', 'heaven',
      'temple', 'synagogue', 'galilee', 'jordan river', 'mount sinai', 'calvary', 'golgotha'
    ]
    
    // Check for biblical concepts
    const biblicalConcepts = [
      'prayer', 'faith', 'love', 'forgiveness', 'salvation', 'baptism', 'communion',
      'angels', 'miracles', 'parables', 'disciples', 'apostles', 'prophets'
    ]
    
    // Determine the main subject and create appropriate scene
    for (const person of biblicalPersons) {
      if (questionLower.includes(person)) {
        return this.createPersonScene(person, questionLower, answerLower)
      }
    }
    
    for (const event of biblicalEvents) {
      if (questionLower.includes(event)) {
        return this.createEventScene(event, questionLower, answerLower)
      }
    }
    
    for (const place of biblicalPlaces) {
      if (questionLower.includes(place)) {
        return this.createPlaceScene(place, questionLower, answerLower)
      }
    }
    
    for (const concept of biblicalConcepts) {
      if (questionLower.includes(concept)) {
        return this.createConceptScene(concept, questionLower, answerLower)
      }
    }
    
    // Default: Create a general biblical scene based on the question
    return `Biblical scene illustrating "${cleanedQuestion}" in ancient Middle Eastern setting with people in traditional biblical robes and clothing, authentic biblical landscape with olive trees and stone architecture`
  },

  /**
   * Handle comparative and evaluative questions about biblical figures
   * @param {string} questionLower - Lowercase question
   * @param {string} answerLower - Lowercase answer
   * @returns {string|null} - Scene description or null if not applicable
   */
  handleComparativeQuestions(questionLower, answerLower) {
    // Best/Greatest King questions
    if ((questionLower.includes('best') || questionLower.includes('greatest') || questionLower.includes('good')) && questionLower.includes('king')) {
      if (answerLower.includes('david')) {
        return 'Biblical King David in royal purple and gold robes with golden crown, playing golden harp in ancient Jerusalem palace, showing his devotion to God, ancient Middle Eastern royal architecture with stone columns'
      }
      if (answerLower.includes('solomon')) {
        return 'Biblical King Solomon in magnificent royal robes sitting on golden throne in the Temple of Jerusalem, demonstrating wisdom and judgment, ancient Middle Eastern palace with golden decorations'
      }
      if (answerLower.includes('josiah')) {
        return 'Biblical King Josiah in royal Hebrew robes reading from Torah scroll in ancient Jerusalem temple, showing righteousness and devotion to God, ancient Middle Eastern religious setting'
      }
      // Default good king scene
      return 'Biblical righteous king in royal robes kneeling in prayer before altar in ancient Jerusalem temple, showing devotion to God, ancient Middle Eastern religious architecture'
    }
    
    // Worst/Evil King questions
    if ((questionLower.includes('worst') || questionLower.includes('evil') || questionLower.includes('bad') || questionLower.includes('wicked')) && questionLower.includes('king')) {
      if (answerLower.includes('ahab')) {
        return 'Biblical King Ahab in dark royal robes with crown, standing in ancient palace with idols and false gods, ancient Middle Eastern setting showing his wickedness through dark atmosphere'
      }
      if (answerLower.includes('manasseh')) {
        return 'Biblical King Manasseh in royal robes surrounded by pagan idols and altars in ancient Jerusalem, showing his turn away from God, ancient Middle Eastern palace with false worship'
      }
      if (answerLower.includes('jeroboam')) {
        return 'Biblical King Jeroboam in royal robes setting up golden calf idol, leading people away from true worship, ancient Middle Eastern setting with false altar'
      }
      // Default wicked king scene (but still appropriate for kids)
      return 'Biblical king in dark royal robes turning away from temple toward pagan idols, ancient Middle Eastern palace showing the contrast between true and false worship'
    }
    
    // Strongest person questions
    if ((questionLower.includes('strong') || questionLower.includes('powerful')) && (questionLower.includes('person') || questionLower.includes('man'))) {
      if (answerLower.includes('samson')) {
        return 'Biblical Samson with long hair in ancient Hebrew clothing, pushing down massive stone pillars of Philistine temple, showing his God-given strength, ancient Middle Eastern architecture'
      }
    }
    
    // Wisest person questions
    if (questionLower.includes('wise') && (questionLower.includes('person') || questionLower.includes('man') || questionLower.includes('king'))) {
      if (answerLower.includes('solomon')) {
        return 'Biblical King Solomon in royal robes judging between two women claiming the same baby, showing his famous wisdom, ancient Middle Eastern throne room with onlookers'
      }
    }
    
    // Oldest person questions
    if (questionLower.includes('old') && (questionLower.includes('person') || questionLower.includes('man'))) {
      if (answerLower.includes('methuselah')) {
        return 'Biblical Methuselah as very elderly man with long white beard in ancient Hebrew robes, surrounded by many generations of family, ancient Middle Eastern setting showing longevity'
      }
    }
    
    // First/earliest questions
    if (questionLower.includes('first') && (questionLower.includes('person') || questionLower.includes('man') || questionLower.includes('woman'))) {
      if (answerLower.includes('adam') || answerLower.includes('eve')) {
        return 'Biblical Adam and Eve in simple robes in the Garden of Eden, surrounded by peaceful animals and lush vegetation, Tree of Life in background, ancient paradise setting'
      }
    }
    
    return null
  },
  /**
   * Create scene for biblical persons
   */
  createPersonScene(person, questionLower, answerLower) {
    const personScenes = {
      'jesus': 'Biblical Jesus in white and blue robes as Good Shepherd with wooden staff, surrounded by children and sheep in ancient Galilee landscape with olive trees and Sea of Galilee',
      'christ': 'Biblical Jesus Christ in traditional white robes teaching people in ancient Middle Eastern clothing, biblical landscape with stone buildings and olive trees',
      'moses': 'Biblical Moses in ancient Hebrew robes holding wooden staff, parting the Red Sea with walls of water, Israelites crossing on dry ground, ancient Egypt setting',
      'david': questionLower.includes('goliath') ? 
        'Young biblical shepherd David in ancient Hebrew tunic with leather sling facing giant warrior Goliath in bronze armor, biblical battlefield with ancient armies' :
        'Biblical King David in royal robes with golden crown and harp, ancient Jerusalem palace, playing music',
      'solomon': 'Biblical King Solomon in royal purple and gold robes sitting on golden throne in magnificent ancient Jerusalem temple, crown on head, showing wisdom',
      'noah': 'Biblical Noah in ancient robes with his wooden ark, pairs of animals (lions, elephants, giraffes, doves) boarding, Mount Ararat with rainbow covenant in sky',
      'abraham': 'Biblical patriarch Abraham in ancient Hebrew robes looking at starry night sky, ancient Middle Eastern tent in desert landscape',
      'joseph': questionLower.includes('coat') ?
        'Biblical Joseph wearing his beautiful coat of many colors (red, blue, gold, purple), ancient Hebrew setting with tents and sheep' :
        'Biblical Joseph as governor in ancient Egyptian palace with Pharaoh, interpreting dreams',
      'daniel': 'Biblical Daniel in ancient Hebrew robes praying peacefully in stone lions den with calm lions, ancient Babylonian architecture, divine light from above',
      'jonah': 'Biblical prophet Jonah being swallowed by great fish in Mediterranean Sea, ancient ship in background, biblical seascape',
      'mary': 'Biblical Mary in blue robes holding baby Jesus, halo of light, ancient Middle Eastern stable setting with gentle expression',
      'adam': 'Biblical Adam and Eve in Garden of Eden wearing simple robes, surrounded by peaceful animals, Tree of Life, ancient paradise setting',
      'eve': 'Biblical Adam and Eve in pristine Garden of Eden with Tree of Knowledge, biblical animals in paradise, ancient garden setting'
    }
    
    return personScenes[person] || `Biblical ${person} in ancient Middle Eastern setting with traditional biblical clothing and authentic historical context`
  },

  /**
   * Create scene for biblical events
   */
  createEventScene(event, questionLower, answerLower) {
    const eventScenes = {
      'flood': 'Noah\'s ark floating on biblical flood waters, dove with olive branch returning, Mount Ararat in background, ancient Middle Eastern biblical scene',
      'ark': 'Large wooden biblical ark with Noah and his family, animals entering two by two, ancient biblical landscape with olive trees, rainbow in cloudy sky',
      'creation': 'Biblical creation scene with God creating world, animals, plants, sun, moon and stars, ancient cosmic biblical setting with divine light',
      'nativity': 'Biblical nativity scene in Bethlehem stable, baby Jesus in wooden manger, Mary in blue robes, Joseph in brown robes, shepherds and wise men, star of Bethlehem',
      'crucifixion': 'Three wooden crosses on biblical Golgotha hill, ancient Jerusalem landscape, dramatic biblical sky with divine light',
      'resurrection': 'Biblical Jesus in glowing white robes rising from stone tomb, angels in white, ancient Jerusalem setting with divine light',
      'easter': 'Empty biblical tomb with large stone rolled away, bright divine light shining out, ancient Jerusalem setting, angels in white robes',
      'red sea': 'Biblical Moses parting the Red Sea with walls of water, Israelites in biblical clothing crossing on dry ground, ancient Egypt setting',
      'lions den': 'Biblical Daniel in ancient Hebrew robes surrounded by peaceful lions in stone den, ancient Babylonian setting with divine protection',
      'fiery furnace': 'Biblical three Hebrew men in ancient robes standing unharmed in blazing furnace with angel, ancient Babylonian setting'
    }
    
    return eventScenes[event] || `Biblical scene of ${event} in ancient Middle Eastern setting with people in traditional biblical clothing`
  },

  /**
   * Create scene for biblical places
   */
  createPlaceScene(place, questionLower, answerLower) {
    const placeScenes = {
      'bethlehem': 'Biblical town of Bethlehem with stable, ancient Middle Eastern architecture, star shining overhead, people in biblical robes',
      'jerusalem': 'Ancient biblical Jerusalem with temple, stone walls, people in biblical clothing, olive trees, ancient Middle Eastern architecture',
      'temple': 'Magnificent biblical Temple of Solomon in ancient Jerusalem, golden decorations, priests in white robes, ancient Middle Eastern architecture',
      'heaven': 'Biblical heaven with golden divine light, angels in white robes with wings, pearly gates, peaceful heavenly atmosphere',
      'garden of eden': 'Biblical Garden of Eden with Tree of Life, flowing rivers, peaceful animals (lions lying with lambs), lush ancient paradise'
    }
    
    return placeScenes[place] || `Biblical location of ${place} in ancient Middle Eastern setting with authentic biblical architecture and people in traditional robes`
  },

  /**
   * Create scene for biblical concepts
   */
  createConceptScene(concept, questionLower, answerLower) {
    const conceptScenes = {
      'prayer': 'Biblical family in ancient Hebrew robes praying together around table with bread and wine, ancient Middle Eastern home with warm oil lamp light',
      'faith': 'Biblical child in ancient robes looking up at starry Middle Eastern sky with wonder, ancient biblical landscape',
      'love': 'Biblical Jesus in white robes with children of different ethnicities in ancient clothing gathered around, biblical Galilee landscape',
      'forgiveness': 'Biblical scene of people in ancient Middle Eastern clothing embracing and making peace, ancient biblical village setting',
      'angels': 'Biblical guardian angel in white robes with golden wings watching over child, ancient Middle Eastern setting with divine light',
      'miracles': 'Biblical Jesus in white robes performing miracle, people in ancient Middle Eastern clothing amazed, biblical landscape with divine light'
    }
    
    return conceptScenes[concept] || `Biblical illustration of ${concept} with people in ancient Middle Eastern clothing in authentic biblical setting`
  }
}

export default openaiService