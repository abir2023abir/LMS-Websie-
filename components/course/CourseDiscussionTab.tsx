'use client';

import { Lock } from 'lucide-react';
import { useCommunity } from './useCommunity';
import QuestionList from './QuestionList';
import DiscussionBoard from './DiscussionBoard';

/** The public course page's "Discussion": relevant questions for everyone, the conversation for members. */
export default function CourseDiscussionTab({ courseId }: { courseId: string }) {
  const { data, error, post } = useCommunity(courseId);

  if (error) return <p role="alert" className="py-8 text-center text-sm text-slate-600">{error}</p>;
  if (!data) return <p className="py-8 text-center text-sm text-slate-500">Loading discussion…</p>;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="font-display text-lg font-bold text-[#111827]">Relevant Questions</h3>
        <QuestionList questions={data.questions} />
      </section>
      <section className="space-y-3">
        <h3 className="font-display text-lg font-bold text-[#111827]">Course Discussion</h3>
        {data.member ? (
          <DiscussionBoard posts={data.discussions} onAction={post} canManage={data.canManage} />
        ) : (
          <p className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
            <Lock className="h-4 w-4 shrink-0 text-slate-400" />Enroll in this course to read and join the discussion.
          </p>
        )}
      </section>
    </div>
  );
}
