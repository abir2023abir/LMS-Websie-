import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CourseSchema } from '@/types/course';
import { featuredCourses } from '@/lib/data';

const COURSES_COLLECTION = 'courses';

/**
 * Creates a new course document in Firestore.
 */
export async function createCourse(courseData: Omit<CourseSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COURSES_COLLECTION), {
      ...courseData,
      rating: courseData.rating ?? 5.0,
      reviewCount: courseData.reviewCount ?? 0,
      studentCount: courseData.studentCount ?? 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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
  try {
    const q = query(collection(db, COURSES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Return static seed courses if Firestore collection is empty
      return featuredCourses.map((c) => ({
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
      }));
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
    return featuredCourses.map((c) => ({
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
    }));
  }
}

/**
 * Fetches a single course by its Firestore document ID.
 */
export async function getCourseById(courseId: string): Promise<CourseSchema | null> {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    const docSnap = await getDoc(docRef);

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
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('instructorId', '==', instructorId)
    );
    const querySnapshot = await getDocs(q);

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
  try {
    const { deleteDoc, doc: firestoreDoc } = await import('firebase/firestore');
    const docRef = firestoreDoc(db, COURSES_COLLECTION, courseId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting course ${courseId}:`, error);
    return false;
  }
}

