'use client';

import Navigation from '@/components/Navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { api, Brand, Territory } from '@/lib/api';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

// Dynamically import the map component to avoid SSR issues with Leaflet
const EuropeMap = dynamic(() => import('@/components/EuropeMap'), {
  ssr: false,
  loading: () => {
    const t = useTranslations('salesAreas');
    return <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center"><p className="text-gray-500">{t('loadingMap')}</p></div>;
  }
});

export default function SalesAreasPage() {
  const locale = useLocale();
  const t = useTranslations('salesAreas');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch brands and territories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsData, territoriesData] = await Promise.all([
          api.getBrands(),
          api.getTerritories()
        ]);
        setBrands(brandsData);
        setTerritories(territoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create a mapping from brand code to brand name
  const brandCodeToName = brands.reduce((acc, brand) => {
    acc[brand.code] = brand.name;
    return acc;
  }, {} as Record<string, string>);

  // Transform territories data to group by brands
  const brandsByCountries = territories.reduce((acc, territory) => {
    territory.brands.forEach((brand) => {
      if (!acc[brand]) {
        acc[brand] = [];
      }
      acc[brand].push(territory.country);
    });
    return acc;
  }, {} as Record<string, string[]>);

  // Sort brands alphabetically
  const sortedBrands = Object.keys(brandsByCountries).sort();

  return (
    <div className="flex-1 bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('pageTitle')}</h1>
        <p className="text-gray-600 mb-3">
          {t('intro1')}
        </p>
        <p className="text-gray-600 mb-6">
          {t('intro2')} <Link className='text-brand' href={`/${locale}/contact`}>{t('intro2Link')}</Link>{t('intro2Continued')}
        </p>
        {loading ? (
          <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">{t('loadingMap')}</p>
          </div>
        ) : (
          <EuropeMap territories={territories} brandCodeToName={brandCodeToName} />
        )}

        {/* Brands grid with countries below the map */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('regionsByBrand')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedBrands.map((brand) => (
              <div key={brand} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-16 mb-3 bg-white">
                  <img
                    src={`https://media.sound-service.eu/images/brands/${brand}.jpg`}
                    alt={brand}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      // Fallback to brand name if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.brand-name-fallback')) {
                        const textNode = document.createElement('span');
                        textNode.className = 'brand-name-fallback font-bold text-lg text-brand';
                        textNode.textContent = brand;
                        parent.appendChild(textNode);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mb-2 text-center">{t('availableIn')} {brandsByCountries[brand].length} {t('countries')}:</p>
                <div className="flex flex-wrap gap-1">
                  {brandsByCountries[brand].map((country) => (
                    <span
                      key={country}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
