import { doc, getDoc, setDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CourseSchema, ModuleSchema } from '@/types/course';
import { featuredCourses } from '@/lib/data';

export interface CourseProgressRecord {
  courseId: string;
  userId: string;
  completedLessons: Record<string, boolean>; // lessonId -> boolean
  completedModules: Record<string, boolean>; // moduleId -> boolean
  progressPercentage: number;               // 0 - 100
  isCompleted: boolean;
  completedAt?: string;
  certificateId?: string;
  lastAccessedLessonId?: string;
  lastAccessedModuleId?: string;
  lastAccessedAt: string;
}

export interface EnrolledCourseWithProgress {
  course: CourseSchema;
  progress: CourseProgressRecord;
  totalLessons: number;
  completedLessonsCount: number;
  totalModules: number;
  completedModulesCount: number;
}

const LOCAL_PROGRESS_KEY = 'lms_student_progress_records';
const LOCAL_ENROLLMENTS_KEY = 'lms_student_enrollments';

// Helper to get local records
function getLocalProgressStore(): Record<string, CourseProgressRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper to save local records
function saveLocalProgressStore(store: Record<string, CourseProgressRecord>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn('Could not save progress to localStorage', err);
  }
}

/**
 * Retrieves the current student's progress for a specific course.
 */
export async function getUserCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgressRecord | null> {
  const storeKey = `${userId}_${courseId}`;

  // 1. Try local cache first for instant UI response
  const localStore = getLocalProgressStore();
  const localRecord = localStore[storeKey];

  // 2. Query Firestore if available
  try {
    const docRef = doc(db, 'user_progress', storeKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as CourseProgressRecord;
      // Sync local cache with Firestore data
      localStore[storeKey] = data;
      saveLocalProgressStore(localStore);
      return data;
    }
  } catch (error) {
    // Silent fallback to local cache
  }

  return localRecord || null;
}

export const getCourseProgress = getUserCourseProgress;

/**
 * Updates progress when a lesson is watched/completed.
 * Automatically checks module completion and 100% course completion.
 */
export async function saveLessonCompletion(
  userId: string,
  courseId: string,
  lessonId: string,
  moduleId: string,
  isCompleted: boolean,
  courseModules: ModuleSchema[]
): Promise<CourseProgressRecord> {
  const storeKey = `${userId}_${courseId}`;
  const localStore = getLocalProgressStore();

  // Load existing or initialize fresh record
  const existing: CourseProgressRecord = localStore[storeKey] || {
    courseId,
    userId,
    completedLessons: {},
    completedModules: {},
    progressPercentage: 0,
    isCompleted: false,
    lastAccessedLessonId: lessonId,
    lastAccessedModuleId: moduleId,
    lastAccessedAt: new Date().toISOString(),
  };

  const updatedCompletedLessons = {
    ...existing.completedLessons,
    [lessonId]: isCompleted,
  };

  // Evaluate module completions
  const updatedCompletedModules: Record<string, boolean> = {
    ...existing.completedModules,
  };

  let totalCourseLessons = 0;
  let totalCompletedLessons = 0;

  courseModules.forEach((mod) => {
    const modLessons = mod.lessons || [];
    totalCourseLessons += modLessons.length;

    const allModLessonsDone =
      modLessons.length > 0 &&
      modLessons.every((les) => updatedCompletedLessons[les.id] === true);

    updatedCompletedModules[mod.id] = allModLessonsDone;
  });

  // Calculate completed count
  courseModules.forEach((mod) => {
    (mod.lessons || []).forEach((les) => {
      if (updatedCompletedLessons[les.id]) {
        totalCompletedLessons++;
      }
    });
  });

  const progressPercentage =
    totalCourseLessons > 0
      ? Math.min(100, Math.round((totalCompletedLessons / totalCourseLessons) * 100))
      : 0;

  const isNowCompleted = progressPercentage >= 100;

  let certificateId = existing.certificateId;
  if (isNowCompleted && !certificateId) {
    // Generate deterministic/unique certificate ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    certificateId = `EC-2026-${randomSuffix}`;
  }

  const updatedRecord: CourseProgressRecord = {
    courseId,
    userId,
    completedLessons: updatedCompletedLessons,
    completedModules: updatedCompletedModules,
    progressPercentage,
    isCompleted: isNowCompleted,
    completedAt: isNowCompleted ? existing.completedAt || new Date().toISOString() : undefined,
    certificateId,
    lastAccessedLessonId: lessonId,
    lastAccessedModuleId: moduleId,
    lastAccessedAt: new Date().toISOString(),
  };

  // 1. Save to local storage for immediate persistence
  localStore[storeKey] = updatedRecord;
  saveLocalProgressStore(localStore);

  // 2. Asynchronously sync to Firestore
  try {
    const docRef = doc(db, 'user_progress', storeKey);
    await setDoc(docRef, {
      ...updatedRecord,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore progress sync failed, saved locally:', err);
  }

  return updatedRecord;
}

/**
 * Saves quiz result for a specific module.
 * If passed (score >= 80%), marks module and its lessons as completed, unlocking the next module.
 */
export async function saveModuleQuizResult(
  userId: string,
  courseId: string,
  moduleId: string,
  passed: boolean,
  scorePercentage: number,
  courseModules: ModuleSchema[]
): Promise<CourseProgressRecord> {
  const storeKey = `${userId}_${courseId}`;
  const localStore = getLocalProgressStore();

  const existing: CourseProgressRecord = localStore[storeKey] || {
    courseId,
    userId,
    completedLessons: {},
    completedModules: {},
    progressPercentage: 0,
    isCompleted: false,
    lastAccessedModuleId: moduleId,
    lastAccessedAt: new Date().toISOString(),
  };

  const updatedCompletedLessons = { ...existing.completedLessons };
  const updatedCompletedModules = { ...existing.completedModules };

  if (passed) {
    const targetModule = courseModules.find((m) => m.id === moduleId);
    if (targetModule) {
      (targetModule.lessons || []).forEach((les) => {
        updatedCompletedLessons[les.id] = true;
      });
    }
    updatedCompletedModules[moduleId] = true;
  }

  let totalCourseLessons = 0;
  let totalCompletedLessons = 0;
  courseModules.forEach((mod) => {
    (mod.lessons || []).forEach((les) => {
      totalCourseLessons++;
      if (updatedCompletedLessons[les.id]) {
        totalCompletedLessons++;
      }
    });
  });

  const progressPercentage =
    totalCourseLessons > 0
      ? Math.min(100, Math.round((totalCompletedLessons / totalCourseLessons) * 100))
      : 0;

  const isNowCompleted = progressPercentage >= 100;
  let certificateId = existing.certificateId;
  if (isNowCompleted && !certificateId) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    certificateId = `EC-2026-${randomSuffix}`;
  }

  const updatedRecord: CourseProgressRecord = {
    courseId,
    userId,
    completedLessons: updatedCompletedLessons,
    completedModules: updatedCompletedModules,
    progressPercentage,
    isCompleted: isNowCompleted,
    completedAt: isNowCompleted ? existing.completedAt || new Date().toISOString() : undefined,
    certificateId,
    lastAccessedModuleId: moduleId,
    lastAccessedAt: new Date().toISOString(),
  };

  localStore[storeKey] = updatedRecord;
  saveLocalProgressStore(localStore);

  return updatedRecord;
}

/**
 * Fetches all courses the student is currently enrolled in,
 * merged with their real-time progress records.
 */
export async function getEnrolledCoursesWithProgress(
  userId: string
): Promise<EnrolledCourseWithProgress[]> {
  const localStore = getLocalProgressStore();

  // Retrieve enrolled course IDs from localStorage or seed with defaults
  let enrolledIds: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${LOCAL_ENROLLMENTS_KEY}_${userId}`);
      if (raw) {
        enrolledIds = JSON.parse(raw);
      }
    } catch {}
  }

  // Default seed courses if newly registered user
  if (!enrolledIds || enrolledIds.length === 0) {
    enrolledIds = ['1', '2', '3', 'eng-1', 'eng-2'];
  }

  // Map to course data
  const result: EnrolledCourseWithProgress[] = [];

  for (const courseId of enrolledIds) {
    const course = getFallbackCourseData(courseId);
    if (!course) continue;

    const storeKey = `${userId}_${courseId}`;
    let progress = localStore[storeKey];

    // Default mock progress if uninitialized
    if (!progress) {
      const defaultCompletedLessons: Record<string, boolean> = {};
      const defaultCompletedModules: Record<string, boolean> = {};
      let completedLessonsCount = 0;

      // Seed first course as 100% completed for instant certificate demonstration
      if (courseId === '1' || courseId === 'eng-1') {
        (course.modules || []).forEach((mod) => {
          defaultCompletedModules[mod.id] = true;
          (mod.lessons || []).forEach((les) => {
            defaultCompletedLessons[les.id] = true;
            completedLessonsCount++;
          });
        });
        progress = {
          courseId,
          userId,
          completedLessons: defaultCompletedLessons,
          completedModules: defaultCompletedModules,
          progressPercentage: 100,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          certificateId: 'EC-2026-8921',
          lastAccessedLessonId: course.modules?.[0]?.lessons?.[0]?.id || 'les-0-0',
          lastAccessedModuleId: course.modules?.[0]?.id || 'mod-1',
          lastAccessedAt: new Date().toISOString(),
        };
      } else if (courseId === '2' || courseId === 'eng-2') {
        // 50% completed
        const firstMod = course.modules?.[0];
        if (firstMod) {
          defaultCompletedModules[firstMod.id] = true;
          (firstMod.lessons || []).forEach((les) => {
            defaultCompletedLessons[les.id] = true;
            completedLessonsCount++;
          });
        }
        const totalL = countTotalLessons(course.modules || []);
        progress = {
          courseId,
          userId,
          completedLessons: defaultCompletedLessons,
          completedModules: defaultCompletedModules,
          progressPercentage: totalL > 0 ? Math.round((completedLessonsCount / totalL) * 100) : 40,
          isCompleted: false,
          lastAccessedLessonId: course.modules?.[1]?.lessons?.[0]?.id || 'les-1-0',
          lastAccessedModuleId: course.modules?.[1]?.id || 'mod-2',
          lastAccessedAt: new Date().toISOString(),
        };
      } else {
        // Fresh course
        progress = {
          courseId,
          userId,
          completedLessons: {},
          completedModules: {},
          progressPercentage: 0,
          isCompleted: false,
          lastAccessedLessonId: course.modules?.[0]?.lessons?.[0]?.id || 'les-0-0',
          lastAccessedModuleId: course.modules?.[0]?.id || 'mod-1',
          lastAccessedAt: new Date().toISOString(),
        };
      }

      localStore[storeKey] = progress;
      saveLocalProgressStore(localStore);
    }

    const totalLessons = countTotalLessons(course.modules || []);
    let completedLessonsCount = 0;
    (course.modules || []).forEach((mod) => {
      (mod.lessons || []).forEach((les) => {
        if (progress.completedLessons[les.id]) completedLessonsCount++;
      });
    });

    const totalModules = course.modules?.length || 0;
    let completedModulesCount = 0;
    (course.modules || []).forEach((mod) => {
      if (progress.completedModules[mod.id]) completedModulesCount++;
    });

    result.push({
      course,
      progress,
      totalLessons,
      completedLessonsCount,
      totalModules,
      completedModulesCount,
    });
  }

  return result;
}

function countTotalLessons(modules: ModuleSchema[]): number {
  let count = 0;
  modules.forEach((mod) => {
    count += (mod.lessons || []).length;
  });
  return count;
}

/**
 * Standard course structure with modules and lessons fallback.
 */
export function getFallbackCourseData(courseId: string): CourseSchema | null {
  const featured = featuredCourses.find((c) => c.id === courseId || c.slug === courseId);

  const defaultModules: ModuleSchema[] = [
    {
      id: 'mod-1',
      title: 'Module 1: Foundations & Core Principles',
      lessons: [
        {
          id: 'les-0-0',
          title: '1. Introduction, Objectives & Study Blueprint',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: '06:15',
        },
        {
          id: 'les-0-1',
          title: '2. Core Concepts & Practical Architecture',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          duration: '11:40',
        },
        {
          id: 'les-0-2',
          title: '3. Essential Drills & Live Walkthrough',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: '09:20',
        },
      ],
    },
    {
      id: 'mod-2',
      title: 'Module 2: Advanced Techniques & Real-World Application',
      lessons: [
        {
          id: 'les-1-0',
          title: '4. Deep Dive: Professional Workflows & Best Practices',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: '14:10',
        },
        {
          id: 'les-1-1',
          title: '5. Problem Solving & Performance Optimization',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          duration: '12:30',
        },
      ],
    },
    {
      id: 'mod-3',
      title: 'Module 3: Capstone Mastery & Industry Project',
      lessons: [
        {
          id: 'les-2-0',
          title: '6. Building the End-to-End Capstone Project',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
          duration: '18:45',
        },
        {
          id: 'les-2-1',
          title: '7. Final Review, Deployment & Graduation Checklist',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          duration: '08:15',
        },
      ],
    },
  ];

  if (featured) {
    return {
      id: featured.id,
      title: featured.title,
      description: featured.description,
      instructorId: featured.instructor.name,
      instructorName: featured.instructor.name,
      price: featured.price,
      originalPrice: featured.originalPrice,
      thumbnail: featured.thumbnail,
      category: featured.category,
      level: featured.level,
      rating: featured.rating,
      reviewCount: featured.reviewCount,
      studentCount: featured.studentCount,
      duration: featured.duration,
      lessonCount: 7,
      modules: defaultModules,
    };
  }

  // English capsules fallback courses
  if (courseId === 'eng-1') {
    return {
      id: 'eng-1',
      title: 'General English Foundation Capsule',
      description: 'Master practical English grammar, 1,000+ core vocabulary words, and daily conversation.',
      instructorId: 'Sarah Jenkins',
      instructorName: 'Sarah Jenkins',
      price: 39,
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop',
      category: 'General English',
      level: 'Beginner',
      lessonCount: 7,
      modules: defaultModules,
    };
  }

  return {
    id: courseId,
    title: 'Masterclass Professional Training Program',
    description: 'Comprehensive curriculum designed for maximum hands-on skill acquisition.',
    instructorId: 'Faculty Board',
    instructorName: 'English Capsules Global Academic Council',
    price: 49,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop',
    category: 'Professional Skills',
    level: 'Intermediate',
    lessonCount: 7,
    modules: defaultModules,
  };
}
