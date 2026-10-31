import { isFirebaseDemo } from '@/lib/utils';
import { kvGet, kvSet } from '@/lib/kv-store';

const isDemoMode = isFirebaseDemo;

// Without Firebase, CMS content is kept with kv-store (local file, or Supabase on Vercel)
// so edits made in Admin → Landing Page CMS really save.
const localId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function localList<T extends { id?: string }>(name: string, defaults: T[]): Promise<T[]> {
  const saved = await kvGet<T[] | null>(`cms-${name}`, null);
  return saved ?? defaults.map((item, index) => ({ ...item, id: item.id || `${name}-${index + 1}` }));
}

async function localCreate<T extends { id?: string }>(name: string, defaults: T[], data: T): Promise<string> {
  const id = localId(name);
  await kvSet(`cms-${name}`, [...(await localList(name, defaults)), { ...data, id, updatedAt: new Date().toISOString() }]);
  return id;
}

async function localUpdate<T extends { id?: string }>(name: string, defaults: T[], id: string, data: Partial<T>): Promise<boolean> {
  const list = await localList(name, defaults);
  if (!list.some((item) => item.id === id)) return false;
  await kvSet(`cms-${name}`, list.map((item) => (item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item)));
  return true;
}

async function localDelete<T extends { id?: string }>(name: string, defaults: T[], id: string): Promise<boolean> {
  const list = await localList(name, defaults);
  await kvSet(`cms-${name}`, list.filter((item) => item.id !== id));
  return true;
}

async function firestore() {
  const [{ db }, fs] = await Promise.all([import('@/lib/firebase'), import('firebase/firestore')]);
  return { db, ...fs };
}

// ==================== HERO SECTION ====================
const HERO_COLLECTION = 'cms_hero';

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
  if (isDemoMode()) {
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

  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, HERO_COLLECTION), fb.limit(1));
    const querySnapshot = await fb.getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as HeroContent;
  } catch (error) {
    console.error('Error fetching hero content:', error);
    return null;
  }
}

export async function saveHeroContent(data: Omit<HeroContent, 'id' | 'updatedAt'>): Promise<string> {
  if (isDemoMode()) {
    await kvSet('cms-hero', { ...data, updatedAt: new Date().toISOString() });
    return 'local-hero';
  }

  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, HERO_COLLECTION), fb.limit(1));
    const querySnapshot = await fb.getDocs(q);

    if (querySnapshot.empty) {
      const docRef = await fb.addDoc(fb.collection(fb.db, HERO_COLLECTION), {
        ...data,
        updatedAt: fb.serverTimestamp(),
      });
      return docRef.id;
    } else {
      const docRef = querySnapshot.docs[0].ref;
      await fb.updateDoc(docRef, {
        ...data,
        updatedAt: fb.serverTimestamp(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving hero content:', error);
    throw error;
  }
}

// ==================== ABOUT SECTION ====================
const ABOUT_COLLECTION = 'cms_about';

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
  if (isDemoMode()) {
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

  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, ABOUT_COLLECTION), fb.limit(1));
    const querySnapshot = await fb.getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as AboutContent;
  } catch (error) {
    console.error('Error fetching about content:', error);
    return null;
  }
}

export async function saveAboutContent(data: Omit<AboutContent, 'id' | 'updatedAt'>): Promise<string> {
  if (isDemoMode()) {
    await kvSet('cms-about', { ...data, updatedAt: new Date().toISOString() });
    return 'local-about';
  }

  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, ABOUT_COLLECTION), fb.limit(1));
    const querySnapshot = await fb.getDocs(q);

    if (querySnapshot.empty) {
      const docRef = await fb.addDoc(fb.collection(fb.db, ABOUT_COLLECTION), {
        ...data,
        updatedAt: fb.serverTimestamp(),
      });
      return docRef.id;
    } else {
      const docRef = querySnapshot.docs[0].ref;
      await fb.updateDoc(docRef, {
        ...data,
        updatedAt: fb.serverTimestamp(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving about content:', error);
    throw error;
  }
}

// ==================== SUCCESS STORIES ====================
const STORIES_COLLECTION = 'cms_success_stories';

export type SuccessStory = {
  id?: string;
  headline: string;
  description: string;
  caption: string;
  order: number;
  updatedAt?: any;
};

export async function getSuccessStories(): Promise<SuccessStory[]> {
  if (isDemoMode()) {
    return (await localList<SuccessStory>('success-stories', [])).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, STORIES_COLLECTION), fb.orderBy('order', 'asc'));
    const querySnapshot = await fb.getDocs(q);

    const stories: SuccessStory[] = [];
    querySnapshot.forEach((docSnap) => {
      stories.push({ id: docSnap.id, ...docSnap.data() } as SuccessStory);
    });

    return stories;
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return [];
  }
}

export async function createSuccessStory(data: Omit<SuccessStory, 'id' | 'updatedAt'>): Promise<string> {
  if (isDemoMode()) {
    return localCreate<SuccessStory>('success-stories', [], data);
  }

  try {
    const fb = await firestore();
    const docRef = await fb.addDoc(fb.collection(fb.db, STORIES_COLLECTION), {
      ...data,
      updatedAt: fb.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating success story:', error);
    throw error;
  }
}

export async function updateSuccessStory(id: string, data: Partial<Omit<SuccessStory, 'id' | 'updatedAt'>>): Promise<boolean> {
  if (isDemoMode()) {
    return localUpdate<SuccessStory>('success-stories', [], id, data);
  }

  try {
    const fb = await firestore();
    await fb.updateDoc(fb.doc(fb.db, STORIES_COLLECTION, id), {
      ...data,
      updatedAt: fb.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating success story:', error);
    return false;
  }
}

export async function deleteSuccessStory(id: string): Promise<boolean> {
  if (isDemoMode()) {
    return localDelete<SuccessStory>('success-stories', [], id);
  }

  try {
    const fb = await firestore();
    await fb.deleteDoc(fb.doc(fb.db, STORIES_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting success story:', error);
    return false;
  }
}

// ==================== WHY CHOOSE US ====================
const FEATURES_COLLECTION = 'cms_features';

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
  if (isDemoMode()) {
    return (await localList<Feature>('features', DEFAULT_FEATURES)).sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, FEATURES_COLLECTION), fb.orderBy('order', 'asc'));
    const querySnapshot = await fb.getDocs(q);

    const features: Feature[] = [];
    querySnapshot.forEach((docSnap) => {
      features.push({ id: docSnap.id, ...docSnap.data() } as Feature);
    });

    return features;
  } catch (error) {
    console.error('Error fetching features:', error);
    return [];
  }
}

export async function createFeature(data: Omit<Feature, 'id' | 'updatedAt'>): Promise<string> {
  if (isDemoMode()) {
    return localCreate<Feature>('features', DEFAULT_FEATURES, data);
  }

  try {
    const fb = await firestore();
    const docRef = await fb.addDoc(fb.collection(fb.db, FEATURES_COLLECTION), {
      ...data,
      updatedAt: fb.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating feature:', error);
    throw error;
  }
}

export async function updateFeature(id: string, data: Partial<Omit<Feature, 'id' | 'updatedAt'>>): Promise<boolean> {
  if (isDemoMode()) {
    return localUpdate<Feature>('features', DEFAULT_FEATURES, id, data);
  }

  try {
    const fb = await firestore();
    await fb.updateDoc(fb.doc(fb.db, FEATURES_COLLECTION, id), {
      ...data,
      updatedAt: fb.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating feature:', error);
    return false;
  }
}

export async function deleteFeature(id: string): Promise<boolean> {
  if (isDemoMode()) {
    return localDelete<Feature>('features', DEFAULT_FEATURES, id);
  }

  try {
    const fb = await firestore();
    await fb.deleteDoc(fb.doc(fb.db, FEATURES_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting feature:', error);
    return false;
  }
}

// ==================== BLOG ARTICLES ====================
const BLOG_COLLECTION = 'cms_blog';

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
  if (isDemoMode()) {
    return localList<BlogArticle>('blog', []);
  }

  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, BLOG_COLLECTION), fb.orderBy('publishedAt', 'desc'));
    const querySnapshot = await fb.getDocs(q);

    const articles: BlogArticle[] = [];
    querySnapshot.forEach((docSnap) => {
      articles.push({ id: docSnap.id, ...docSnap.data() } as BlogArticle);
    });

    return articles;
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    return [];
  }
}

export async function getBlogArticleBySlug(slug: string): Promise<BlogArticle | null> {
  if (isDemoMode()) {
    return (await localList<BlogArticle>('blog', [])).find((post) => post.slug === slug) || null;
  }

  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, BLOG_COLLECTION), fb.where('slug', '==', slug), fb.limit(1));
    const querySnapshot = await fb.getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as BlogArticle;
  } catch (error) {
    console.error('Error fetching blog article:', error);
    return null;
  }
}

export async function createBlogArticle(data: Omit<BlogArticle, 'id' | 'updatedAt'>): Promise<string> {
  if (isDemoMode()) {
    return localCreate<BlogArticle>('blog', [], data);
  }

  try {
    const fb = await firestore();
    const docRef = await fb.addDoc(fb.collection(fb.db, BLOG_COLLECTION), {
      ...data,
      updatedAt: fb.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog article:', error);
    throw error;
  }
}

export async function updateBlogArticle(id: string, data: Partial<Omit<BlogArticle, 'id' | 'updatedAt'>>): Promise<boolean> {
  if (isDemoMode()) {
    return localUpdate<BlogArticle>('blog', [], id, data);
  }

  try {
    const fb = await firestore();
    await fb.updateDoc(fb.doc(fb.db, BLOG_COLLECTION, id), {
      ...data,
      updatedAt: fb.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating blog article:', error);
    return false;
  }
}

export async function deleteBlogArticle(id: string): Promise<boolean> {
  if (isDemoMode()) {
    return localDelete<BlogArticle>('blog', [], id);
  }

  try {
    const fb = await firestore();
    await fb.deleteDoc(fb.doc(fb.db, BLOG_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting blog article:', error);
    return false;
  }
}

// ==================== CONTACT ENQUIRIES ====================
const ENQUIRIES_COLLECTION = 'cms_enquiries';

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
  if (isDemoMode()) {
    return (await localList<ContactEnquiry>('enquiries', [])).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }

  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, ENQUIRIES_COLLECTION), fb.orderBy('createdAt', 'desc'));
    const querySnapshot = await fb.getDocs(q);

    const enquiries: ContactEnquiry[] = [];
    querySnapshot.forEach((docSnap) => {
      enquiries.push({ id: docSnap.id, ...docSnap.data() } as ContactEnquiry);
    });

    return enquiries;
  } catch (error) {
    console.error('Error fetching contact enquiries:', error);
    return [];
  }
}

export async function createContactEnquiry(data: Omit<ContactEnquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (isDemoMode()) {
    return localCreate<ContactEnquiry>('enquiries', [], { ...data, createdAt: new Date().toISOString() } as ContactEnquiry);
  }

  try {
    const fb = await firestore();
    const docRef = await fb.addDoc(fb.collection(fb.db, ENQUIRIES_COLLECTION), {
      ...data,
      createdAt: fb.serverTimestamp(),
      updatedAt: fb.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating contact enquiry:', error);
    throw error;
  }
}

export async function updateEnquiryStatus(id: string, status: ContactEnquiry['status']): Promise<boolean> {
  if (isDemoMode()) {
    return localUpdate<ContactEnquiry>('enquiries', [], id, { status });
  }

  try {
    const fb = await firestore();
    await fb.updateDoc(fb.doc(fb.db, ENQUIRIES_COLLECTION, id), {
      status,
      updatedAt: fb.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    return false;
  }
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  if (isDemoMode()) {
    return localDelete<ContactEnquiry>('enquiries', [], id);
  }

  try {
    const fb = await firestore();
    await fb.deleteDoc(fb.doc(fb.db, ENQUIRIES_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return false;
  }
}
