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
    <section aria-label="Accounting standards" className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {standards.map((item) => (
            <li key={item.code} title={item.name} className="flex min-h-16 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#f5f7fa] px-3 py-3 text-center">
              <span className="font-display text-xl font-extrabold tracking-wide text-[#111827]">{item.code}</span>
              <span className="mt-0.5 text-[10px] font-semibold leading-tight text-slate-500">{item.name}</span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-5 max-w-2xl text-center text-sm text-slate-600">We follow applicable accounting standards to maintain organized financial records and prepare accurate financial reports.</p>
      </div>
    </section>
  );
}
