'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import TiptapEditor from '@/components/TiptapEditor';
import { api, User } from '@/lib/api';
import { Briefcase, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateCareerPage() {
  const router = useRouter();
  const locale = useLocale();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    position: '',
    start_date: '',
    location: '',
    tasks: '',
    profile: '',
    expectations: '',
    published: false,
  });

  // Fetch current user and check permissions
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = api.getToken();
        if (!token) {
          router.push(`/${locale}/login`);
          return;
        }

        const user = await api.getCurrentUser();
        const roles = user.roles || [];

        if (!roles.includes('Admin') && !roles.includes('Staff')) {
          router.push(`/${locale}`);
          return;
        }

        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push(`/${locale}/login`);
      }
    };

    fetchUser();
  }, [locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Map form data to German fields (default language for admin input)
      const createData = {
        start_date: formData.start_date,
        location: formData.location,
        published: formData.published,
        position_de: formData.position,
        tasks_de: formData.tasks,
        profile_de: formData.profile,
        expectations_de: formData.expectations,
      };
      await api.createCareer(createData);
      router.push(`/${locale}/admin/careers`);
    } catch (error: any) {
      console.error('Failed to create career:', error);
      setError(error.message || 'Failed to create career listing');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/${locale}/admin/careers`}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8" />
              Create New Career Listing
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Add a new job opportunity to your careers page
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
              Position Title *
            </label>
            <input
              type="text"
              id="position"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder="e.g., Senior Product Manager"
            />
          </div>

          {/* Location and Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="e.g., Berlin, Germany"
              />
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>
          </div>

          {/* Tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasks & Responsibilities *
            </label>
            <TiptapEditor
              content={formData.tasks}
              onChange={(content) => setFormData({ ...formData, tasks: content })}
              placeholder="Describe the main tasks and responsibilities for this position..."
            />
          </div>

          {/* Profile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate Profile *
            </label>
            <TiptapEditor
              content={formData.profile}
              onChange={(content) => setFormData({ ...formData, profile: content })}
              placeholder="Describe the ideal candidate profile, skills, and qualifications..."
            />
          </div>

          {/* Expectations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What We Expect *
            </label>
            <TiptapEditor
              content={formData.expectations}
              onChange={(content) => setFormData({ ...formData, expectations: content })}
              placeholder="List what you expect from candidates..."
            />
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-5 h-5 text-brand border-gray-300 rounded focus:ring-brand"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Publish immediately
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Creating...' : 'Create Career Listing'}
            </button>
            <Link
              href={`/${locale}/admin/careers`}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
