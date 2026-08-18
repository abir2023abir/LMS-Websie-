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
   Navigation
───────────────────────────────────────────── */
export const navLinks: NavLink[] = [
  { label: 'Courses',  href: '/courses' },
  { label: 'Blog',     href: '/blog' },
  { label: 'Pricing',  href: '/pricing' },
  { label: 'About',    href: '/about' },
];

/* ─────────────────────────────────────────────
   Stats
───────────────────────────────────────────── */
export const stats: Stat[] = [
  { value: 500000, suffix: '+', label: 'Active Students',    icon: 'Users' },
  { value: 1200,   suffix: '+', label: 'Expert Courses',     icon: 'BookOpen' },
  { value: 350,    suffix: '+', label: 'Top Instructors',    icon: 'GraduationCap' },
  { value: 94,     suffix: '%', label: 'Satisfaction Rate',  icon: 'Star' },
];

/* ─────────────────────────────────────────────
   Categories
───────────────────────────────────────────── */
export const categories: Category[] = [
  { name: 'Web Development',   icon: '💻', color: 'from-violet-600 to-purple-700',  count: 248 },
  { name: 'Data Science',      icon: '📊', color: 'from-cyan-600 to-blue-700',      count: 183 },
  { name: 'UI/UX Design',      icon: '🎨', color: 'from-pink-600 to-rose-700',      count: 127 },
  { name: 'Digital Marketing', icon: '📱', color: 'from-orange-500 to-amber-600',   count: 95  },
  { name: 'Photography',       icon: '📷', color: 'from-emerald-500 to-teal-700',   count: 74  },
  { name: 'Business',          icon: '💼', color: 'from-yellow-500 to-orange-600',  count: 112 },
];

/* ─────────────────────────────────────────────
   Courses placeholder data
───────────────────────────────────────────── */
export const featuredCourses: Course[] = [
  {
    id: '1',
    slug: 'complete-react-developer-2024',
    title: 'Complete React Developer in 2024: Zero to Mastery',
    description:
      'Master React, Redux, Hooks, Context API, and Next.js by building real-world projects from scratch.',
    instructor: {
      name: 'Andrei Neagoie',
      avatar: 'https://ui-avatars.com/api/?name=Andrei+Neagoie&background=7c3aed&color=fff&size=100',
      title: 'Senior Software Engineer',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=340&fit=crop&auto=format',
    category: 'Web Development',
    categoryColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    price: 1299,
    originalPrice: 3499,
    rating: 4.8,
    reviewCount: 12453,
    studentCount: 84000,
    duration: '42h 30m',
    lessonCount: 312,
    level: 'Beginner',
    tags: ['React', 'Redux', 'TypeScript', 'Next.js'],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: '2',
    slug: 'python-data-science-machine-learning',
    title: 'Python for Data Science & Machine Learning Bootcamp',
    description:
      'Learn Python, Pandas, NumPy, Matplotlib, Seaborn, Machine Learning, TensorFlow, and more.',
    instructor: {
      name: 'Jose Portilla',
      avatar: 'https://ui-avatars.com/api/?name=Jose+Portilla&background=06b6d4&color=fff&size=100',
      title: 'Data Science Educator',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&auto=format',
    category: 'Data Science',
    categoryColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    price: 999,
    originalPrice: 2999,
    rating: 4.7,
    reviewCount: 9821,
    studentCount: 67500,
    duration: '38h 15m',
    lessonCount: 286,
    level: 'Intermediate',
    tags: ['Python', 'ML', 'TensorFlow', 'Pandas'],
    isFeatured: true,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '3',
    slug: 'ui-ux-design-masterclass',
    title: 'UI/UX Design Masterclass: Build Beautiful Products',
    description:
      'From wireframes to high-fidelity designs — master Figma, design systems, prototyping, and user research.',
    instructor: {
      name: 'Sarah Chen',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=ec4899&color=fff&size=100',
      title: 'Lead Product Designer',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop&auto=format',
    category: 'UI/UX Design',
    categoryColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    price: 849,
    originalPrice: 2499,
    rating: 4.9,
    reviewCount: 7634,
    studentCount: 41200,
    duration: '29h 45m',
    lessonCount: 198,
    level: 'Beginner',
    tags: ['Figma', 'UX Research', 'Prototyping'],
    isFeatured: true,
    isNew: true,
    isBestseller: false,
  },
  {
    id: '4',
    slug: 'nodejs-api-development',
    title: 'Node.js & Express: Build REST APIs from Scratch',
    description:
      'Master back-end development with Node.js, Express, MongoDB, JWT authentication, and deployment.',
    instructor: {
      name: 'Jonas Schmedtmann',
      avatar: 'https://ui-avatars.com/api/?name=Jonas+Schmedtmann&background=10b981&color=fff&size=100',
      title: 'Full-Stack Web Developer',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=340&fit=crop&auto=format',
    category: 'Web Development',
    categoryColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    price: 699,
    originalPrice: 1999,
    rating: 4.6,
    reviewCount: 5210,
    studentCount: 28900,
    duration: '33h 20m',
    lessonCount: 224,
    level: 'Intermediate',
    tags: ['Node.js', 'Express', 'MongoDB', 'REST API'],
    isFeatured: true,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '5',
    slug: 'digital-marketing-masterclass',
    title: 'Digital Marketing Masterclass: SEO, SEM & Social',
    description:
      'Complete digital marketing strategy — SEO, Google Ads, Facebook Ads, Email marketing, analytics.',
    instructor: {
      name: 'Maya Rodriguez',
      avatar: 'https://ui-avatars.com/api/?name=Maya+Rodriguez&background=f59e0b&color=fff&size=100',
      title: 'Digital Marketing Strategist',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop&auto=format',
    category: 'Digital Marketing',
    categoryColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    price: 0,
    originalPrice: 1999,
    rating: 4.5,
    reviewCount: 4380,
    studentCount: 53100,
    duration: '24h 10m',
    lessonCount: 172,
    level: 'Beginner',
    tags: ['SEO', 'Google Ads', 'Analytics'],
    isFeatured: true,
    isNew: false,
    isBestseller: false,
  },
  {
    id: '6',
    slug: 'aws-certified-solutions-architect',
    title: 'AWS Certified Solutions Architect — Associate 2024',
    description:
      'Pass the AWS SAA-C03 exam and gain hands-on cloud architecture skills with real-world labs.',
    instructor: {
      name: 'Stephane Maarek',
      avatar: 'https://ui-avatars.com/api/?name=Stephane+Maarek&background=3b82f6&color=fff&size=100',
      title: 'AWS Solutions Architect',
    },
    thumbnail:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop&auto=format',
    category: 'Cloud & DevOps',
    categoryColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    price: 1499,
    originalPrice: 3999,
    rating: 4.8,
    reviewCount: 8921,
    studentCount: 72400,
    duration: '51h 40m',
    lessonCount: 393,
    level: 'Advanced',
    tags: ['AWS', 'Cloud', 'DevOps', 'Certification'],
    isFeatured: true,
    isNew: true,
    isBestseller: true,
  },
];

/* ─────────────────────────────────────────────
   Search suggestions
───────────────────────────────────────────── */
export const searchSuggestions = [
  'React Development',
  'Python for Beginners',
  'Machine Learning',
  'UI/UX Design',
  'JavaScript ES6+',
  'AWS Cloud',
  'Digital Marketing',
  'Figma Masterclass',
];

/* ─────────────────────────────────────────────
   Footer links
───────────────────────────────────────────── */
export const footerLinks = {
  courses: [
    { label: 'Web Development',   href: '/courses/web' },
    { label: 'Data Science',      href: '/courses/data-science' },
    { label: 'UI/UX Design',      href: '/courses/design' },
    { label: 'Digital Marketing', href: '/courses/marketing' },
    { label: 'Cloud & DevOps',    href: '/courses/cloud' },
  ],
  company: [
    { label: 'About Us',    href: '/about' },
    { label: 'Careers',     href: '/careers' },
    { label: 'Blog',        href: '/blog' },
    { label: 'Press',       href: '/press' },
    { label: 'Affiliates',  href: '/affiliates' },
  ],
  support: [
    { label: 'Help Center',    href: '/help' },
    { label: 'Contact Us',     href: '/contact' },
    { label: 'Community',      href: '/community' },
    { label: 'Student Reviews',href: '/reviews' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'Cookie Policy',    href: '/cookies' },
    { label: 'Accessibility',    href: '/accessibility' },
  ],
};
