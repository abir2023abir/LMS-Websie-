import { supabase, supabaseAdmin } from './supabase';

// ============================================
// HERO CONTENT
// ============================================
export async function getHeroContent() {
  const { data, error } = await supabase
    .from('landing_hero')
    .select('*')
    .eq('id', 'hero-1')
    .single();

  if (error) {
    console.error('Error fetching hero content:', error);
    return null;
  }
  return data;
}

export async function updateHeroContent(data: {
  headline?: string;
  description?: string;
  primary_cta_text?: string;
  primary_cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  background_image_url?: string;
  background_video_url?: string;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_hero')
    .update(data)
    .eq('id', 'hero-1')
    .select()
    .single();

  if (error) {
    console.error('Error updating hero content:', error);
    throw error;
  }
  return result;
}

// ============================================
// STAT METRICS
// ============================================
export async function getStats() {
  const { data, error } = await supabase
    .from('landing_stats')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching stats:', error);
    return [];
  }
  return data;
}

export async function createStat(data: {
  title: string;
  description?: string;
  order_index?: number;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_stats')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating stat:', error);
    throw error;
  }
  return result;
}

export async function updateStat(id: string, data: {
  title?: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_stats')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating stat:', error);
    throw error;
  }
  return result;
}

export async function deleteStat(id: string) {
  const { error } = await supabaseAdmin
    .from('landing_stats')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting stat:', error);
    throw error;
  }
  return true;
}

// ============================================
// SUCCESS STORIES
// ============================================
export async function getSuccessStories() {
  const { data, error } = await supabase
    .from('landing_success_stories')
    .select('*')
    .eq('is_active', true)
    .eq('is_verified', true)
    .eq('permission_granted', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching success stories:', error);
    return [];
  }
  return data;
}

export async function getAllSuccessStories() {
  const { data, error } = await supabaseAdmin
    .from('landing_success_stories')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching all success stories:', error);
    return [];
  }
  return data;
}

export async function createSuccessStory(data: {
  headline: string;
  description: string;
  caption: string;
  image_url?: string;
  is_verified?: boolean;
  is_active?: boolean;
  order_index?: number;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_success_stories')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating success story:', error);
    throw error;
  }
  return result;
}

export async function updateSuccessStory(id: string, data: {
  headline?: string;
  description?: string;
  caption?: string;
  image_url?: string;
  is_verified?: boolean;
  is_active?: boolean;
  order_index?: number;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_success_stories')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating success story:', error);
    throw error;
  }
  return result;
}

export async function deleteSuccessStory(id: string) {
  const { error } = await supabaseAdmin
    .from('landing_success_stories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting success story:', error);
    throw error;
  }
  return true;
}

// ============================================
// ORIENTATION PROGRAMMES
// ============================================
export async function getOrientationProgrammes() {
  const { data, error } = await supabase
    .from('landing_orientation_programmes')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching orientation programmes:', error);
    return [];
  }
  return data;
}

export async function getAllOrientationProgrammes() {
  const { data, error } = await supabaseAdmin
    .from('landing_orientation_programmes')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching all orientation programmes:', error);
    return [];
  }
  return data;
}

export async function createOrientationProgramme(data: {
  title: string;
  description: string;
  event_date?: string;
  event_time?: string;
  duration?: string;
  format?: string;
  status?: string;
  registration_url?: string;
  is_active?: boolean;
  order_index?: number;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_orientation_programmes')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating orientation programme:', error);
    throw error;
  }
  return result;
}

export async function updateOrientationProgramme(id: string, data: {
  title?: string;
  description?: string;
  event_date?: string;
  event_time?: string;
  duration?: string;
  format?: string;
  status?: string;
  registration_url?: string;
  is_active?: boolean;
  order_index?: number;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_orientation_programmes')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating orientation programme:', error);
    throw error;
  }
  return result;
}

export async function deleteOrientationProgramme(id: string) {
  const { error } = await supabaseAdmin
    .from('landing_orientation_programmes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting orientation programme:', error);
    throw error;
  }
  return true;
}

// ============================================
// WHY CHOOSE US FEATURES
// ============================================
export async function getWhyChooseFeatures() {
  const { data, error } = await supabase
    .from('landing_why_choose_features')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching why choose features:', error);
    return [];
  }
  return data;
}

export async function createWhyChooseFeature(data: {
  title: string;
  description: string;
  icon_name: string;
  order_index?: number;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_why_choose_features')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating why choose feature:', error);
    throw error;
  }
  return result;
}

export async function updateWhyChooseFeature(id: string, data: {
  title?: string;
  description?: string;
  icon_name?: string;
  order_index?: number;
  is_active?: boolean;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_why_choose_features')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating why choose feature:', error);
    throw error;
  }
  return result;
}

export async function deleteWhyChooseFeature(id: string) {
  const { error } = await supabaseAdmin
    .from('landing_why_choose_features')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting why choose feature:', error);
    throw error;
  }
  return true;
}

// ============================================
// LEARNER REVIEWS
// ============================================
export async function getReviews() {
  const { data, error } = await supabase
    .from('landing_reviews')
    .select('*')
    .eq('is_active', true)
    .eq('is_verified', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data;
}

export async function getAllReviews() {
  const { data, error } = await supabaseAdmin
    .from('landing_reviews')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
  return data;
}

export async function createReview(data: {
  review_title?: string;
  reviewer_name: string;
  reviewer_role?: string;
  review_text: string;
  rating?: number | null;
  is_verified?: boolean;
  permission_granted?: boolean;
  is_active?: boolean;
  order_index?: number;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_reviews')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }
  return result;
}

export async function updateReview(id: string, data: {
  review_title?: string;
  reviewer_name?: string;
  reviewer_role?: string;
  review_text?: string;
  rating?: number | null;
  is_verified?: boolean;
  permission_granted?: boolean;
  is_active?: boolean;
  order_index?: number;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_reviews')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    throw error;
  }
  return result;
}

export async function deleteReview(id: string) {
  const { error } = await supabaseAdmin
    .from('landing_reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
  return true;
}

// ============================================
// BLOG ARTICLES
// ============================================
export async function getBlogArticles(publishedOnly = true) {
  const query = supabase
    .from('landing_blog_articles')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false });

  if (publishedOnly) {
    query.eq('is_published', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog articles:', error);
    return [];
  }
  return data;
}

export async function getBlogArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('landing_blog_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching blog article:', error);
    return null;
  }
  return data;
}

export async function getAllBlogArticles() {
  const { data, error } = await supabaseAdmin
    .from('landing_blog_articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all blog articles:', error);
    return [];
  }
  return data;
}

export async function createBlogArticle(data: {
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  thumbnail_url?: string;
  is_published?: boolean;
  published_at?: string;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_blog_articles')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating blog article:', error);
    throw error;
  }
  return result;
}

export async function updateBlogArticle(id: string, data: {
  title?: string;
  slug?: string;
  category?: string;
  summary?: string;
  content?: string;
  thumbnail_url?: string;
  is_published?: boolean;
  published_at?: string;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('landing_blog_articles')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog article:', error);
    throw error;
  }
  return result;
}

export async function deleteBlogArticle(id: string) {
  const { error } = await supabaseAdmin
    .from('landing_blog_articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog article:', error);
    throw error;
  }
  return true;
}

// ============================================
// CONTACT ENQUIRIES
// ============================================
export async function createContactEnquiry(data: {
  name: string;
  email: string;
  message: string;
}) {
  const { data: result, error } = await supabase
    .from('landing_contact_enquiries')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating contact enquiry:', error);
    throw error;
  }
  return result;
}

export async function getContactEnquiries() {
  const { data, error } = await supabaseAdmin
    .from('landing_contact_enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contact enquiries:', error);
    return [];
  }
  return data;
}

export async function updateContactEnquiryStatus(id: string, status: 'new' | 'read' | 'responded') {
  const { data: result, error } = await supabaseAdmin
    .from('landing_contact_enquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact enquiry status:', error);
    throw error;
  }
  return result;
}

export async function deleteContactEnquiry(id: string) {
  const { error } = await supabaseAdmin
    .from('landing_contact_enquiries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact enquiry:', error);
    throw error;
  }
  return true;
}
