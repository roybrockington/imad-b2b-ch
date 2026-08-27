'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

interface BlogPost {
  id: number;
  title: string;
  date: string;
  content: string;
  thumb: string;
  link: string;
}

export default function BlogExcerpts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations('home');

  // Helper function to decode HTML entities
  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Use German endpoint for 'de' locale, English endpoint for all others
        const apiEndpoint = locale === 'de'
          ? 'https://blog.sound-service.eu/wp-json/api/v1/news/de'
          : 'https://blog.sound-service.eu/wp-json/api/v1/news/en';

        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data = await response.json();
        // Get first 6 posts
        setPosts(data.slice(0, 6));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [locale]);

  if (loading) {
    return (
      <div className="w-full bg-gray-50 h-96 flex items-center justify-center mb-20">
        <p className="text-lg text-gray-600">Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-50 h-96 flex items-center justify-center mb-20">
        <p className="text-lg text-red-600">Failed to load blog posts</p>
      </div>
    );
  }

  return (
    <div className="w-full mb-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('latestNews')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative w-full h-56">
              <Image
                src={post.thumb}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                {decodeHtmlEntities(post.title)}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {decodeHtmlEntities(post.content)}
              </p>
              <p className="text-xs text-gray-500">
                {post.date}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
