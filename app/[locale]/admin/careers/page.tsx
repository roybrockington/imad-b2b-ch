'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, User, Career } from '@/lib/api';
import { Briefcase, Plus, Edit, Trash2, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AdminCareersPage() {
  const router = useRouter();
  const locale = useLocale();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch careers
  useEffect(() => {
    if (!currentUser) return;

    const fetchCareers = async () => {
      try {
        setLoading(true);
        const data = await api.getAdminCareers();
        setCareers(data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch careers:', error);
        setError(error.message || 'Failed to load careers');
        setCareers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, [currentUser]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this career listing?')) return;

    try {
      await api.deleteCareer(id);
      setCareers(careers.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete career:', error);
      alert('Failed to delete career listing');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8" />
              Career Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage job listings and career opportunities
            </p>
          </div>
          <Link
            href={`/${locale}/admin/careers/create`}
            className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Position
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Careers List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">Loading careers...</p>
          </div>
        ) : careers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">No career listings yet</p>
            <p className="text-gray-500 mb-6">Create your first job posting to get started</p>
            <Link
              href={`/${locale}/admin/careers/create`}
              className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Position
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {careers.map((career) => (
                    <tr key={career.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {career.position_de || career.position_en || 'No position title'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {career.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(career.start_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          career.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {career.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/${locale}/admin/careers/${career.id}/edit`}
                            className="text-brand hover:text-brand/80"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(career.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
