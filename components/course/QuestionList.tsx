'use client';

import { ChevronDown, HelpCircle, Pencil, Trash2 } from 'lucide-react';
import type { CourseQuestion } from '@/lib/course-community';

/** Relevant questions of a course: press a question to read the course team's answer. */
export default function QuestionList({ questions, onEdit, onDelete }: { questions: CourseQuestion[]; onEdit?: (item: CourseQuestion) => void; onDelete?: (item: CourseQuestion) => void }) {
  if (!questions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
        <HelpCircle className="mx-auto mb-2 h-6 w-6 text-slate-300" />
        No relevant questions yet.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {questions.map((item) => (
        <li key={item.id} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          <details className="group min-w-0 flex-1">
            <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl p-2 hover:bg-slate-50">
              <span className="min-w-0 flex-1">
                {item.moduleTitle && <span className="block truncate text-[11px] font-semibold text-slate-500">{[item.moduleTitle, item.lessonTitle].filter(Boolean).join(' · ')}</span>}
                <span className="block text-sm font-bold text-[#111827]">{item.question}</span>
              </span>
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="whitespace-pre-wrap break-words px-2 pb-2 pt-1 text-sm leading-relaxed text-slate-600">{item.answer}</p>
          </details>
          {onEdit && <button type="button" onClick={() => onEdit(item)} aria-label="Edit question" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>}
          {onDelete && <button type="button" onClick={() => onDelete(item)} aria-label="Delete question" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>}
        </li>
      ))}
    </ul>
  );
}
