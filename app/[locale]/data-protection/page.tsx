'use client';

import Navigation from '@/components/Navigation';
import { useTranslations } from 'next-intl';
import { Shield, Lock, Eye, Database, FileText, Mail } from 'lucide-react';

export default function DataProtectionPage() {
  const t = useTranslations('dataProtection');

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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700 mb-2">
                    {t('intro')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('lastUpdated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('section1.heading')}
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="font-semibold text-gray-900 mb-2">{t('section1.company')}</p>
                <p className="text-gray-600 mb-1">{t('section1.address')}</p>
                <p className="text-gray-600 mb-1">{t('section1.phone')}: +49 (0)30 707 130-0</p>
                <p className="text-gray-600 mb-1">{t('section1.fax')}: +49 (0)30 707 130-189</p>
                <p className="text-gray-600 mb-4">{t('section1.email')}: info@sound-service.eu</p>
                <p className="font-semibold text-gray-900 mt-4 mb-1">{t('section1.dpoTitle')}: {t('section1.dpoName')}</p>
                <p className="text-gray-600">{t('section1.email')}: {t('section1.dpoContact')}</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-6 h-6" />
                {t('section2.heading')}
              </h2>
              <p className="text-gray-700 mb-3">{t('section2.intro')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-3">
                <li>{t('section2.items.0')}</li>
                <li>{t('section2.items.1')}</li>
                <li>{t('section2.items.2')}</li>
                <li>{t('section2.items.3')}</li>
                <li>{t('section2.items.4')}</li>
              </ul>
              <p className="text-sm text-gray-500 italic">{t('section2.legalBasis')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('section3.heading')}
              </h2>
              <p className="text-gray-600 mb-4">{t('section3.text')}</p>
              <p className="text-gray-600 mb-4">{t('section3.userControl')}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> {t('section3.note')}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('section4.heading')}
              </h2>
              <p className="text-gray-600 mb-3">{t('section4.text')}</p>
              <p className="text-sm text-gray-500 italic">{t('section4.legalBasisA')}; {t('section4.legalBasisB')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('section5.heading')}
              </h2>
              <p className="text-gray-600">{t('section5.text')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('section6.heading')}
              </h2>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('section6.newsletter.title')}</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>{t('section6.newsletter.items.0')}</li>
                    <li>{t('section6.newsletter.items.1')}</li>
                    <li>{t('section6.newsletter.items.2')}</li>
                    <li>{t('section6.newsletter.items.3')}</li>
                  </ul>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('section6.email.title')}</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>{t('section6.email.items.0')}</li>
                    <li>{t('section6.email.items.1')}</li>
                    <li>{t('section6.email.items.2')}</li>
                  </ul>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('section6.postal.title')}</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>{t('section6.postal.items.0')}</li>
                    <li>{t('section6.postal.items.1')}</li>
                    <li>{t('section6.postal.items.2')}</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('section7.heading')}
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{t('section7.youtube.title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-3">
                  <li>{t('section7.youtube.items.0')}</li>
                  <li>{t('section7.youtube.items.1')}</li>
                  <li>{t('section7.youtube.items.2')}</li>
                  <li>{t('section7.youtube.items.3')}</li>
                  <li>{t('section7.youtube.items.4')}</li>
                </ul>
                <p className="text-sm text-gray-600 mb-2">{t('section7.youtube.note')}</p>
                <p className="text-sm text-gray-500">
                  <a href={t('section7.youtube.reference')} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {t('section7.youtube.reference')}
                  </a>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6" />
                {t('section8.heading')}
              </h2>
              <p className="text-gray-600 mb-4">
                {t('section8.intro')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('section8.encryption.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section8.encryption.text')}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('section8.accessControl.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section8.accessControl.text')}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('section8.audits.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section8.audits.text')}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('section8.storage.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section8.storage.text')}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                {t('section9.heading')}
              </h2>
              <p className="text-gray-600 mb-4">
                {t('section9.intro')}
              </p>
              <div className="space-y-3">
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('section9.access.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section9.access.text')}
                  </p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('section9.rectification.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section9.rectification.text')}
                  </p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('section9.erasure.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section9.erasure.text')}
                  </p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('section9.restriction.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section9.restriction.text')}
                  </p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('section9.portability.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section9.portability.text')}
                  </p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <h3 className="font-semibold text-gray-900">{t('section9.object.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('section9.object.text')}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section10.heading')}</h2>
              <p className="text-gray-600">
                {t('section10.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section11.heading')}</h2>
              <p className="text-gray-600 mb-4">
                {t('section11.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6" />
                {t('section12.heading')}
              </h2>
              <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  {t('section12.intro')}
                </p>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">{t('section12.title')}</p>
                  <p className="text-gray-600 mb-1">{t('section12.company')}</p>
                  <p className="text-gray-600 mb-1">{t('section12.address')}</p>
                  <p className="text-gray-600 mb-3">{t('section12.city')}</p>
                  <p className="text-gray-600">
                    {t('section12.emailLabel')}: <a href={`mailto:${t('section1.dpoContact')}`} className="text-brand hover:text-brand/80 font-semibold">{t('section1.dpoContact')}</a>
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section13.heading')}</h2>
              <p className="text-gray-600">
                {t('section13.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section14.heading')}</h2>
              <p className="text-gray-600">
                {t('section14.text')}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
