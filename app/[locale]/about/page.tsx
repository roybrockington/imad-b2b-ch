'use client';

import Navigation from '@/components/Navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AboutPage() {
    const t = useTranslations('about');

    return (
        <div className="flex-1 bg-white">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900">
                        {t('title')}
                    </h1>

                    <div className="relative w-full h-80 my-6">
                        <Image
                            src='/flags.jpg'
                            alt='Sound Service Europe'
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            {t('paragraph1')}
                        </p>

                        <p className="text-gray-600 mb-6">
                            {t('paragraph2')}
                        </p>
                        <p className="text-gray-600 mb-6 font-bold">
                            {t('paragraph3')}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
