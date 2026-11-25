'use client';

import { useState } from 'react';
import { MessagesSquare, Send, Trash2 } from 'lucide-react';
import type { DiscussionNote, DiscussionPost } from '@/lib/course-community';

const when = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

type Props = {
  posts: DiscussionPost[];
  /** Same signature as the useCommunity hook's post(). */
  onAction: (action: string, body: Record<string, unknown>) => Promise<void>;
  /** The course team may remove posts and replies. */
  canManage?: boolean;
};

function Note({ note, onDelete }: { note: DiscussionNote; onDelete?: () => void }) {
  const team = note.authorRole !== 'Student';
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${team ? 'bg-[#111827] text-[#FACC15]' : 'bg-[#FEF9C3] text-[#A16207]'}`}>{note.authorName.charAt(0).toUpperCase()}</span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-xs">
          <span className="font-bold text-[#111827]">{note.authorName}</span>
          {team && <span className="rounded-full bg-[#FEF9C3] px-2 py-0.5 text-[10px] font-bold text-[#A16207]">{note.authorRole}</span>}
          <span className="text-slate-400">{when(note.at)}</span>
        </p>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-700">{note.text}</p>
      </div>
      {onDelete && <button type="button" onClick={onDelete} aria-label={`Delete message by ${note.authorName}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>}
    </div>
  );
}

/** The course discussion: members start a topic and reply to each other. */
export default function DiscussionBoard({ posts, onAction, canManage = false }: Props) {
  const [text, setText] = useState('');
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const run = async (key: string, action: string, body: Record<string, unknown>, after?: () => void) => {
    setBusy(key);
    setError('');
    try {
      await onAction(action, body);
      after?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send.');
    } finally {
      setBusy('');
    }
  };
  const remove = (id: string) => {
    if (confirm('Delete this message?')) void run(id, 'delete-note', { id });
  };

  return (
    <div className="space-y-4">
      <form
        className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4"
        onSubmit={(event) => { event.preventDefault(); if (text.trim()) void run('new', 'post', { text }, () => setText('')); }}
      >
        <label className="block text-sm font-bold text-[#111827]">Start a discussion
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} placeholder="Share a question or an idea about this course…" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#FACC15]" />
        </label>
        <div className="flex justify-end">
          <button type="submit" disabled={!text.trim() || busy === 'new'} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#FACC15] px-5 text-xs font-extrabold text-[#111827] hover:bg-[#EAB308] disabled:opacity-50">
            <Send className="h-3.5 w-3.5" />{busy === 'new' ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
      {error && <p role="alert" className="text-sm font-semibold text-rose-600">{error}</p>}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
          <MessagesSquare className="mx-auto mb-2 h-6 w-6 text-slate-300" />
          No discussion yet. Start the first one.
        </div>
      ) : posts.map((item) => (
        <article key={item.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <Note note={item} onDelete={canManage ? () => remove(item.id) : undefined} />
          <div className="space-y-3 border-l-2 border-slate-100 pl-4 sm:ml-4">
            {item.replies.map((reply) => <Note key={reply.id} note={reply} onDelete={canManage ? () => remove(reply.id) : undefined} />)}
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const body = (replies[item.id] || '').trim();
                if (body) void run(item.id, 'post', { postId: item.id, text: body }, () => setReplies((prev) => ({ ...prev, [item.id]: '' })));
              }}
            >
              <input aria-label={`Reply to ${item.authorName}`} value={replies[item.id] || ''} maxLength={2000} onChange={(e) => setReplies((prev) => ({ ...prev, [item.id]: e.target.value }))} placeholder="Write a reply…" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]" />
              <button type="submit" aria-label="Send reply" disabled={!(replies[item.id] || '').trim() || busy === item.id} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
