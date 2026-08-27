'use client';

import Navigation from '@/components/Navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function EnvironmentPage() {
    const t = useTranslations('environment');

    return (
        <div className="flex-1 bg-white">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {t('pageTitle')}
                    </h1>
                    <h2 className="text-xl font-bold text-gray-900 my-2">
                        {t('electricalEquipment.heading')}
                    </h2>
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            {t('electricalEquipment.paragraph1')}
                        </p>
                        <Image
                            src="https://media.sound-service.eu/shop/images/logos/tonne1.png"
                            width={80}
                            height={200}
                            className='my-4'
                            alt="Not for domestic disposal"
                        />

                        <p className="text-gray-600 mb-6">
                            {t('electricalEquipment.paragraph2')}
                        </p>
                        <p className="text-gray-600 mb-6">
                            {t('electricalEquipment.paragraph3')}
                        </p>
                        <p className="text-gray-600 mb-6">
                            {t('electricalEquipment.paragraph4')}
                        </p>
                        <h2 className="text-xl font-bold text-gray-900 my-2">
                            {t('batteries.heading')}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {t('batteries.paragraph1')}
                        </p>
                        <Image
                            src="https://media.sound-service.eu/shop/images/logos/tonne2.png"
                            width={80}
                            height={100}
                            alt="Not for domestic disposal"
                            className='my-4'
                        />
                        <p className="text-gray-600 mb-6">
                            {t('batteries.paragraph2')}
                        </p>
                        <p className="text-gray-600 mb-6">
                            {t('batteries.paragraph3')}
                        </p>
                        <h2 className="text-xl font-bold text-gray-900 my-2">
                            {t('packaging.heading')}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {t('packaging.paragraph1')}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
