import { redirect } from 'next/navigation';

// Quizzes now live inside each lesson; old module quiz links go to the quiz list.
export default function OldModuleQuizPage() {
  redirect('/student/quizzes');
}
