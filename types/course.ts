export interface LessonSchema {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
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
