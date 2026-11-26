const standards = [
  { code: 'IFRS', name: 'International Financial Reporting Standards' },
  { code: 'AICPA', name: 'American Institute of CPAs' },
  { code: 'GAAP', name: 'Generally Accepted Accounting Principles' },
  { code: 'IAS', name: 'International Accounting Standards' },
  { code: 'FASB', name: 'Financial Accounting Standards Board' },
];

/** The accounting standards the bookkeeping follows (client layout, section 02). */
export default function AccountingStandards() {
  return (
    <section aria-label="Accounting standards" className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-5">
          {standards.map((item) => (
            <li key={item.code} title={item.name} className="flex min-h-16 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#f5f7fa] px-1.5 py-2 text-center sm:px-3 sm:py-3">
              <span className="font-display text-base font-extrabold tracking-wide text-[#111827] sm:text-xl">{item.code}</span>
              <span className="mt-0.5 text-[9px] font-semibold leading-tight text-slate-500 sm:text-[10px]">{item.name}</span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[13px] text-slate-600 sm:mt-5 sm:text-sm">We follow applicable accounting standards to maintain organized financial records and prepare accurate financial reports.</p>
      </div>
    </section>
  );
}
