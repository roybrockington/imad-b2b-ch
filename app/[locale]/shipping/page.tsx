'use client';

import Navigation from '@/components/Navigation';
import { Truck, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ShippingPage() {
  const t = useTranslations('shipping');

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
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-6 h-6" />
                {t('shippingMethods.heading')}
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  {t('shippingMethods.description')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li><strong>{t('shippingMethods.dhl').split(':')[0]}:</strong> {t('shippingMethods.dhl').split(':')[1]}</li>
                  <li><strong>{t('shippingMethods.forwarding').split(':')[0]}:</strong> {t('shippingMethods.forwarding').split(':')[1]}</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6" />
                {t('standardShipping.heading')}
              </h2>

              {/* Zone 1 */}
              <div className="mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{t('standardShipping.zone1.name')}</h3>
                    <span className="text-2xl font-bold text-brand">{t('standardShipping.zone1.cost')}</span>
                  </div>
                  <div className="text-gray-600">
                    <p className="font-semibold mb-2">{t('standardShipping.countriesLabel')}</p>
                    <p className="leading-relaxed">{t('standardShipping.zone1.countries')}</p>
                  </div>
                </div>
              </div>

              {/* Zone 2 */}
              <div className="mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{t('standardShipping.zone2.name')}</h3>
                    <span className="text-2xl font-bold text-brand">{t('standardShipping.zone2.cost')}</span>
                  </div>
                  <div className="text-gray-600">
                    <p className="font-semibold mb-2">{t('standardShipping.countriesLabel')}</p>
                    <p className="leading-relaxed">{t('standardShipping.zone2.countries')}</p>
                  </div>
                </div>
              </div>

              {/* Zone 3 */}
              <div className="mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{t('standardShipping.zone3.name')}</h3>
                    <span className="text-2xl font-bold text-brand">{t('standardShipping.zone3.cost')}</span>
                  </div>
                  <div className="text-gray-600">
                    <p className="font-semibold mb-2">{t('standardShipping.countriesLabel')}</p>
                    <p className="leading-relaxed">{t('standardShipping.zone3.countries')}</p>
                    <p className="mt-3 text-sm bg-blue-50 border border-blue-200 rounded p-2">
                      <strong>Note:</strong> {t('standardShipping.zone3.note')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('forwardingAgency.heading')}
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  {t('forwardingAgency.description')}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white rounded p-3">
                    <span className="text-gray-700 font-medium">{t('forwardingAgency.mostEuropean')}</span>
                    <span className="text-xl font-bold text-brand">€30.00</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded p-3">
                    <span className="text-gray-700 font-medium">{t('forwardingAgency.uk')}</span>
                    <span className="text-xl font-bold text-brand">€33.00</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('currency.heading')}</h2>
              <p className="text-gray-600 mb-4">
                {t('currency.description')}
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 font-mono">
                  {t('currency.currencies')}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('additionalInfo.heading')}</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('additionalInfo.item1')}</li>
                  <li>{t('additionalInfo.item2')}</li>
                  <li>{t('additionalInfo.item3')}</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="font-semibold text-gray-900 mb-2">{t('questions.heading')}</p>
                <p className="text-gray-600">
                  {t('questions.email')} <a href="mailto:sales@sound-service.eu" className="text-brand hover:text-brand/80 font-medium">sales@sound-service.eu</a><br />
                  {t('questions.phone')} <a href="tel:+49220444960" className="text-brand hover:text-brand/80 font-medium">+49 2204 4496-0</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
