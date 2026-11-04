import type { CourseSchema, ModuleSchema } from '@/types/course';
import { featuredCourses } from '@/lib/data';
import { sendRecord } from '@/lib/server-sync';

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

export function recordLocalCourseEnrollment(userId: string, courseId: string) {
  if (typeof window === 'undefined' || !userId || !courseId) return;
  const key = `${LOCAL_ENROLLMENTS_KEY}_${userId}`;
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const enrolled = Array.isArray(stored) ? stored.map(String) : [];
    if (!enrolled.includes(courseId)) localStorage.setItem(key, JSON.stringify([...enrolled, courseId]));
  } catch {
    localStorage.setItem(key, JSON.stringify([courseId]));
  }
}

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

/** Rank inside one course. Higher progress is a better rank. */
export function rankInCourse(courseId: string, userId: string, currentPercent = 0) {
  const rows = Object.values(getLocalProgressStore()).filter((item) => String(item.courseId) === String(courseId));
  const mine = rows.find((item) => item.userId === userId);
  const progress = Math.round(mine?.progressPercentage ?? currentPercent);
  const board = rows.some((item) => item.userId === userId)
    ? rows
    : [...rows, { userId, courseId, progressPercentage: progress } as CourseProgressRecord];
  const sorted = [...board].sort(
    (a, b) => (b.progressPercentage || 0) - (a.progressPercentage || 0) || String(a.userId).localeCompare(String(b.userId)),
  );
  const rank = Math.max(1, sorted.findIndex((item) => item.userId === userId) + 1);
  return { rank, total: sorted.length, progress };
}

/**
 * Retrieves the current student's progress for a specific course.
 */
export async function getUserCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgressRecord | null> {
  const storeKey = `${userId}_${courseId}`;

  // Browser copy; the server-side lesson path (lib/progression) is the source of truth.
  return getLocalProgressStore()[storeKey] || null;
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

  // Certificates are issued by the server (/api/certificate/generate), never made up here.
  const certificateId = existing.certificateId;

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
  sendRecord('/api/student/records', {
    type: 'progress',
    courseId,
    percent: progressPercentage,
    completedLessons: totalCompletedLessons,
    totalLessons: totalCourseLessons,
  });


  return updatedRecord;
}

/**
 * Mirrors the server's strict lesson path into the browser copy.
 * A lesson counts as done only when the server says every step of it is done.
 */
export function applyServerPath(
  userId: string,
  courseId: string,
  courseModules: ModuleSchema[],
  serverLessons: { lessonId: string; state: string }[]
): CourseProgressRecord {
  const storeKey = `${userId}_${courseId}`;
  const localStore = getLocalProgressStore();
  const existing = localStore[storeKey];

  const doneIds = new Set(serverLessons.filter((item) => item.state === 'done').map((item) => item.lessonId));
  const completedLessons: Record<string, boolean> = {};
  const completedModules: Record<string, boolean> = {};
  let total = 0;
  let done = 0;
  courseModules.forEach((mod) => {
    const lessons = mod.lessons || [];
    lessons.forEach((les) => {
      total++;
      if (doneIds.has(les.id)) {
        completedLessons[les.id] = true;
        done++;
      }
    });
    completedModules[mod.id] = lessons.length > 0 && lessons.every((les) => completedLessons[les.id]);
  });
  const progressPercentage = total > 0 ? Math.round((done / total) * 100) : 0;
  const isCompleted = progressPercentage >= 100;

  const record: CourseProgressRecord = {
    courseId,
    userId,
    completedLessons,
    completedModules,
    progressPercentage,
    isCompleted,
    completedAt: isCompleted ? existing?.completedAt || new Date().toISOString() : undefined,
    certificateId: existing?.certificateId,
    lastAccessedLessonId: existing?.lastAccessedLessonId,
    lastAccessedModuleId: existing?.lastAccessedModuleId,
    lastAccessedAt: existing?.lastAccessedAt || new Date().toISOString(),
  };
  localStore[storeKey] = record;
  saveLocalProgressStore(localStore);
  return record;
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
  sendRecord('/api/student/records', {
    type: 'progress',
    courseId,
    percent: progressPercentage,
    completedLessons: totalCompletedLessons,
    totalLessons: totalCourseLessons,
  });
  sendRecord('/api/student/records', {
    type: 'result',
    id: `quiz-${courseId}-${moduleId}`,
    kind: 'quiz',
    label: courseModules.find((m) => m.id === moduleId)?.title || 'Module quiz',
    score: Math.round(scorePercentage),
    total: 100,
    passed,
  });

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

  // Enrollment is explicit; only courses purchased or manually granted to this student appear here.
  // The server list (paid / approved payments) is the source of truth; it is cached in this browser.
  let enrolledIds: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${LOCAL_ENROLLMENTS_KEY}_${userId}`);
      if (raw) {
        enrolledIds = JSON.parse(raw);
      }
    } catch {}
    try {
      const res = await fetch('/api/student/enrollments', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { courseIds?: string[] };
        enrolledIds = Array.from(new Set([...enrolledIds.map(String), ...(data.courseIds || []).map(String)]));
        localStorage.setItem(`${LOCAL_ENROLLMENTS_KEY}_${userId}`, JSON.stringify(enrolledIds));
      }
    } catch {}
  }

  // Map to course data
  const result: EnrolledCourseWithProgress[] = [];

  for (const courseId of enrolledIds) {
    const course = getFallbackCourseData(courseId);
    if (!course) continue;

    const storeKey = `${userId}_${courseId}`;
    let progress = localStore[storeKey];

    // The server's lesson path decides what is finished.
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/progress?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = (await res.json()) as { lessons?: { lessonId: string; state: string }[] };
          if (Array.isArray(data.lessons)) {
            progress = applyServerPath(userId, courseId, course.modules || [], data.lessons);
            localStore[storeKey] = progress;
          }
        }
      } catch {}
    }

    // New enrollments always start with no course progress.
    if (!progress) {
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
          videoUrl: '',
          duration: '06:15',
        },
        {
          id: 'les-0-1',
          title: '2. Core Concepts & Practical Architecture',
          videoUrl: '',
          duration: '11:40',
        },
        {
          id: 'les-0-2',
          title: '3. Essential Drills & Live Walkthrough',
          videoUrl: '',
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
          videoUrl: '',
          duration: '14:10',
        },
        {
          id: 'les-1-1',
          title: '5. Problem Solving & Performance Optimization',
          videoUrl: '',
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
          videoUrl: '',
          duration: '18:45',
        },
        {
          id: 'les-2-1',
          title: '7. Final Review, Deployment & Graduation Checklist',
          videoUrl: '',
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

  return {
    id: courseId,
    title: 'Masterclass Professional Training Program',
    description: 'Comprehensive curriculum designed for maximum hands-on skill acquisition.',
    instructorId: 'Faculty Board',
    instructorName: 'Career Bridge.Studio Academic Team',
    price: 49,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop',
    category: 'Professional Skills',
    level: 'Intermediate',
    lessonCount: 7,
    modules: defaultModules,
  };
}
