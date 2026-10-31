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
  { label: 'All Courses', href: '/courses' },
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
  { value: 1200,   suffix: '+', label: 'Video Lessons', icon: 'BookOpen' },
  { value: 45,     suffix: '+', label: 'Certified Native Mentors', icon: 'GraduationCap' },
  { value: 98,     suffix: '%', label: 'Fluency Success Rate', icon: 'Star' },
];

/* ─────────────────────────────────────────────
   Course Categories
───────────────────────────────────────────── */
export const categories: Category[] = [
  { name: 'Accounting',     icon: '📒', color: 'from-emerald-600 to-teal-700', count: 1 },
  { name: 'Business',       icon: '💼', color: 'from-blue-600 to-indigo-700',  count: 1 },
  { name: 'Digital Skills', icon: '💻', color: 'from-amber-500 to-yellow-600', count: 1 },
];

/* ─────────────────────────────────────────────
   All Courses (for courses page)
───────────────────────────────────────────── */
export const featuredCourses: Course[] = [
  {
    id: '1',
    slug: 'foundations-of-bookkeeping-accounting',
    title: 'Foundations of Bookkeeping & Accounting',
    description:
      'Learn transaction recording, ledgers, basic accounting principles, and financial statements.',
    instructor: {
      name: 'Career Bridge Team',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop',
      title: 'Finance & Accounting Expert',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop&auto=format',
    category: 'Accounting',
    categoryColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    price: 49,
    originalPrice: 99,
    rating: 0,
    reviewCount: 0,
    studentCount: 0,
    duration: '20h 00m',
    lessonCount: 30,
    level: 'Beginner',
    tags: ['Bookkeeping', 'Accounting', 'Financial Statements', 'Ledgers'],
    isFeatured: true,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '2',
    slug: 'business-finance-financial-reporting',
    title: 'Business Finance & Financial Reporting',
    description:
      'Understand income, expenses, cash flow, and financial reports for better business decisions.',
    instructor: {
      name: 'Career Bridge Team',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      title: 'Finance Expert',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop&auto=format',
    category: 'Business',
    categoryColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    price: 59,
    originalPrice: 129,
    rating: 0,
    reviewCount: 0,
    studentCount: 0,
    duration: '25h 30m',
    lessonCount: 35,
    level: 'Intermediate',
    tags: ['Business Finance', 'Financial Reporting', 'Cash Flow', 'Decision Making'],
    isFeatured: true,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '3',
    slug: 'digital-skills-career-readiness',
    title: 'Digital Skills & Career Readiness',
    description:
      'Develop practical digital skills, improve workplace readiness, and prepare for new opportunities.',
    instructor: {
      name: 'Career Bridge Team',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop',
      title: 'Digital Skills Instructor',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop&auto=format',
    category: 'Digital Skills',
    categoryColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    price: 39,
    originalPrice: 79,
    rating: 0,
    reviewCount: 0,
    studentCount: 0,
    duration: '18h 00m',
    lessonCount: 28,
    level: 'Beginner',
    tags: ['Digital Skills', 'Career Readiness', 'Workplace Skills', 'Professional Development'],
    isFeatured: true,
    isNew: true,
    isBestseller: false,
  },
];

/* ─────────────────────────────────────────────
   Homepage Featured Courses (Only the 3 specific courses from PDF)
───────────────────────────────────────────── */
export const homepageFeaturedCourses: Course[] = [
  {
    id: '1',
    slug: 'foundations-of-bookkeeping-accounting',
    title: 'Foundations of Bookkeeping & Accounting',
    description:
      'Learn transaction recording, ledgers, basic accounting principles, and financial statements.',
    instructor: {
      name: 'Career Bridge Team',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop',
      title: 'Finance & Accounting Expert',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop&auto=format',
    category: 'Accounting',
    categoryColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    price: 49,
    originalPrice: 99,
    rating: 0,
    reviewCount: 0,
    studentCount: 0,
    duration: '20h 00m',
    lessonCount: 30,
    level: 'Beginner',
    tags: ['Bookkeeping', 'Accounting', 'Financial Statements', 'Ledgers'],
    isFeatured: true,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '2',
    slug: 'business-finance-financial-reporting',
    title: 'Business Finance & Financial Reporting',
    description:
      'Understand income, expenses, cash flow, and financial reports for better business decisions.',
    instructor: {
      name: 'Career Bridge Team',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      title: 'Finance Expert',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop&auto=format',
    category: 'Business',
    categoryColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    price: 59,
    originalPrice: 129,
    rating: 0,
    reviewCount: 0,
    studentCount: 0,
    duration: '25h 30m',
    lessonCount: 35,
    level: 'Intermediate',
    tags: ['Business Finance', 'Financial Reporting', 'Cash Flow', 'Decision Making'],
    isFeatured: true,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '3',
    slug: 'digital-skills-career-readiness',
    title: 'Digital Skills & Career Readiness',
    description:
      'Develop practical digital skills, improve workplace readiness, and prepare for new opportunities.',
    instructor: {
      name: 'Career Bridge Team',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop',
      title: 'Digital Skills Instructor',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop&auto=format',
    category: 'Digital Skills',
    categoryColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    price: 39,
    originalPrice: 79,
    rating: 0,
    reviewCount: 0,
    studentCount: 0,
    duration: '18h 00m',
    lessonCount: 28,
    level: 'Beginner',
    tags: ['Digital Skills', 'Career Readiness', 'Workplace Skills', 'Professional Development'],
    isFeatured: true,
    isNew: true,
    isBestseller: false,
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
    { label: 'About Career Bridge.Studio', href: '/about' },
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

/* ─────────────────────────────────────────────
   Course overview copy (course detail page), keyed by course id.
   Courses without an entry simply hide these sections.
───────────────────────────────────────────── */
export type CourseOverview = {
  outcomes: string[];
  prerequisites: string[];
  audience: string[];
};

export const courseOverviews: Record<string, CourseOverview> = {
  '1': {
    outcomes: [
      'Record day-to-day business transactions accurately using double-entry bookkeeping',
      'Set up and maintain a chart of accounts, journals, and general ledgers',
      'Reconcile bank statements and catch common recording errors',
      'Prepare a trial balance and adjusting entries at period end',
      'Read and build a basic income statement, balance sheet, and cash flow statement',
      'Organise receipts, invoices, and records so your books are always audit-ready',
    ],
    prerequisites: [
      'No accounting background needed — we start from the basics.',
      'Basic comfort with numbers and simple arithmetic.',
      'A computer or smartphone with internet access.',
    ],
    audience: [
      'Students and fresh graduates aiming for accounts or finance roles.',
      'Small business owners who want to keep their own books.',
      'Office staff who handle payments, invoices, or petty cash.',
    ],
  },
  '2': {
    outcomes: [
      'Understand how income, expenses, and profit fit together in a business',
      'Track and forecast cash flow so you never get caught short',
      'Read an income statement, balance sheet, and cash flow statement with confidence',
      'Use key ratios to judge profitability, liquidity, and business health',
      'Build a simple budget and compare actual results against it',
      'Present financial results clearly to owners, managers, or investors',
    ],
    prerequisites: [
      'Basic bookkeeping knowledge is helpful but not required.',
      'Comfort with spreadsheets (Excel or Google Sheets) is a plus.',
      'A computer with internet access.',
    ],
    audience: [
      'Business owners and managers who make money decisions.',
      'Accounts and finance staff moving into reporting roles.',
      'Entrepreneurs preparing to pitch or apply for funding.',
    ],
  },
  '3': {
    outcomes: [
      'Work confidently with email, cloud storage, and online collaboration tools',
      'Create clean documents, spreadsheets, and presentations for the workplace',
      'Write a professional CV and build a strong LinkedIn profile',
      'Search and apply for jobs effectively, online and offline',
      'Prepare for interviews and present yourself with confidence',
      'Manage your time and tasks using simple productivity habits',
    ],
    prerequisites: [
      'No technical background needed.',
      'Basic ability to use a computer or smartphone.',
      'Willingness to practise between lessons.',
    ],
    audience: [
      'Students and fresh graduates preparing for their first job.',
      'Job seekers returning to work or changing careers.',
      'Professionals who want to sharpen everyday digital skills.',
    ],
  },
};
