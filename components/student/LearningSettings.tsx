'use client';

import { useEffect, useState } from 'react';

/** Classroom → Settings: how lesson videos play. Kept in this browser only. */
export type LearningPrefs = { autoPlayNext: boolean; speed: number };
export const DEFAULT_PREFS: LearningPrefs = { autoPlayNext: true, speed: 1 };
const KEY = 'cbs-learning-prefs';
const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function readPrefs(): LearningPrefs {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      autoPlayNext: typeof saved.autoPlayNext === 'boolean' ? saved.autoPlayNext : DEFAULT_PREFS.autoPlayNext,
      speed: SPEEDS.includes(saved.speed) ? saved.speed : DEFAULT_PREFS.speed,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/** The saved preferences, read once in the browser. */
export function useLearningPrefs(): [LearningPrefs, (next: LearningPrefs) => void] {
  const [prefs, setPrefs] = useState<LearningPrefs>(DEFAULT_PREFS);
  useEffect(() => { setPrefs(readPrefs()); }, []);
  const save = (next: LearningPrefs) => {
    setPrefs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private window: keep for this visit */ }
  };
  return [prefs, save];
}

export default function LearningSettings({ prefs, onChange }: { prefs: LearningPrefs; onChange: (next: LearningPrefs) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-base font-bold text-[#111827]">Video settings</h3>
        <p className="text-sm text-slate-500">These apply to every lesson on this device.</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-bold text-[#111827]">Playback speed</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Playback speed">
          {SPEEDS.map((speed) => (
            <button
              key={speed}
              type="button"
              role="radio"
              aria-checked={prefs.speed === speed}
              onClick={() => onChange({ ...prefs, speed })}
              className={`min-h-10 rounded-full px-4 text-sm font-bold transition ${prefs.speed === speed ? 'bg-[#FACC15] text-[#111827]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
        <input type="checkbox" checked={prefs.autoPlayNext} onChange={(e) => onChange({ ...prefs, autoPlayNext: e.target.checked })} className="mt-0.5 h-5 w-5 accent-amber-500" />
        <span>
          <span className="block text-sm font-bold text-[#111827]">Offer the next lesson when a video ends</span>
          <span className="text-xs text-slate-500">Shows a short countdown to the next lesson. The next lesson still opens only when this one is finished.</span>
        </span>
      </label>
    </div>
  );
}
