'use client';

import { FileText, GraduationCap, HelpCircle, Pencil, Plus, Video, type LucideIcon } from 'lucide-react';
import type { Place } from './CoursePlacePicker';

/** The things that can be attached to a lesson from the lesson builder. */
export type ToolKind = 'quiz' | 'assignment' | 'exam' | 'live';
export type ToolItem = { id: string; title: string; moduleId: string; lessonId: string; published: boolean };
export type ToolItems = Record<ToolKind, ToolItem[]>;
/** Tells a manager (quizzes, assignments, …) to open its editor: a new item at a place, or an existing one. */
export type ToolCommand = { nonce: number; action: 'new' | 'edit'; id?: string; place?: Place; title?: string };
/** Props every manager accepts so the lesson builder can drive it. */
export type ToolManagerProps = {
  /** When set, the list and every new item belong to this one course (course workspace). */
  courseId?: string;
  /** Only the editor windows are drawn; the list stays hidden (the lesson builder shows the items itself). */
  headless?: boolean;
  command?: ToolCommand | null;
  onItems?: (items: ToolItem[]) => void;
};

export const emptyToolItems = (): ToolItems => ({ quiz: [], assignment: [], exam: [], live: [] });

export const TOOL_META: Record<ToolKind, { label: string; add: string; icon: LucideIcon }> = {
  quiz: { label: 'Quiz', add: 'Add quiz', icon: HelpCircle },
  assignment: { label: 'Assignment', add: 'Add assignment', icon: FileText },
  exam: { label: 'Exam', add: 'Add exam', icon: GraduationCap },
  live: { label: 'Live class', add: 'Add live class', icon: Video },
};

/**
 * One row of buttons under a lesson (or module, or the whole course): what is already
 * attached, and "Add …" for each kind that is allowed there.
 */
export default function LessonToolsBar({
  kinds,
  items,
  onAdd,
  onEdit,
  busy = false,
}: {
  kinds: ToolKind[];
  /** Items already attached at this place, per kind. */
  items: Partial<ToolItems>;
  onAdd: (kind: ToolKind) => void;
  onEdit: (kind: ToolKind, id: string) => void;
  busy?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {kinds.map((kind) => {
        const { label, add, icon: Icon } = TOOL_META[kind];
        const list = items[kind] || [];
        return (
          <div key={kind} className="flex flex-wrap items-center gap-1.5">
            {list.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={busy}
                onClick={() => onEdit(kind, item.id)}
                title={`Edit ${label.toLowerCase()}: ${item.title}`}
                className="inline-flex min-h-9 max-w-[16rem] items-center gap-1.5 rounded-full border border-[#FACC15] bg-[#FEFCE8] px-3 text-[11px] font-bold text-[#111827] transition hover:bg-[#FEF9C3] disabled:opacity-60"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#A16207]" />
                <span className="truncate">{label}: {item.title}</span>
                {!item.published && <span className="shrink-0 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-600">Draft</span>}
                <Pencil className="h-3 w-3 shrink-0 text-slate-500" />
              </button>
            ))}
            <button
              type="button"
              disabled={busy}
              onClick={() => onAdd(kind)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:border-[#111827] hover:text-[#111827] disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />{add}
            </button>
          </div>
        );
      })}
    </div>
  );
}
