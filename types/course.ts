export interface LessonSchema {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  /** How many days the student has for this lesson. Deadlines add up inside the module. */
  days?: number;
}

export interface ModuleSchema {
  id: string;
  title: string;
  lessons: LessonSchema[];
}

export interface CourseSchema {
  id?: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  rating?: number;
  reviewCount?: number;
  studentCount?: number;
  duration?: string;
  lessonCount?: number;
  modules?: ModuleSchema[];
  createdAt?: any;
  updatedAt?: any;
}
