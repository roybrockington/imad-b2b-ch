'use client';

import Navigation from '@/components/Navigation';
import { useTranslations } from 'next-intl';

export default function TermsPage() {
    const t = useTranslations('terms');

    const renderItem = (item: string | { text: string; subitems: string[] }, index: number) => {
        if (typeof item === 'string') {
            return <li key={index}>{item}</li>;
        }
        return (
            <li key={index}>
                {item.text}
                <ul className='list-disc ml-6 mt-2'>
                    {item.subitems.map((subitem, subIndex) => (
                        <li key={subIndex}>{subitem}</li>
                    ))}
                </ul>
            </li>
        );
    };

    return (
        <div className="flex-1 bg-white">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        {t('businessTerms.title')}
                    </h1>

                    <div className="prose prose-lg max-w-none">
                        {/* Section 1 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section1.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('businessTerms.section1.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Section 2 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section2.heading')}</h2>
                            <p className="text-gray-600 mb-4 ml-8">
                                {t('businessTerms.section2.text')}
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section3.heading')}</h2>
                            <p className="text-gray-600 mb-4 ml-8">
                                {t('businessTerms.section3.text')}
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section4.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('businessTerms.section4.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Section 5 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section5.heading')}</h2>
                            <p className="text-gray-600 mb-4 ml-8">
                                {t('businessTerms.section5.text')}
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section6.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('businessTerms.section6.items') as Array<string | { text: string; subitems: string[] }>).map((item, index) =>
                                    renderItem(item, index)
                                )}
                            </ol>
                        </section>

                        {/* Section 7 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section7.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('businessTerms.section7.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Section 8 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section8.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('businessTerms.section8.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Section 9 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section9.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('businessTerms.section9.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Section 10 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section10.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('businessTerms.section10.items') as Array<string | { text: string; subitems: string[] }>).map((item, index) =>
                                    renderItem(item, index)
                                )}
                            </ol>
                        </section>

                        {/* Section 11 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('businessTerms.section11.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('businessTerms.section11.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                    </div>
                </div>

                {/* Consumer Terms Section */}
                <div className="max-w-4xl mx-auto mt-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        {t('consumerTerms.title')}
                    </h1>

                    <div className="prose prose-lg max-w-none">
                        {/* Article 1 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('consumerTerms.article1.heading')}</h2>
                            <p className="text-gray-600 mb-4 ml-8">
                                {t('consumerTerms.article1.text')}
                            </p>
                        </section>

                        {/* Article 2 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('consumerTerms.article2.heading')}</h2>
                            <p className="text-gray-600 mb-4 ml-8">
                                {t('consumerTerms.article2.text')}
                            </p>
                        </section>

                        {/* Article 3 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('consumerTerms.article3.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('consumerTerms.article3.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Article 4 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('consumerTerms.article4.heading')}</h2>
                            <p className="text-gray-600 mb-4 ml-8">
                                {t('consumerTerms.article4.text')}
                            </p>
                        </section>

                        {/* Article 5 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {t('consumerTerms.article5.heading')}
                            </h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('consumerTerms.article5.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Article 6 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('consumerTerms.article6.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('consumerTerms.article6.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Article 7 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('consumerTerms.article7.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('consumerTerms.article7.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Article 8 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('consumerTerms.article8.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('consumerTerms.article8.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                        {/* Article 9 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('consumerTerms.article9.heading')}</h2>
                            <ol className="text-gray-600 mb-4 list-decimal ml-8 flex flex-col gap-4">
                                {(t.raw('consumerTerms.article9.items') as string[]).map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}
