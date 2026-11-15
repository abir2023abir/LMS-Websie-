import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { getBlogArticleBySlug } from '@/lib/cms-db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getBlogArticleBySlug(params.slug);
  return article ? { title: `${article.title} | Career Bridge.Studio`, description: article.excerpt } : { title: 'Article not found' };
}

export default async function LatestArticlePage({ params }: { params: { slug: string } }) {
  const article = await getBlogArticleBySlug(params.slug);
  if (!article) notFound();

  const published = article.publishedAt ? new Date(article.publishedAt) : null;
  const byline = [
    article.author?.name,
    published && Number.isFinite(published.getTime()) ? published.toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    article.readTime,
  ].filter(Boolean).join(' · ');

  return (
    <main className="min-h-screen bg-white font-sans text-[#111827] antialiased">
      <Navbar />
      <article className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-32 sm:px-6 sm:pt-36">
        <Link href="/#latest" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#A16207] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Latest from LMS
        </Link>
        <header className="space-y-3">
          {article.category && <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A16207]">{article.category}</p>}
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{article.title}</h1>
          {byline && <p className="text-sm text-slate-500">{byline}</p>}
        </header>
        {article.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImage} alt="" className="aspect-[16/9] w-full rounded-3xl border border-slate-200 object-cover" />
        )}
        {article.excerpt && <p className="text-base font-medium leading-relaxed text-slate-700 sm:text-lg">{article.excerpt}</p>}
        <div className="space-y-4 text-base leading-relaxed text-slate-700">
          {String(article.content || '').split(/\n{2,}/).map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">{paragraph}</p>
          ))}
        </div>
      </article>
      <Footer />
    </main>
  );
}
