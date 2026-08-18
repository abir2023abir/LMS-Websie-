import { notFound } from 'next/navigation';
import { getCourseById } from '@/lib/db';
import CheckoutPageClient from '@/components/checkout/CheckoutPageClient';
import type { CourseSchema } from '@/types/course';

const fallbackCourses: Record<string, CourseSchema> = {
  'eng-1': {
    id: 'eng-1',
    title: 'General English Foundation Capsule',
    description: 'Master practical English grammar, 1,000+ core vocabulary words, and daily conversation without tedious memorization.',
    price: 39,
    originalPrice: 99,
    instructorId: 'inst-1',
    instructorName: 'Sarah Jenkins',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop',
    category: 'General English',
    duration: '18h 30m',
    lessonCount: 24,
  },
  'eng-2': {
    id: 'eng-2',
    title: 'Spoken English & Accent Perfection',
    description: 'Speak fluently and confidently with native-like pronunciation, stress patterns, and real-life situational practice.',
    price: 49,
    originalPrice: 120,
    instructorId: 'inst-2',
    instructorName: 'David Miller',
    thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=340&fit=crop',
    category: 'Spoken English',
    duration: '22h 00m',
    lessonCount: 30,
  },
  'eng-3': {
    id: 'eng-3',
    title: 'Business English & Corporate Communication',
    description: 'Elevate your professional career. Master email writing, presentation delivery, negotiations, and interview skills.',
    price: 59,
    originalPrice: 149,
    instructorId: 'inst-3',
    instructorName: 'Emma Watson',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=340&fit=crop',
    category: 'Business English',
    duration: '26h 45m',
    lessonCount: 36,
  },
  'prog-1': {
    id: 'prog-1',
    title: 'Comprehensive Conversation',
    description: 'A comprehensive program that lets you master the four skills step-by-step from scratch to advanced fluency.',
    price: 49,
    originalPrice: 120,
    instructorId: 'inst-1',
    instructorName: 'English Capsules Team',
    thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=340&fit=crop',
    category: 'Conversation',
    duration: '24h 00m',
    lessonCount: 28,
  },
  'prog-2': {
    id: 'prog-2',
    title: 'Business English Masterclass',
    description: 'Master the language of business from beginner to upper-intermediate with hands-on corporate communication practice.',
    price: 59,
    originalPrice: 149,
    instructorId: 'inst-2',
    instructorName: 'Corporate Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=340&fit=crop',
    category: 'Business English',
    duration: '30h 00m',
    lessonCount: 35,
  },
  'prog-3': {
    id: 'prog-3',
    title: 'Spoken Conversation Course',
    description: 'A comprehensive program that makes you fluent, building confidence in real-life English conversation scenarios.',
    price: 39,
    originalPrice: 99,
    instructorId: 'inst-3',
    instructorName: 'Native Instructors',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=340&fit=crop',
    category: 'Conversation',
    duration: '18h 00m',
    lessonCount: 20,
  },
};

interface PageProps {
  params: {
    courseId: string;
  };
}

export default async function CheckoutPage({ params }: PageProps) {
  const { courseId } = params;

  let course: CourseSchema | null = null;

  try {
    course = await getCourseById(courseId);
  } catch {
    // fallback if firestore demo mode
  }

  if (!course) {
    course = fallbackCourses[courseId] || fallbackCourses['eng-1'];
  }

  if (!course) {
    notFound();
  }

  return <CheckoutPageClient course={course} />;
}
