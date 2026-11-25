'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from './AdminModal';
import CoursePlacePicker, { useCourseOutline, type Place } from './CoursePlacePicker';
import LessonVideoField from './LessonVideoField';
import ShortVideoList from '@/components/course/ShortVideoList';
import QuestionList from '@/components/course/QuestionList';
import DiscussionBoard from '@/components/course/DiscussionBoard';
import { useCommunity } from '@/components/course/useCommunity';

type Props = { courseId: string; courseTitle: string };

const card = 'space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
const labelClass = 'block text-xs font-bold text-slate-500';
const emptyPlace = (courseId: string, courseTitle: string): Place => ({ courseId, courseTitle, moduleId: '', moduleTitle: '', lessonId: '', lessonTitle: '' });

const Loading = ({ error }: { error: string }) => <div className={card}><p className="py-8 text-center text-sm text-slate-500">{error || 'Loading…'}</p></div>;

const AddButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <div className="flex justify-end">
    <button type="button" onClick={onClick} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#111827] px-5 text-xs font-bold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />{label}</button>
  </div>
);

/** Save and cancel buttons of the editor windows. */
function Actions({ busy, onSave, onCancel }: { busy: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
      <button type="button" disabled={busy} onClick={onSave} className="rounded-xl bg-[#111827] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
    </div>
  );
}

/** Shared "open a form, save it, delete an item" handling. */
function useEditor<T>(post: (action: string, body: Record<string, unknown>) => Promise<void>) {
  const [draft, setDraft] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async (action: string, message: string) => {
    if (!draft) return;
    setBusy(true);
    try {
      await post(action, draft as unknown as Record<string, unknown>);
      toast.success(message);
      setDraft(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };
  const remove = async (action: string, id: string, question: string) => {
    if (!confirm(question)) return;
    try {
      await post(action, { id });
      toast.success('Deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete.');
    }
  };
  return { draft, setDraft, busy, save, remove };
}

type VideoDraft = Place & { id?: string; title: string; description: string; url: string };

export function ShortVideosManager({ courseId, courseTitle }: Props) {
  const { data, error, post } = useCommunity(courseId);
  const outline = useCourseOutline(courseId);
  const { draft, setDraft, busy, save, remove } = useEditor<VideoDraft>(post);
  if (!data) return <Loading error={error} />;
  return (
    <section className={card}>
      {data.canManage && <AddButton label="Add short video" onClick={() => setDraft({ ...emptyPlace(courseId, courseTitle), title: '', description: '', url: '' })} />}
      <ShortVideoList
        videos={data.shorts}
        onEdit={data.canManage ? (video) => setDraft({ ...video, courseTitle }) : undefined}
        onDelete={data.canManage ? (video) => remove('delete-short', video.id, `Delete the short video “${video.title}”?`) : undefined}
      />
      {draft && (
        <AdminModal title={draft.id ? `Edit short video ${draft.id}` : 'Add short video'} onClose={() => setDraft(null)}>
          <div className="space-y-3">
            <CoursePlacePicker outline={outline} depth="course" lockCourse value={draft} onChange={(next) => setDraft({ ...draft, ...next, courseId })} />
            <label className={labelClass}>Title<input className={`${fieldClass} mt-1`} value={draft.title} maxLength={160} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label className={labelClass}>Description (optional)<textarea className={`${fieldClass} mt-1`} rows={3} maxLength={1000} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
            <div className="space-y-1">
              <p className={labelClass}>Video — upload a file, or paste a YouTube, Vimeo or other link</p>
              <LessonVideoField courseId={courseId} lessonId={`short-${draft.lessonId || 'course'}`} value={draft.url} onChange={(url) => setDraft((prev) => (prev ? { ...prev, url } : prev))} />
            </div>
            <Actions busy={busy} onCancel={() => setDraft(null)} onSave={() => save('save-short', 'Short video saved')} />
          </div>
        </AdminModal>
      )}
    </section>
  );
}

type QuestionDraft = Place & { id?: string; question: string; answer: string };

export function QuestionsManager({ courseId, courseTitle }: Props) {
  const { data, error, post } = useCommunity(courseId);
  const outline = useCourseOutline(courseId);
  const { draft, setDraft, busy, save, remove } = useEditor<QuestionDraft>(post);
  if (!data) return <Loading error={error} />;
  return (
    <section className={card}>
      {data.canManage && <AddButton label="Add question" onClick={() => setDraft({ ...emptyPlace(courseId, courseTitle), question: '', answer: '' })} />}
      <QuestionList
        questions={data.questions}
        onEdit={data.canManage ? (item) => setDraft({ ...item, courseTitle }) : undefined}
        onDelete={data.canManage ? (item) => remove('delete-question', item.id, 'Delete this question?') : undefined}
      />
      {draft && (
        <AdminModal title={draft.id ? 'Edit question' : 'Add question'} onClose={() => setDraft(null)}>
          <div className="space-y-3">
            <CoursePlacePicker outline={outline} depth="course" lockCourse value={draft} onChange={(next) => setDraft({ ...draft, ...next, courseId })} />
            <label className={labelClass}>Question<input className={`${fieldClass} mt-1`} value={draft.question} maxLength={600} onChange={(e) => setDraft({ ...draft, question: e.target.value })} /></label>
            <label className={labelClass}>Answer<textarea className={`${fieldClass} mt-1`} rows={6} maxLength={4000} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} /></label>
            <Actions busy={busy} onCancel={() => setDraft(null)} onSave={() => save('save-question', 'Question saved')} />
          </div>
        </AdminModal>
      )}
    </section>
  );
}

export function DiscussionManager({ courseId }: Pick<Props, 'courseId'>) {
  const { data, error, post } = useCommunity(courseId);
  if (!data) return <Loading error={error} />;
  return (
    <section className={card}>
      <DiscussionBoard posts={data.discussions} onAction={post} canManage={data.canManage} />
    </section>
  );
}
