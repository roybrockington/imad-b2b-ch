'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, Article } from '@/lib/api';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import parse from 'html-react-parser';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const articleData = await api.getArticle(slug);
        setArticle(articleData);
      } catch (error) {
        console.error('Failed to fetch article:', error);
        router.push(`/${locale}/news`);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, locale, router]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <button
            onClick={() => router.push(`/${locale}/news`)}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back button */}
        <button
          onClick={() => router.push(`/${locale}/news`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to News
        </button>

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="w-full aspect-video mb-8 rounded-lg overflow-hidden bg-gray-200">
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <time dateTime={article.published_at || ''}>
              {formatDate(article.published_at)}
            </time>
          </div>
          {article.author && (
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>{article.author.name}</span>
            </div>
          )}
        </div>

        {/* Brands */}
        {article.brands && article.brands.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.brands.map(brand => (
              <span
                key={brand.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {brand.name}
              </span>
            ))}
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="text-xl text-gray-700 mb-8 pb-8 border-b border-gray-200 italic">
            {article.excerpt}
          </div>
        )}

        {/* Body Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-p:mb-4 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-lg">
          {parse(article.body)}
        </div>

        {/* Back to news button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={() => router.push(`/${locale}/news`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={20} />
            Back to all articles
          </button>
        </div>
      </article>
    </div>
  );
}
