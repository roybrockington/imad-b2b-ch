'use client';

import Navigation from "@/components/Navigation";
import HeroSlider from "@/components/HeroSlider";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import { CircleCheckIcon } from "lucide-react";
import BlogExcerpts from "@/components/BlogExcerpts";
import TopBrandsCarousel from "@/components/TopBrandsCarousel";

const aboutUsKeys = [
  { key: 'modernLogistics', image: 'imad-persoenlich.jpg' },
  { key: 'heartOfEurope', image: 'imad-standort.jpg' },
  { key: 'salesServiceTeams', image: 'imad-service.jpg' }
];

const checkmarksKeys = [
  'leadingInEurope',
  'excellentStock',
  'modernLogistics',
  'internationalSales',
  'serviceTeams',
  'exclusiveProducts'
]


export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="flex-1 bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white">
        <HeroSlider />
        <h1 className="text-3xl font-bold text-gray-900">
          {t('mainTitle')}
        </h1>
        <h2 className="text-xl text-gray-800">{t('mainSubtitle')}</h2>
        <ul className="flex flex-col md:flex-row w-full gap-4 my-8">
          {aboutUsKeys.map(item =>
            <li className="md:w-1/3 flex flex-col gap-4" key={item.key}>
              <h3 className="text-lg font-bold text-gray-900">{t(`aboutUs.${item.key}.title`)}</h3>
              <Image src={`https://media.sound-service.eu/images/imad/home/${item.image}`} alt={t(`aboutUs.${item.key}.title`)} height={500} width={400} className="w-full rounded-lg" />
              <p className="text-gray-700">{t(`aboutUs.${item.key}.text`)}</p>
            </li>
          )}
        </ul>
        {/* Top Brands*/}
        <TopBrandsCarousel />
        {/* Blog excerpts */}
        <BlogExcerpts />
        <h2 className="text-3xl font-bold text-gray-900">
          {t('heading1')}
        </h2>
        <h3 className="text-xl mb-8 text-gray-800">
          {t('heading2')}
        </h3>
        <div className="w-full flex-col md:flex-row flex gap-10">
          <div className="md:w-1/2 flex flex-col gap-4">
            <p className="text-gray-700">
              {t('paragraph1')}
            </p>
            <p className="text-gray-700">
              {t('paragraph2')}
            </p>
            <p className="text-gray-700">
              {t('paragraph3')}
            </p>
          </div>
          <div className="md:w-1/2 flex flex-col gap-4">
            <p className="text-gray-700">
              {t('paragraph4')}
            </p>
            <p className="text-gray-700">
              {t('paragraph5')}
            </p>
            <p className="font-bold text-gray-900">
              {t('paragraph6')}
            </p>
          </div>
        </div>

        {/* Checkmarks */}
        <div className="text-lg text-brand w-full flex items-center justify-center mt-20 rounded p-2 border border-brand">
          <ul className="flex justify-around gap-2 md:gap-0 flex-wrap text-sm font-bold w-full px-4">
            {checkmarksKeys.map(key =>
              <li className="flex gap-2 items-center" key={key}><CircleCheckIcon className="w-4 h-4" /> {t(`checkmarks.${key}`)} </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
