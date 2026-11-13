import { kvGet, kvSet } from '@/lib/kv-store';

// CMS content is kept with kv-store (Supabase app_kv on Vercel, a local file in development).
const localId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const CMS_TTL = 60_000;
const cmsCache = new Map<string, { at: number; value: unknown }>();

async function localList<T extends { id?: string }>(name: string, defaults: T[]): Promise<T[]> {
  const hit = cmsCache.get(name);
  if (hit && Date.now() - hit.at < CMS_TTL) return hit.value as T[];
  const saved = await kvGet<T[] | null>(`cms-${name}`, null);
  const value = saved ?? defaults.map((item, index) => ({ ...item, id: item.id || `${name}-${index + 1}` }));
  cmsCache.set(name, { at: Date.now(), value });
  return value;
}

async function localCreate<T extends { id?: string }>(name: string, defaults: T[], data: T): Promise<string> {
  cmsCache.delete(name);
  const id = localId(name);
  await kvSet(`cms-${name}`, [...(await localList(name, defaults)), { ...data, id, updatedAt: new Date().toISOString() }]);
  return id;
}

async function localUpdate<T extends { id?: string }>(name: string, defaults: T[], id: string, data: Partial<T>): Promise<boolean> {
  cmsCache.delete(name);
  const list = await localList(name, defaults);
  if (!list.some((item) => item.id === id)) return false;
  await kvSet(`cms-${name}`, list.map((item) => (item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item)));
  return true;
}

async function localDelete<T extends { id?: string }>(name: string, defaults: T[], id: string): Promise<boolean> {
  cmsCache.delete(name);
  const list = await localList(name, defaults);
  await kvSet(`cms-${name}`, list.filter((item) => item.id !== id));
  return true;
}

// ==================== HERO SECTION ====================

export type HeroContent = {
  id?: string;
  headline: string;
  description: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
  cta2Link: string;
  imageUrl: string;
  badgeText: string;
  updatedAt?: any;
};

export async function getHeroContent(): Promise<HeroContent | null> {
  const saved = await kvGet<HeroContent | null>('cms-hero', null);
  if (saved) return saved;
  return {
    headline: 'Build Your Skills. Bridge the Gap to Your Future.',
    description: 'Learn practical skills, follow structured lessons, and turn your knowledge into real-world progress. Career Bridge.Studio brings courses, assessments, and learning progress together in one place.',
    cta1Text: 'Explore Courses',
    cta1Link: '#courses',
    cta2Text: 'Bookkeeping',
    cta2Link: '/bookkeeping',
    imageUrl: '/images/student.png',
    badgeText: 'Start Learning',
  };
}

export async function saveHeroContent(data: Omit<HeroContent, 'id' | 'updatedAt'>): Promise<string> {
  const imageUrl = String(data.imageUrl || '').trim();
  const picture = imageUrl.startsWith('data:image/')
    ? (imageUrl.length <= 450000 ? imageUrl : '/images/student.png')
    : (imageUrl.startsWith('/') || imageUrl.startsWith('https://') ? imageUrl : '/images/student.png');
  await kvSet('cms-hero', { ...data, imageUrl: picture, cta2Link: '/bookkeeping', updatedAt: new Date().toISOString() });
  return 'local-hero';
}

// ==================== ABOUT SECTION ====================

export type AboutContent = {
  id?: string;
  title: string;
  description: string;
  statCards: Array<{
    value: string;
    lead: string;
    detail: string;
    illustration: string;
    highlighted: boolean;
  }>;
  updatedAt?: any;
};

export async function getAboutContent(): Promise<AboutContent | null> {
  const saved = await kvGet<AboutContent | null>('cms-about', null);
  if (saved) return saved;
  return {
    title: 'A Better Learning Journey, Built Around Your Goals',
    description: 'Career Bridge.Studio helps learners develop knowledge, strengthen practical skills, and follow a structured path toward personal and professional growth. Learn through organised lessons, practise your skills, and track your progress as you move forward.',
    statCards: [
      { value: '01', lead: 'Structured', detail: 'Learning Programmes', illustration: 'learning', highlighted: false },
      { value: '02', lead: 'Practical', detail: 'Lessons & Activities', illustration: 'practice', highlighted: false },
      { value: '03', lead: 'Trackable', detail: 'Learning Progress', illustration: 'progress', highlighted: false },
      { value: '04', lead: 'Goal-Focused', detail: 'Skill Development', illustration: 'goals', highlighted: true },
    ],
  };
}

export async function saveAboutContent(data: Omit<AboutContent, 'id' | 'updatedAt'>): Promise<string> {
  await kvSet('cms-about', { ...data, updatedAt: new Date().toISOString() });
  return 'local-about';
}

// ==================== SUCCESS STORIES ====================

export type SuccessStory = {
  id?: string;
  headline: string;
  description: string;
  caption: string;
  order: number;
  updatedAt?: any;
};

export async function getSuccessStories(): Promise<SuccessStory[]> {
  return (await localList<SuccessStory>('success-stories', [])).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function createSuccessStory(data: Omit<SuccessStory, 'id' | 'updatedAt'>): Promise<string> {
  return localCreate<SuccessStory>('success-stories', [], data);
}

export async function updateSuccessStory(id: string, data: Partial<Omit<SuccessStory, 'id' | 'updatedAt'>>): Promise<boolean> {
  return localUpdate<SuccessStory>('success-stories', [], id, data);
}

export async function deleteSuccessStory(id: string): Promise<boolean> {
  return localDelete<SuccessStory>('success-stories', [], id);
}

// ==================== WHY CHOOSE US ====================

export type Feature = {
  id?: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  updatedAt?: any;
};

const DEFAULT_FEATURES: Feature[] = [
  { title: 'Structured Learning Path', description: 'Know what to study next and follow the course structure.', icon: 'ShieldCheck', order: 1 },
  { title: 'Measurable Progress', description: 'Review your learning activity and assessment performance.', icon: 'Award', order: 2 },
  { title: 'Guided Support', description: 'Use available mentor, student, and programme support features.', icon: 'Banknote', order: 3 },
  { title: 'Goal-Oriented Practice', description: 'Connect course activities with the skills you want to develop.', icon: 'Users', order: 4 },
];

export async function getFeatures(): Promise<Feature[]> {
  return (await localList<Feature>('features', DEFAULT_FEATURES)).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function createFeature(data: Omit<Feature, 'id' | 'updatedAt'>): Promise<string> {
  return localCreate<Feature>('features', DEFAULT_FEATURES, data);
}

export async function updateFeature(id: string, data: Partial<Omit<Feature, 'id' | 'updatedAt'>>): Promise<boolean> {
  return localUpdate<Feature>('features', DEFAULT_FEATURES, id, data);
}

export async function deleteFeature(id: string): Promise<boolean> {
  return localDelete<Feature>('features', DEFAULT_FEATURES, id);
}

// ==================== BLOG ARTICLES ====================

export type BlogArticle = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
  readTime: string;
  isFeatured: boolean;
  publishedAt: string;
  updatedAt?: any;
};

export async function getBlogArticles(): Promise<BlogArticle[]> {
  return localList<BlogArticle>('blog', []);
}

export async function getBlogArticleBySlug(slug: string): Promise<BlogArticle | null> {
  return (await localList<BlogArticle>('blog', [])).find((post) => post.slug === slug) || null;
}

export async function createBlogArticle(data: Omit<BlogArticle, 'id' | 'updatedAt'>): Promise<string> {
  return localCreate<BlogArticle>('blog', [], data);
}

export async function updateBlogArticle(id: string, data: Partial<Omit<BlogArticle, 'id' | 'updatedAt'>>): Promise<boolean> {
  return localUpdate<BlogArticle>('blog', [], id, data);
}

export async function deleteBlogArticle(id: string): Promise<boolean> {
  return localDelete<BlogArticle>('blog', [], id);
}

// ==================== CONTACT ENQUIRIES ====================

export type ContactEnquiry = {
  id?: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'responded' | 'archived';
  createdAt?: any;
  updatedAt?: any;
};

export async function getContactEnquiries(): Promise<ContactEnquiry[]> {
  return (await localList<ContactEnquiry>('enquiries', [])).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

export async function createContactEnquiry(data: Omit<ContactEnquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  return localCreate<ContactEnquiry>('enquiries', [], { ...data, createdAt: new Date().toISOString() } as ContactEnquiry);
}

export async function updateEnquiryStatus(id: string, status: ContactEnquiry['status']): Promise<boolean> {
  return localUpdate<ContactEnquiry>('enquiries', [], id, { status });
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  return localDelete<ContactEnquiry>('enquiries', [], id);
}
