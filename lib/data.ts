export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
    title: string;
  };
  thumbnail: string;
  category: string;
  categoryColor: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  duration: string;
  lessonCount: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
}

export interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
  count: number;
}

/* ─────────────────────────────────────────────
   Navigation Links
───────────────────────────────────────────── */
export const navLinks: NavLink[] = [
  { label: 'All Capsules', href: '/courses' },
  { label: 'Spoken English', href: '/courses?category=Spoken+English' },
  { label: 'IELTS Prep', href: '/courses?category=IELTS+Prep' },
  { label: 'Business English', href: '/courses?category=Business+English' },
  { label: 'Verify Certificate', href: '/verify-certificate' },
];

/* ─────────────────────────────────────────────
   Key Metrics & Stats
───────────────────────────────────────────── */
export const stats: Stat[] = [
  { value: 500000, suffix: '+', label: 'Active English Learners', icon: 'Users' },
  { value: 1200,   suffix: '+', label: 'Video Capsules & Lessons', icon: 'BookOpen' },
  { value: 45,     suffix: '+', label: 'Certified Native Mentors', icon: 'GraduationCap' },
  { value: 98,     suffix: '%', label: 'Fluency Success Rate', icon: 'Star' },
];

/* ─────────────────────────────────────────────
   English Specialization Categories
───────────────────────────────────────────── */
export const categories: Category[] = [
  { name: 'Spoken English',    icon: '🗣️', color: 'from-amber-500 to-yellow-600',  count: 320 },
  { name: 'IELTS Prep',        icon: '🎯', color: 'from-blue-600 to-indigo-700',   count: 240 },
  { name: 'Business English',  icon: '💼', color: 'from-emerald-600 to-teal-700',  count: 180 },
  { name: 'General English',   icon: '📖', color: 'from-purple-600 to-violet-700', count: 210 },
  { name: 'Grammar & Writing', icon: '✍️', color: 'from-pink-600 to-rose-700',     count: 150 },
  { name: 'Career English',    icon: '🚀', color: 'from-orange-500 to-amber-600',  count: 110 },
  { name: 'Kids English',      icon: '🧸', color: 'from-cyan-500 to-blue-600',     count: 95  },
  { name: 'TOEFL & Exams',     icon: '📜', color: 'from-rose-600 to-red-700',      count: 85  },
];

/* ─────────────────────────────────────────────
   Curated English Capsules Catalog
───────────────────────────────────────────── */
export const featuredCourses: Course[] = [
  {
    id: '1',
    slug: 'general-english-foundation-capsule',
    title: 'General English Foundation Capsule: Zero to Confident Speaker',
    description:
      'Master essential sentence patterns, 1,000+ core active vocabulary words, practical grammar, and real-life everyday dialogue without tedious memorization.',
    instructor: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop',
      title: 'Senior English Language Specialist',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop&auto=format',
    category: 'General English',
    categoryColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    price: 39,
    originalPrice: 99,
    rating: 4.9,
    reviewCount: 14250,
    studentCount: 92400,
    duration: '24h 30m',
    lessonCount: 36,
    level: 'Beginner',
    tags: ['Vocabulary', 'Everyday English', 'Grammar', 'Confidence'],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: '2',
    slug: 'spoken-english-accent-perfection',
    title: 'Spoken English & Accent Perfection: Sound Like a Native',
    description:
      'Eliminate mother-tongue influence (MTI), master connected speech, natural sentence stress, and speak effortlessly in professional and social conversations.',
    instructor: {
      name: 'David Miller',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      title: 'Pronunciation & Voice Coach (London, UK)',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=340&fit=crop&auto=format',
    category: 'Spoken English',
    categoryColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    price: 49,
    originalPrice: 120,
    rating: 4.95,
    reviewCount: 18920,
    studentCount: 104500,
    duration: '32h 15m',
    lessonCount: 42,
    level: 'Intermediate',
    tags: ['Spoken English', 'Accent Training', 'Fluency', 'Phonetics'],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: '3',
    slug: 'business-english-corporate-communication',
    title: 'Business English & Corporate Communication Masterclass',
    description:
      'Elevate your global career. Master executive email writing, presentation delivery, high-stakes negotiations, cross-cultural diplomacy, and meeting leadership.',
    instructor: {
      name: 'Emma Watson',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop',
      title: 'Corporate Communication Executive',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=340&fit=crop&auto=format',
    category: 'Business English',
    categoryColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    price: 59,
    originalPrice: 149,
    rating: 4.88,
    reviewCount: 11200,
    studentCount: 68300,
    duration: '28h 45m',
    lessonCount: 38,
    level: 'Advanced',
    tags: ['Business English', 'Email Writing', 'Presentations', 'Leadership'],
    isFeatured: true,
    isNew: true,
    isBestseller: false,
  },
  {
    id: '4',
    slug: 'ielts-academic-general-band-8-masterclass',
    title: 'IELTS Academic & General Band 8+ Ultimate Masterclass',
    description:
      'Step-by-step strategies for Band 8+ in Listening, Reading, Task 1 & Task 2 Writing, and the Speaking interview with mock tests and evaluation templates.',
    instructor: {
      name: 'Michael Brown',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
      title: 'Former British Council IELTS Examiner',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=340&fit=crop&auto=format',
    category: 'IELTS Prep',
    categoryColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    price: 69,
    originalPrice: 179,
    rating: 4.96,
    reviewCount: 22400,
    studentCount: 125000,
    duration: '45h 00m',
    lessonCount: 54,
    level: 'Intermediate',
    tags: ['IELTS', 'Band 8+', 'Speaking Interview', 'Writing Task 2'],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: '5',
    slug: 'english-grammar-mastery-writing-mechanics',
    title: 'English Grammar Mastery & Advanced Sentence Mechanics',
    description:
      'Clear all doubts on tenses, passive voice, conditionals, prepositions, subject-verb agreement, and writing structured, sophisticated English paragraphs.',
    instructor: {
      name: 'Dr. Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop',
      title: 'Professor of Applied Linguistics',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=340&fit=crop&auto=format',
    category: 'Grammar & Writing',
    categoryColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    price: 35,
    originalPrice: 89,
    rating: 4.85,
    reviewCount: 8900,
    studentCount: 51200,
    duration: '22h 10m',
    lessonCount: 32,
    level: 'Beginner',
    tags: ['Grammar', 'Tenses', 'Writing Skills', 'Composition'],
    isFeatured: false,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '6',
    slug: 'english-job-interviews-career-success',
    title: 'English for Job Interviews & International Remote Careers',
    description:
      'Ace interviews for multinational companies and remote global roles. Learn STAR technique answers, salary negotiation scripts, and spontaneous pitch models.',
    instructor: {
      name: 'Jonathan Hayes',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop',
      title: 'Global HR Talent Advisor',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=340&fit=crop&auto=format',
    category: 'Career English',
    categoryColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    price: 45,
    originalPrice: 119,
    rating: 4.92,
    reviewCount: 9450,
    studentCount: 48900,
    duration: '18h 40m',
    lessonCount: 26,
    level: 'Intermediate',
    tags: ['Interviews', 'Career English', 'STAR Method', 'Remote Work'],
    isFeatured: true,
    isNew: true,
    isBestseller: false,
  },
  {
    id: '7',
    slug: 'kids-young-learners-english-jumpstart',
    title: 'Kids & Young Learners English: Fun Phonics & Storytelling',
    description:
      'Engaging, colorful English program for young learners (ages 6-12). Builds foundational phonics, vocabulary, listening habits, and speaking confidence through games.',
    instructor: {
      name: 'Emily Clarke',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      title: 'Early Childhood English Educator',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=340&fit=crop&auto=format',
    category: 'Kids English',
    categoryColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    price: 29,
    originalPrice: 79,
    rating: 4.94,
    reviewCount: 6320,
    studentCount: 38400,
    duration: '16h 20m',
    lessonCount: 28,
    level: 'Beginner',
    tags: ['Kids English', 'Phonics', 'Storytelling', 'Early Learning'],
    isFeatured: false,
    isNew: true,
    isBestseller: false,
  },
  {
    id: '8',
    slug: 'british-american-phonetics-accent-softening',
    title: 'British & American Phonetics: IPA & Advanced Articulation',
    description:
      'Deep dive into the International Phonetic Alphabet (IPA), glottal stops, dark /l/, rhotic vs non-rhotic vowels, and clear speech projection for public speaking.',
    instructor: {
      name: 'Christopher Lee',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop',
      title: 'Voice Actor & Phonetics Coach',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop&auto=format',
    category: 'Spoken English',
    categoryColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    price: 55,
    originalPrice: 135,
    rating: 4.9,
    reviewCount: 7800,
    studentCount: 42100,
    duration: '26h 15m',
    lessonCount: 34,
    level: 'Advanced',
    tags: ['Phonetics', 'IPA', 'Public Speaking', 'Accent Softening'],
    isFeatured: false,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '9',
    slug: 'toefl-ibt-110-comprehensive-bootcamp',
    title: 'TOEFL iBT 110+ Comprehensive Score Booster Bootcamp',
    description:
      'Score high on the TOEFL iBT exam. Intensive practice for academic lectures, integrated speaking tasks, independent writing templates, and timed reading passages.',
    instructor: {
      name: 'Sophia Martinez',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop',
      title: 'Certified TOEFL Master Trainer',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=340&fit=crop&auto=format',
    category: 'TOEFL & Exams',
    categoryColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    price: 65,
    originalPrice: 169,
    rating: 4.87,
    reviewCount: 8150,
    studentCount: 46200,
    duration: '38h 00m',
    lessonCount: 46,
    level: 'Advanced',
    tags: ['TOEFL', 'Exam Prep', 'Academic English', 'Study Abroad'],
    isFeatured: false,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '10',
    slug: 'everyday-english-conversation-idiomatic-expressions',
    title: 'Everyday English: 500+ Natural Idioms & Phrasal Verbs',
    description:
      'Stop sounding like a textbook. Learn how native speakers really communicate using everyday idioms, natural phrasal verbs, informal conversational slang, and humor.',
    instructor: {
      name: 'Alex Turner',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop',
      title: 'Conversational Fluency Mentor',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=340&fit=crop&auto=format',
    category: 'General English',
    categoryColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    price: 0,
    originalPrice: 69,
    rating: 4.95,
    reviewCount: 16500,
    studentCount: 142000,
    duration: '14h 50m',
    lessonCount: 24,
    level: 'Beginner',
    tags: ['Idioms', 'Phrasal Verbs', 'Conversational English', 'Free Capsule'],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
  },
];

/* ─────────────────────────────────────────────
   Search suggestions
───────────────────────────────────────────── */
export const searchSuggestions = [
  'Spoken English & Accent',
  'IELTS Academic Band 8+',
  'Business English Emails',
  'Grammar & Sentence Structure',
  'Job Interview English',
  'Phonics for Kids',
  'TOEFL iBT Bootcamp',
  'Everyday Idioms & Slang',
];

/* ─────────────────────────────────────────────
   Footer links
───────────────────────────────────────────── */
export const footerLinks = {
  courses: [
    { label: 'Spoken English', href: '/courses?category=Spoken+English' },
    { label: 'IELTS Band 8+', href: '/courses?category=IELTS+Prep' },
    { label: 'Business English', href: '/courses?category=Business+English' },
    { label: 'General English', href: '/courses?category=General+English' },
    { label: 'Grammar Mastery', href: '/courses?category=Grammar+%26+Writing' },
    { label: 'Kids English', href: '/courses?category=Kids+English' },
  ],
  company: [
    { label: 'About English Capsules', href: '/about' },
    { label: 'Our Learning Method', href: '/#methods' },
    { label: 'Learning Blog & Guides', href: '/blog' },
    { label: 'Student Reviews', href: '/#reviews' },
    { label: 'Verify Certificate', href: '/verify-certificate' },
  ],
  support: [
    { label: 'Student Portal', href: '/student' },
    { label: 'Contact Advisors', href: '/#contact' },
    { label: 'FAQs & Help', href: '/#why-us' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};
