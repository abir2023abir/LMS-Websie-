export interface LessonSchema {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  /** Older courses stored a number of days here. The timeline now comes from the course dates. */
  days?: number;
  /** Short overview text the student reads before the quiz opens. Empty means the part is skipped. */
  overview?: string;
  /** Notes and resources for the lesson. Empty means the part is skipped. */
  notes?: string;
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
