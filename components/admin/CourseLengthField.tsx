'use client';

type Dates = { firstEnrolled: string; lastEnrolled: string; lastCounting: string; courseEnding: string };

const DAY = 86400000;
// <input type="datetime-local"> values: local time, no zone.
const parse = (value: string) => (value ? new Date(value).getTime() : NaN);
const toLocal = (ms: number) => new Date(ms - new Date(ms).getTimezoneOffset() * 60000).toISOString().slice(0, 16);

/**
 * "How many days does the course run?" Typing a number sets the Course ending date to
 * First enrolled date + that many days; changing either date updates the number.
 */
export default function CourseLengthField({ dates, onChange, inputClass }: { dates: Dates; onChange: (next: Dates) => void; inputClass: string }) {
  const first = parse(dates.firstEnrolled);
  const end = parse(dates.courseEnding);
  const days = Number.isFinite(first) && Number.isFinite(end) && end > first ? Math.round((end - first) / DAY) : '';
  const counting = parse(dates.lastCounting);
  const lessonDays = Number.isFinite(counting) && Number.isFinite(end) && end > counting ? Math.round((end - counting) / DAY) : null;

  return (
    <div className="rounded-xl border border-[#FACC15] bg-[#FEFCE8] p-3">
      <label className="block space-y-1 text-[11px] font-bold text-slate-600">Course length (days)
        <input
          type="number"
          min={1}
          max={3650}
          value={days}
          disabled={!Number.isFinite(first)}
          onChange={(e) => {
            const value = Math.floor(Number(e.target.value));
            if (!Number.isFinite(first) || !(value >= 1)) return;
            onChange({ ...dates, courseEnding: toLocal(first + value * DAY) });
          }}
          placeholder={Number.isFinite(first) ? 'e.g. 90' : 'Set the first enrolled date first'}
          className={inputClass}
        />
      </label>
      <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-slate-600">
        {Number.isFinite(first)
          ? 'Counted from the first enrolled date. Typing the days sets the course ending date for you.'
          : 'Choose the first enrolled date, then type how many days the course runs.'}
        {lessonDays !== null && ` ${lessonDays} day${lessonDays === 1 ? '' : 's'} between the last counting date and the ending date are shared by the lessons as the minimum lesson time.`}
      </p>
    </div>
  );
}
