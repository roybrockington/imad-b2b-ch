'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import TiptapEditor from '@/components/TiptapEditor';
import { api, Article, Brand } from '@/lib/api';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function ArticleEditorPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const articleId = params.id === 'new' ? null : parseInt(params.id as string);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();

      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }

      try {
        const user = await api.getCurrentUser();

        if (!user.roles?.includes('Admin')) {
          router.push(`/${locale}`);
          return;
        }

        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push(`/${locale}/login`);
      }
    };

    checkAuth();
  }, [locale, router]);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      if (!currentUser) return;

      try {
        const brandsData = await api.getAdminBrands();
        setBrands(brandsData);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      }
    };

    fetchBrands();
  }, [currentUser]);

  // Fetch article if editing
  useEffect(() => {
    const fetchArticle = async () => {
      if (!currentUser || !articleId) {
        setLoading(false);
        return;
      }

      try {
        const article = await api.getAdminArticle(articleId);
        setTitle(article.title);
        setSlug(article.slug);
        setExcerpt(article.excerpt || '');
        setBody(article.body);
        setPublished(article.published);
        setPublishedAt(article.published_at || '');
        setSelectedBrandIds(article.brands?.map(b => b.id) || []);

        if (article.featured_image_url) {
          setFeaturedImagePreview(article.featured_image_url);
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
        alert('Failed to load article');
        router.push(`/${locale}/admin/articles`);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [currentUser, articleId, locale, router]);

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const result = await api.uploadArticleImage(file);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const baseUrl = apiUrl.replace('/api', '');
      return `${baseUrl}/storage/${result.path}`;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  };

  const handleBrandToggle = (brandId: number) => {
    setSelectedBrandIds(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('excerpt', excerpt);
      formData.append('body', body);
      formData.append('published', published ? '1' : '0');

      if (publishedAt) {
        formData.append('published_at', publishedAt);
      }

      if (featuredImage) {
        formData.append('featured_image', featuredImage);
      }

      selectedBrandIds.forEach(brandId => {
        formData.append('brand_ids[]', brandId.toString());
      });

      if (articleId) {
        await api.updateArticle(articleId, formData);
        alert('Article updated successfully');
      } else {
        await api.createArticle(formData);
        alert('Article created successfully');
      }

      router.push(`/${locale}/admin/articles`);
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/${locale}/admin/articles`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">
          {articleId ? 'Edit Article' : 'New Article'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL-friendly, leave empty to auto-generate)
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt (short summary)
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image
            </label>
            <div className="mt-2 flex items-center gap-4">
              {featuredImagePreview && (
                <div className="relative w-48 h-32">
                  <img
                    src={featuredImagePreview}
                    alt="Featured"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <ImageIcon size={20} />
                {featuredImagePreview ? 'Change Image' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Content *
            </label>
            <TiptapEditor
              content={body}
              onChange={setBody}
              onImageUpload={handleImageUpload}
              placeholder="Write your article content here..."
            />
          </div>

          {/* Brands */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Brands
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-4 border border-gray-300 rounded-lg">
              {brands.map(brand => (
                <label key={brand.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrandIds.includes(brand.id)}
                    onChange={() => handleBrandToggle(brand.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Publishing Options */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Publishing Options</h3>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Publish article</span>
            </label>

            <div>
              <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-700 mb-1">
                Publication Date (optional)
              </label>
              <input
                type="datetime-local"
                id="publishedAt"
                value={publishedAt ? new Date(publishedAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Article'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/admin/articles`)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
