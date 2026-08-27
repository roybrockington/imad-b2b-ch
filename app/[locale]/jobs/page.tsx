'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, Career } from '@/lib/api';
import { Briefcase, Users, TrendingUp, Heart, Mail, MapPin, Calendar, ChevronRight } from 'lucide-react';

export default function JobsPage() {
  const locale = useLocale();
  const t = useTranslations('jobs');
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true);
        const data = await api.getCareers();
        setCareers(data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch careers:', error);
        setError(error.message || 'Failed to load career opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStartDateDisplay = (dateString: string) => {
    const startDate = new Date(dateString);
    const today = new Date();

    // Set time to midnight for accurate comparison
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // If start date is today or in the past, show "immediately"
    if (startDate <= today) {
      return t('currentOpenings.immediately');
    }

    return formatDate(dateString);
  };

  // Get localized field value based on current locale
  const getLocalizedField = (career: Career, field: 'position' | 'tasks' | 'profile' | 'expectations'): string => {
    const fieldKey = `${field}_${locale}` as keyof Career;
    const localizedValue = career[fieldKey];

    // Return localized value if it exists, otherwise fall back to English
    if (localizedValue && typeof localizedValue === 'string') {
      return localizedValue;
    }

    // Fallback to English
    const fallbackKey = `${field}_en` as keyof Career;
    const fallbackValue = career[fallbackKey];
    return (fallbackValue && typeof fallbackValue === 'string') ? fallbackValue : '';
  };

  return (
    <div className="flex-1 bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {t('pageTitle')}
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-lg text-gray-700 mb-4">
                  {t('intro.paragraph1')}
                </p>
                <p className="text-gray-600">
                  {t('intro.paragraph2')}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                {t('whyWorkWithUs.heading')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <Users className="w-8 h-8 text-brand mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-2">{t('whyWorkWithUs.teamCulture.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('whyWorkWithUs.teamCulture.description')}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <TrendingUp className="w-8 h-8 text-brand mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-2">{t('whyWorkWithUs.careerDevelopment.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('whyWorkWithUs.careerDevelopment.description')}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <Briefcase className="w-8 h-8 text-brand mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-2">{t('whyWorkWithUs.industryLeader.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('whyWorkWithUs.industryLeader.description')}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-brand mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-2">{t('whyWorkWithUs.benefits.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('whyWorkWithUs.benefits.description')}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('currentOpenings.heading')}</h2>

              {loading ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-center">{t('currentOpenings.loading')}</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-red-800">
                    <strong>{t('currentOpenings.error')}:</strong> {error}
                  </p>
                </div>
              ) : careers.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-gray-700">
                    {t('currentOpenings.noOpenings')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {careers.map((career) => (
                    <div
                      key={career.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-brand hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-brand" />
                            {getLocalizedField(career, 'position')}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {career.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {t('currentOpenings.startDate')}: {getStartDateDisplay(career.start_date)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{t('currentOpenings.tasksHeading')}</h4>
                        <div
                          className="text-sm text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1"
                          dangerouslySetInnerHTML={{ __html: getLocalizedField(career, 'tasks') }}
                        />
                      </div>

                      {/* Profile */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{t('currentOpenings.profileHeading')}</h4>
                        <div
                          className="text-sm text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1"
                          dangerouslySetInnerHTML={{ __html: getLocalizedField(career, 'profile') }}
                        />
                      </div>

                      {/* Expectations */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{t('currentOpenings.expectationsHeading')}</h4>
                        <div
                          className="text-sm text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1"
                          dangerouslySetInnerHTML={{ __html: getLocalizedField(career, 'expectations') }}
                        />
                      </div>

                      {/* Apply Button */}
                      <div className="pt-4 border-t border-gray-200">
                        <a
                          href={`mailto:hr@sound-service.eu?subject=Application for ${encodeURIComponent(getLocalizedField(career, 'position'))}`}
                          className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
                        >
                          {t('currentOpenings.applyButton')}
                          <ChevronRight className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('hiringAreas.heading')}</h2>
              <div className="space-y-3">
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('hiringAreas.sales.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('hiringAreas.sales.description')}
                  </p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('hiringAreas.technical.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('hiringAreas.technical.description')}
                  </p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('hiringAreas.logistics.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('hiringAreas.logistics.description')}
                  </p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('hiringAreas.marketing.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('hiringAreas.marketing.description')}
                  </p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('hiringAreas.it.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('hiringAreas.it.description')}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6" />
                {t('applyNow.heading')}
              </h2>
              <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  {t('applyNow.paragraph1')}
                </p>
                <p className="text-gray-700 mb-4">
                  {t('applyNow.paragraph2')}
                </p>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">{t('applyNow.hrDepartment')}</p>
                  <p className="text-gray-600">
                    {t('applyNow.email')}: <a href="mailto:jobs@sound-service.eu" className="text-brand hover:text-brand/80 font-semibold">jobs@sound-service.eu</a>
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    {t('applyNow.note')}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('commitment.heading')}</h2>
              <p className="text-gray-600">
                {t('commitment.text')}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
