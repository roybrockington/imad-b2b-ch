'use client';

import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { api, User, Slide } from '@/lib/api';
import { Trash2, Plus, Eye, EyeOff, Edit, Save, X, GripVertical } from 'lucide-react';

export default function AdminSlidesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    caption_en: '',
    caption_de: '',
    caption_nl: '',
    caption_pl: '',
    caption_fr: '',
    background: '',
    video: '',
    link: '',
    order: 0,
    active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await api.getCurrentUser();

        if (!userData.roles || !userData.roles.includes('Admin')) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        setUser(userData);

        const slidesData = await api.getAdminSlides();
        setSlides(slidesData);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || '',
      caption_en: slide.caption_en || '',
      caption_de: slide.caption_de || '',
      caption_nl: slide.caption_nl || '',
      caption_pl: slide.caption_pl || '',
      caption_fr: slide.caption_fr || '',
      background: slide.background || '',
      video: slide.video || '',
      link: slide.link || '',
      order: slide.order,
      active: slide.active,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSlide(null);
    setFormData({
      title: '',
      caption_en: '',
      caption_de: '',
      caption_nl: '',
      caption_pl: '',
      caption_fr: '',
      background: '',
      video: '',
      link: '',
      order: slides.length,
      active: true,
    });
  };

  const handleCancel = () => {
    setEditingSlide(null);
    setIsCreating(false);
    setFormData({
      title: '',
      caption_en: '',
      caption_de: '',
      caption_nl: '',
      caption_pl: '',
      caption_fr: '',
      background: '',
      video: '',
      link: '',
      order: 0,
      active: true,
    });
  };

  const handleSave = async () => {
    try {
      if (editingSlide) {
        const updated = await api.updateSlide(editingSlide.id, formData);
        setSlides(slides.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await api.createSlide(formData);
        setSlides([...slides, created]);
      }
      handleCancel();
    } catch (error) {
      console.error('Failed to save slide:', error);
      alert('Failed to save slide');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this slide?')) {
      return;
    }

    try {
      await api.deleteSlide(id);
      setSlides(slides.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete slide:', error);
      alert('Failed to delete slide');
    }
  };

  const toggleActive = async (slide: Slide) => {
    try {
      const updated = await api.updateSlide(slide.id, { active: !slide.active });
      setSlides(slides.map(s => s.id === updated.id ? updated : s));
    } catch (error) {
      console.error('Failed to toggle slide status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex-1 bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                You do not have permission to access this page.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Slides</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create New Slide
          </button>
        </div>

        {/* Edit/Create Form */}
        {(editingSlide || isCreating) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSlide ? 'Edit Slide' : 'Create New Slide'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (EN)
                </label>
                <textarea
                  value={formData.caption_en}
                  onChange={(e) => setFormData({ ...formData, caption_en: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (DE)
                </label>
                <textarea
                  value={formData.caption_de}
                  onChange={(e) => setFormData({ ...formData, caption_de: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (NL)
                </label>
                <textarea
                  value={formData.caption_nl}
                  onChange={(e) => setFormData({ ...formData, caption_nl: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (PL)
                </label>
                <textarea
                  value={formData.caption_pl}
                  onChange={(e) => setFormData({ ...formData, caption_pl: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (FR)
                </label>
                <textarea
                  value={formData.caption_fr}
                  onChange={(e) => setFormData({ ...formData, caption_fr: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="text"
                  value={formData.video}
                  onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slides List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {slides.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No slides yet. Create your first slide!</p>
            ) : (
              <div className="space-y-4">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-brand transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <GripVertical className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {slide.title || '(No title)'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Order: {slide.order} • {slide.active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleActive(slide)}
                              className="p-2 text-gray-600 hover:text-brand transition-colors"
                              title={slide.active ? 'Deactivate' : 'Activate'}
                            >
                              {slide.active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                            <button
                              onClick={() => handleEdit(slide)}
                              className="p-2 text-gray-600 hover:text-brand transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(slide.id)}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        {(slide.caption_en || slide.caption_de || slide.caption_nl || slide.caption_pl || slide.caption_fr) && (
                          <div className="text-sm text-gray-600 mb-2 space-y-1">
                            {slide.caption_en && <div><strong>EN:</strong> {slide.caption_en}</div>}
                            {slide.caption_de && <div><strong>DE:</strong> {slide.caption_de}</div>}
                            {slide.caption_nl && <div><strong>NL:</strong> {slide.caption_nl}</div>}
                            {slide.caption_pl && <div><strong>PL:</strong> {slide.caption_pl}</div>}
                            {slide.caption_fr && <div><strong>FR:</strong> {slide.caption_fr}</div>}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 space-y-1">
                          {slide.background && <div>Background: {slide.background}</div>}
                          {slide.video && <div>Video: {slide.video}</div>}
                          {slide.link && <div>Link: {slide.link}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
