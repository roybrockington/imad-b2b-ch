'use client';

import Navigation from '@/components/Navigation';
import { Building2, Mail, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ImprintPage() {
  const t = useTranslations('imprint');

  return (
    <div className="flex-1 bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {t('title')}
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                {t('companyInfo.heading')}
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3">
                <p className="text-gray-900 font-semibold text-lg">
                  {t('companyInfo.companyName')}
                </p>
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{t('companyInfo.address')}</p>
                    <p>{t('companyInfo.postalCode')}</p>
                    <p>{t('companyInfo.country')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contactDetails.heading')}</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a href={`mailto:${t('contactDetails.email')}`} className="text-brand hover:text-brand/80">
                    {t('contactDetails.email')}
                  </a>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('management.heading')}</h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{t('management.ceo')}:</p>
                  <p>{t('management.ceoName')}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{t('management.court')}:</p>
                  <p>{t('management.courtName')}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{t('management.registrationNumber')}:</p>
                  <p>{t('management.registrationNumberValue')}</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('tax.heading')}</h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{t('tax.vatId')}:</p>
                  <p>{t('tax.vatIdValue')}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{t('tax.wIdNr')}:</p>
                  <p>{t('tax.wIdNrValue')}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{t('tax.weeeNumber')}:</p>
                  <p>{t('tax.weeeNumberValue')}</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('responsible.heading')}</h2>
              <p className="text-gray-600">
                {t('responsible.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dispute.heading')}</h2>
              <p className="text-gray-600 mb-4">
                {t('dispute.text1')}
                <a href={t('dispute.linkUrl')} target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand/80 ml-1">
                  {t('dispute.linkUrl')}
                </a>
              </p>
              <p className="text-gray-600">
                {t('dispute.text2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('intellectualProperty.heading')}</h2>
              <p className="text-gray-600">
                {t('intellectualProperty.text')}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
