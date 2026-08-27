'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Slide } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';

// Convert YouTube URL to embed format
const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&loading=lazy` : '';
};

const HeroSlider = () => {
    const t = useTranslations('heroSlider');
    const locale = useLocale();
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [videoErrors, setVideoErrors] = useState<Record<number, boolean>>({});

    // Helper function to get caption for current locale
    const getLocalizedCaption = (slide: Slide): string | null | undefined => {
        switch (locale) {
            case 'de':
                return slide.caption_de;
            case 'nl':
                return slide.caption_nl;
            case 'pl':
                return slide.caption_pl;
            case 'fr':
                return slide.caption_fr;
            case 'en':
            default:
                return slide.caption_en;
        }
    };

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const data = await api.getSlides();
                setSlides(data);
            } catch (error) {
                console.error('Failed to fetch slides:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSlides();
    }, []);

    const handleVideoError = (slideId: number) => {
        setVideoErrors(prev => ({ ...prev, [slideId]: true }));
    };

    if (loading) {
        return (
            <div className="w-full h-96 md:h-[600px] mb-12 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">{t('loading')}</p>
            </div>
        );
    }

    if (slides.length === 0) {
        return null;
    }

    return (
        <div className="w-full h-96 md:h-[600px] mb-12">
            <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={0}
                slidesPerView={1}
                className="h-full rounded-lg"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative h-full flex items-center justify-center overflow-hidden">
                            {!videoErrors[slide.id] && slide.video ? (
                                <iframe
                                    src={getYouTubeEmbedUrl(slide.video)}
                                    className="absolute inset-0 w-[200%] h-[200%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    allow="autoplay; encrypted-media"
                                    loading="lazy"
                                    onError={() => handleVideoError(slide.id)}
                                    title={slide.title || 'Slide'}
                                />
                            ) : slide.background ? (
                                <Image
                                    src={slide.background}
                                    alt={slide.title || 'Hero'}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : null}
                            <div className="relative z-10 flex flex-col gap-6 p-14 bg-black/60  w-full h-full justify-center items-start">
                                {slide.title && <h1 className='text-4xl text-white font-bold'>{slide.title}</h1>}
                                {getLocalizedCaption(slide) && <p className='text-md text-white md:w-1/2'>{getLocalizedCaption(slide)}</p>}
                                {slide.link && <Link href={slide.link} className='px-4 py-2 bg-brand hover:bg-sky-600 text-white rounded-sm'>{t('findOutMore')}</Link>}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default HeroSlider
