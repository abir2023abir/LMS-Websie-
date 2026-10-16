'use client';

export default function AdminModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-3xl w-full max-w-xl max-h-[86vh] overflow-y-auto p-6 shadow-xl border border-slate-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="font-display font-extrabold text-lg text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-xs font-bold text-slate-500 hover:text-slate-900">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const fieldClass = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm';
