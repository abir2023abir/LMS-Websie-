import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import { getBlogPostBySlug, getAllBlogSlugs, blogPosts } from '@/lib/blog-data';
import {
  Clock,
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  Sparkles,
  CheckCircle,
  BookOpen,
  ArrowRight,
  Lightbulb,
  ChevronRight,
  GraduationCap,
  Award,
} from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found | English Capsules',
      description: 'The requested English learning guide could not be found.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | English Capsules Blog`,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: postUrl,
      siteName: 'English Capsules',
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt || post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: [post.coverImage],
      creator: '@englishcapsules',
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Related posts (excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  // Structured Schema.org JSON-LD data for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'English Capsules Academy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `http://localhost:3000/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
      {/* Injected Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <FloatingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full flex-1 space-y-10">
        {/* ── BREADCRUMBS ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#111827] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/blog" className="hover:text-[#111827] transition-colors">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-amber-600 truncate max-w-[200px] sm:max-w-xs">{post.category}</span>
        </nav>

        {/* ── ARTICLE HEADER ── */}
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-[#111827] text-white text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {post.category}
            </span>
            <span className="bg-[#FEF9C3] text-[#111827] border border-[#FACC15]/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> {post.readTime}
            </span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author Metadata Strip */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden relative border-2 border-amber-300 flex-shrink-0 shadow-sm">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-sm text-[#111827]">{post.author.name}</div>
                <div className="text-xs text-slate-500">{post.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </header>

        {/* ── ARTICLE COVER IMAGE (LAZY LOADED & OPTIMIZED) ── */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100">
          <Image
            src={post.coverImage}
            alt={`Cover image illustrating ${post.title}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        {/* ── TABLE OF CONTENTS ── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Table of Contents</span>
          </div>
          <ol className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700 list-decimal list-inside">
            {post.content.sections.map((sec, idx) => (
              <li key={idx}>
                <a href={`#section-${idx}`} className="hover:text-amber-600 transition-colors">
                  {sec.heading}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* ── ARTICLE CONTENT BODY ── */}
        <article className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-8 text-slate-800 leading-relaxed font-medium">
          {/* Intro Paragraph */}
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal border-l-4 border-[#FACC15] pl-4 italic bg-amber-50/50 py-2 rounded-r-xl">
            {post.content.intro}
          </p>

          {/* Dynamic Sections */}
          <div className="space-y-10">
            {post.content.sections.map((sec, sIdx) => (
              <section key={sIdx} id={`section-${sIdx}`} className="space-y-4 pt-2">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[#111827] flex items-center gap-2">
                  <span>{sec.heading}</span>
                </h2>

                {sec.subheading && (
                  <h3 className="font-bold text-base text-slate-700">{sec.subheading}</h3>
                )}

                <div className="space-y-3 text-sm sm:text-base text-slate-700 font-normal">
                  {sec.body.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>

                {/* Key Takeaway Callout */}
                {sec.keyTakeaway && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-emerald-900 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Key Takeaway:</strong>
                      <span>{sec.keyTakeaway}</span>
                    </div>
                  </div>
                )}

                {/* Pro Tip Callout */}
                {sec.proTip && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900 font-medium">
                    <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Pro Tip:</strong>
                      <span>{sec.proTip}</span>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Conclusion */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h3 className="font-display font-bold text-xl text-[#111827]">Conclusion</h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {post.content.conclusion}
            </p>
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-2">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* ── AUTHOR BIO CARD ── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden relative border-2 border-[#FACC15] flex-shrink-0 shadow-md">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase text-amber-600 tracking-wider">About The Author</div>
            <h4 className="font-display font-bold text-lg text-[#111827]">{post.author.name}</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">{post.author.bio}</p>
          </div>
        </div>

        {/* ── RECOMMENDED ENGLISH CAPSULE CTA BANNER ── */}
        <div className="bg-gradient-to-br from-[#111827] via-[#1a2234] to-[#111827] rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FACC15]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Practice With Expert Mentors
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Ready to Practice What You Learned?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-normal">
              Join our certified English Capsules program with video lectures, speech drills, and accredited certificate verification.
            </p>
          </div>

          <div className="relative z-10">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
            >
              <span>Explore All English Capsules</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── RELATED ARTICLES GRID ── */}
        <div className="space-y-6 pt-4">
          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#111827]">
            More English Learning Guides
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((rPost) => (
              <Link
                key={rPost.slug}
                href={`/blog/${rPost.slug}`}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-[#FACC15] overflow-hidden shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
                    {rPost.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-[#111827] group-hover:text-amber-600 transition-colors line-clamp-2">
                    {rPost.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-semibold">
                  <span>{rPost.readTime}</span>
                  <span className="text-amber-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Read <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <EnglishFooter />
    </div>
  );
}
