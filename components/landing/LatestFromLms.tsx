import Link from 'next/link';
import { getBlogArticles } from '@/lib/cms-db';

// "Latest from LMS": the two newest articles written in Admin → Landing Page CMS → Blog.
export default async function LatestFromLms() {
  const articles = (await getBlogArticles())
    .filter((article) => article.title && article.slug)
    .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')))
    .slice(0, 2);
  if (articles.length === 0) return null;

  return (
    <section id="latest" className="bg-white py-16 text-[#111827] sm:py-24">
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Latest from LMS</h2>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">AI, technology, career ও learning বিষয়ে নিয়মিত নতুন content!</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/latest/${article.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_-24px_rgba(17,24,39,0.35)] transition hover:-translate-y-1 hover:border-[#FACC15] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FACC15]"
            >
              <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-[#111827] px-6 text-center">
                {article.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <span className="font-display text-2xl font-extrabold leading-snug text-[#FACC15]">{article.category || article.title}</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 border-t border-slate-200 p-5 sm:p-6">
                <h3 className="font-display text-lg font-extrabold leading-snug group-hover:text-[#A16207]">{article.title}</h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
