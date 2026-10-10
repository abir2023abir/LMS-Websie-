export interface QuizQuestionItem {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicTag: string;
}

export interface ModuleQuiz {
  moduleId: string;
  courseId: string;
  title: string;
  moduleTitle: string;
  description: string;
  timeLimitSeconds: number; // e.g. 300s = 5 minutes
  passThreshold: number;   // 80%
  questions: QuizQuestionItem[];
}

export const moduleQuizzes: Record<string, ModuleQuiz> = {
  'mod-1': {
    moduleId: 'mod-1',
    courseId: '1',
    title: 'Module 1 Mastery Assessment: Connected Speech & Sentence Chunking',
    moduleTitle: 'Module 1: Foundations of Spoken Fluency',
    description:
      'Evaluate your comprehension of connected speech, thought grouping, and natural sentence cadence. Score 80% or higher to unlock Module 2.',
    timeLimitSeconds: 300,
    passThreshold: 80,
    questions: [
      {
        id: 1,
        question: 'What is the primary benefit of sentence "chunking" in conversational English?',
        options: [
          'It eliminates the need to study any vocabulary.',
          'It allows your brain to process speech in natural rhythmic clusters rather than translating word-by-word.',
          'It guarantees speaking without any grammatical structure.',
          'It only applies to written English emails.',
        ],
        correctIndex: 1,
        explanation:
          'Chunking groups words into meaningful rhythmic units, allowing your brain to speak smoothly without translating word-for-word from your native language.',
        topicTag: 'Sentence Cadence',
      },
      {
        id: 2,
        question: 'In connected speech, what happens when a word ending in a consonant sound is followed by a word starting with a vowel sound (e.g. "turn on")?',
        options: [
          'The speaker must pause for 2 seconds between words.',
          'The consonant sound naturally links to the following vowel sound ("tur-non").',
          'The first word is completely deleted.',
          'The pitch goes down immediately.',
        ],
        correctIndex: 1,
        explanation:
          'Consonant-to-vowel linking connects the ending consonant smoothly into the next vowel sound, creating the fluid rhythm characteristic of native speakers.',
        topicTag: 'Phoneme Linking',
      },
      {
        id: 3,
        question: 'Which of the following phrases represents a natural conversational signpost to buy thinking time without awkward silence?',
        options: [
          'Stop talking to me right now...',
          'To be completely honest, looking at that from another angle...',
          'I have no thoughts on anything...',
          'Be quiet please...',
        ],
        correctIndex: 1,
        explanation:
          '"To be completely honest, looking at that from another angle..." gives the brain 2–3 seconds to formulate a structured answer while maintaining conversational flow.',
        topicTag: 'Conversational Signposts',
      },
      {
        id: 4,
        question: 'When practicing the "Shadowing Technique", what is the learner supposed to do?',
        options: [
          'Write down 50 words in a notebook silently.',
          'Listen to a native recording and repeat the speech out loud with a split-second delay.',
          'Memorize the entire dictionary from A to Z.',
          'Only read the text without listening to audio.',
        ],
        correctIndex: 1,
        explanation:
          'Shadowing involves vocalizing along with a native audio track simultaneously to condition facial muscles and match pitch intonation contours.',
        topicTag: 'Speech Shadowing',
      },
      {
        id: 5,
        question: 'Why is content word stressing (stressing nouns, main verbs, and adjectives) essential in English?',
        options: [
          'Because English is a syllable-timed language where every syllable is identical.',
          'Because English is a stress-timed language where key informational words carry the melody and meaning of the sentence.',
          'It is only used in theatrical acting.',
          'Grammar words like "the" and "at" must always be shouted.',
        ],
        correctIndex: 1,
        explanation:
          'English is stress-timed: stressing key content words makes your message instantly intelligible to native listeners worldwide.',
        topicTag: 'Syllable Stress',
      },
    ],
  },
  'mod-2': {
    moduleId: 'mod-2',
    courseId: '1',
    title: 'Module 2 Mastery Assessment: Real-World Dialogues & Idiomatic Fluency',
    moduleTitle: 'Module 2: Real-World Situational Dialogues',
    description:
      'Test your mastery of colloquial idioms, restaurant & workplace dialogues, and spontaneous response framing.',
    timeLimitSeconds: 300,
    passThreshold: 80,
    questions: [
      {
        id: 1,
        question: 'What does the common idiom "hit the nail on the head" mean?',
        options: [
          'To physically injure yourself while doing carpentry.',
          'To state or describe a situation or truth with exact precision.',
          'To postpone an event until next year.',
          'To disagree aggressively with someone.',
        ],
        correctIndex: 1,
        explanation: '"Hit the nail on the head" means to say something that is completely accurate and exact.',
        topicTag: 'Idioms',
      },
      {
        id: 2,
        question: 'When you want to politely disagree with a colleague during a team discussion, which phrase is most professional?',
        options: [
          'You are completely wrong about everything.',
          'I see where you are coming from, however, looking at the recent customer data, there might be an alternative approach.',
          'Nobody agrees with you.',
          'I refuse to listen to this proposal.',
        ],
        correctIndex: 1,
        explanation:
          'Polite disagreement acknowledges the other person’s perspective before introducing evidence-backed alternatives.',
        topicTag: 'Business Etiquette',
      },
      {
        id: 3,
        question: 'What is the correct meaning of the phrasal verb "bring up"?',
        options: [
          'To carry an object up the stairs.',
          'To introduce a topic into a conversation.',
          'To forget a password.',
          'To cancel a flight reservation.',
        ],
        correctIndex: 1,
        explanation: '"Bring up" is commonly used to introduce an idea, question, or issue into a discussion.',
        topicTag: 'Phrasal Verbs',
      },
      {
        id: 4,
        question: 'In a corporate email, which sign-off is standard and polished for external clients?',
        options: [
          'Later!',
          'Best regards,',
          'Bye bye,',
          'See you soon dude,',
        ],
        correctIndex: 1,
        explanation: '"Best regards," is universally accepted as a professional, courteous email sign-off.',
        topicTag: 'Written Communication',
      },
      {
        id: 5,
        question: 'What does "bite the bullet" mean in casual conversation?',
        options: [
          'To face a difficult situation with courage and get it over with.',
          'To eat something dangerous.',
          'To go hunting in the forest.',
          'To celebrate a birthday party.',
        ],
        correctIndex: 0,
        explanation: '"Bite the bullet" means to endure a painful or unavoidable situation bravely.',
        topicTag: 'Idioms',
      },
    ],
  },
};

export function getQuizForModule(moduleId: string, courseId: string = '1'): ModuleQuiz {
  if (moduleQuizzes[moduleId]) {
    return moduleQuizzes[moduleId];
  }

  // Dynamic fallback quiz generator for any module ID
  return {
    moduleId,
    courseId,
    title: `Module ${moduleId} Mastery Assessment: Comprehensive English Knowledge Drill`,
    moduleTitle: `Module ${moduleId}: Advanced English Competency`,
    description: `Evaluate your mastery of key concepts and practical speaking patterns taught in this module. Score at least 80% to unlock subsequent lectures.`,
    timeLimitSeconds: 300,
    passThreshold: 80,
    questions: [
      {
        id: 1,
        question: 'What is the most effective approach to overcoming mental translation when speaking English?',
        options: [
          'Memorizing grammar tables in your native language.',
          'Daily self-narration and thinking directly in English thought chunks.',
          'Speaking only once per month.',
          'Reading silently without speaking aloud.',
        ],
        correctIndex: 1,
        explanation: 'Daily self-narration builds direct neural associations between concepts and English words.',
        topicTag: 'Fluency Reflexes',
      },
      {
        id: 2,
        question: 'When encountering an unfamiliar English idiom, how should you deduce its meaning?',
        options: [
          'Translate each word literally.',
          'Analyze the surrounding situational context and conversational tone.',
          'Ignore the conversation completely.',
          'Assume it has no meaning.',
        ],
        correctIndex: 1,
        explanation: 'Idioms are figurative expressions best deciphered through context clues.',
        topicTag: 'Contextual Comprehension',
      },
      {
        id: 3,
        question: 'Which element is crucial for achieving high marks in IELTS / TOEFL oral assessments?',
        options: [
          'Speaking with an artificial theatrical accent.',
          'Clear phoneme articulation, natural intonation, and logical discourse coherence.',
          'Using overly complex words incorrectly.',
          'Giving one-word answers to every question.',
        ],
        correctIndex: 1,
        explanation: 'Coherence, clear intonation, and lexical precision are the core scoring criteria.',
        topicTag: 'Exam Fluency',
      },
      {
        id: 4,
        question: 'What is the primary function of transitional discourse markers (e.g. "Furthermore", "On the other hand")?',
        options: [
          'To confuse the listener.',
          'To provide clear roadmaps that guide the listener between connected ideas.',
          'To replace all nouns in a sentence.',
          'They serve no function in spoken English.',
        ],
        correctIndex: 1,
        explanation: 'Discourse markers structure your arguments and clarify relationships between ideas.',
        topicTag: 'Discourse Markers',
      },
      {
        id: 5,
        question: 'How does active listening improve spontaneous speech production?',
        options: [
          'It provides subconscious models of native cadence, collocations, and rhythm.',
          'It only helps with spelling.',
          'It makes speaking unnecessary.',
          'It has no impact on speaking ability.',
        ],
        correctIndex: 0,
        explanation: 'Active listening trains your brain to absorb authentic collocations and phrasing naturally.',
        topicTag: 'Active Listening',
      },
    ],
  };
}
