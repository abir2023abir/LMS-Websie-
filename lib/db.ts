import type { CourseSchema } from '@/types/course';
import { featuredCourses } from '@/lib/data';
import { isFirebaseDemo } from '@/lib/utils';

const COURSES_COLLECTION = 'courses';

// With the demo Firebase key, Firestore reads fail fast but writes hang forever,
// so demo-created courses are kept in this in-memory store instead of Firestore.
const isDemoMode = isFirebaseDemo;

async function firestore() {
  const [{ db }, fs] = await Promise.all([import('@/lib/firebase'), import('firebase/firestore')]);
  return { db, ...fs };
}

const demoCourses: CourseSchema[] = [];

const mapFallbackCourse = (c: (typeof featuredCourses)[number]): CourseSchema => ({
  id: c.id,
  title: c.title,
  description: c.description,
  instructorId: c.instructor.name,
  instructorName: c.instructor.name,
  price: c.price,
  originalPrice: c.originalPrice,
  thumbnail: c.thumbnail,
  category: c.category,
  level: c.level,
  rating: c.rating,
  reviewCount: c.reviewCount,
  studentCount: c.studentCount,
  duration: c.duration,
  lessonCount: c.lessonCount,
});

const fallbackCourses = (): CourseSchema[] => featuredCourses.map(mapFallbackCourse);

/**
 * Creates a new course. Stored in memory in demo mode, in Firestore otherwise.
 */
export async function createCourse(courseData: Omit<CourseSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (isDemoMode()) {
    const demoId = `demo-${Date.now()}`;
    demoCourses.unshift({ ...courseData, id: demoId } as CourseSchema);
    return demoId;
  }

  try {
    const fb = await firestore();
    const docRef = await fb.addDoc(fb.collection(fb.db, COURSES_COLLECTION), {
      ...courseData,
      rating: courseData.rating ?? 5.0,
      reviewCount: courseData.reviewCount ?? 0,
      studentCount: courseData.studentCount ?? 0,
      createdAt: fb.serverTimestamp(),
      updatedAt: fb.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating course in Firestore:', error);
    throw error;
  }
}

/**
 * Fetches all courses from Firestore.
 * Fallbacks to featured mock data if Firestore returns no documents or encounters a connection issue.
 */
export async function getAllCourses(): Promise<CourseSchema[]> {
  if (isDemoMode()) {
    return [...demoCourses, ...fallbackCourses()];
  }

  try {
    const fb = await firestore();
    const q = fb.query(fb.collection(fb.db, COURSES_COLLECTION), fb.orderBy('createdAt', 'desc'));
    const querySnapshot = await fb.getDocs(q);

    if (querySnapshot.empty) {
      // Return static seed courses if Firestore collection is empty
      return fallbackCourses();
    }

    const courses: CourseSchema[] = [];
    querySnapshot.forEach((docSnap) => {
      courses.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as CourseSchema);
    });

    return courses;
  } catch (error) {
    console.warn('Firestore fetch failed, returning fallback courses:', error);
    return fallbackCourses();
  }
}

/**
 * Fetches a single course by its Firestore document ID.
 */
export async function getCourseById(courseId: string): Promise<CourseSchema | null> {
  if (isDemoMode()) {
    return (
      demoCourses.find((c) => c.id === courseId) ||
      fallbackCourses().find((c) => c.id === courseId) ||
      null
    );
  }

  try {
    const fb = await firestore();
    const docSnap = await fb.getDoc(fb.doc(fb.db, COURSES_COLLECTION, courseId));

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as CourseSchema;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    return null;
  }
}

/**
 * Fetches all courses created by a specific instructor.
 */
export async function getCoursesByInstructor(instructorId: string): Promise<CourseSchema[]> {
  if (isDemoMode()) {
    return [...demoCourses, ...fallbackCourses()].filter((c) => c.instructorId === instructorId);
  }

  try {
    const fb = await firestore();
    const q = fb.query(
      fb.collection(fb.db, COURSES_COLLECTION),
      fb.where('instructorId', '==', instructorId)
    );
    const querySnapshot = await fb.getDocs(q);

    const courses: CourseSchema[] = [];
    querySnapshot.forEach((docSnap) => {
      courses.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as CourseSchema);
    });

    return courses;
  } catch (error) {
    console.error(`Error fetching courses for instructor ${instructorId}:`, error);
    return [];
  }
}

/**
 * Deletes a course document from Firestore by document ID.
 */
export async function deleteCourse(courseId: string): Promise<boolean> {
  if (isDemoMode()) {
    const index = demoCourses.findIndex((c) => c.id === courseId);
    if (index !== -1) {
      demoCourses.splice(index, 1);
    }
    return true;
  }

  try {
    const fb = await firestore();
    await fb.deleteDoc(fb.doc(fb.db, COURSES_COLLECTION, courseId));
    return true;
  } catch (error) {
    console.error(`Error deleting course ${courseId}:`, error);
    return false;
  }
}
