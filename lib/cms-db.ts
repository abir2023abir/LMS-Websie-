import { isFirebaseDemo } from '@/lib/utils';

const isDemoMode = isFirebaseDemo;

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
    return 'demo-hero';
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
    return 'demo-about';
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
    // No real learner stories in demo mode; the home page hides the section when this is empty.
    return [];  }

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
    return `demo-story-${Date.now()}`;
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
    return true;
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
    return true;
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

export async function getFeatures(): Promise<Feature[]> {
  if (isDemoMode()) {
    return [
      { title: 'Structured Learning Path', description: 'Know what to study next and follow the course structure.', icon: 'ShieldCheck', order: 1 },
      { title: 'Measurable Progress', description: 'Review your learning activity and assessment performance.', icon: 'Award', order: 2 },
      { title: 'Guided Support', description: 'Use available mentor, student, and programme support features.', icon: 'Banknote', order: 3 },
      { title: 'Goal-Oriented Practice', description: 'Connect course activities with the skills you want to develop.', icon: 'Users', order: 4 },
    ];
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
    return `demo-feature-${Date.now()}`;
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
    return true;
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
    return true;
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
    const { blogPosts } = await import('@/lib/blog-data');
    return blogPosts.map((post) => ({
      ...post,
      content: JSON.stringify(post.content),
      isFeatured: post.isFeatured ?? false,
    }));
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
    const { blogPosts } = await import('@/lib/blog-data');
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return null;
    return { ...post, content: JSON.stringify(post.content), isFeatured: post.isFeatured ?? false };
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
    return `demo-blog-${Date.now()}`;
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
    return true;
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
    return true;
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
    return [];
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
    return `demo-enquiry-${Date.now()}`;
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
    return true;
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
    return true;
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
