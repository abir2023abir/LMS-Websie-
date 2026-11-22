export interface LessonSchema {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  /** Days this lesson gets in the day-wise timeline (counted from each student's enrollment); empty = an even share. */
  days?: number;
  /** Short overview text the student reads before the quiz opens. Empty means the part is skipped. */
  overview?: string;
  /** Notes and resources for the lesson. Empty means the part is skipped. */
  notes?: string;
  /** "Action Step For This Lesson": one step per line, shown under the overview. */
  actionSteps?: string;
  /** Video 2, 3, … of the lesson (videoUrl is video 1). Each must be watched to finish the video step. */
  moreVideos?: LessonVideo[];
}

export interface LessonVideo {
  id: string;
  title: string;
  url: string;
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
