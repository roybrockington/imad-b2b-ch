'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

const topBrands = [
  { code: 'Zoom', image: 'Zoom-Brand-Image.jpg', name: 'Zoom', slug: 'zoom' },
  { code: 'LTD', image: 'LTD-Brand-Image.jpg', name: 'LTD', slug: 'ltd' },
  { code: 'Focal', image: 'Focal-Brand-Image.jpg', name: 'Focal', slug: 'focal' },
  { code: 'iCon', image: 'Icon-Brand-Image.jpg', name: 'iCon Pro Audio', slug: 'icon-pro-audio' },
  { code: 'Eventide', image: 'Eventide-Brand-Image.jpg', name: 'Eventide', slug: 'eventide' },
  { code: 'ENKI', image: 'Enki-Brand-Image.jpg', name: 'ENKI', slug: 'enki' },
  { code: 'ESP', image: 'ESP-Brand-Image.jpg', name: 'ESP', slug: 'esp' },
  { code: 'Tech21', image: 'Tech-21-Brand-Image.jpg', name: 'Tech21', slug: 'tech21' },
  { code: 'Masterwork', image: 'Masterwork-Brand-Image.jpg', name: 'Masterwork', slug: 'masterwork' },
  { code: 'Overtone', image: 'Overtone-Labs-Brand-Image.jpg', name: 'Overtone Labs', slug: 'overtone-labs' },
  { code: 'Soundbrenn', image: 'Soundbrenner-Brand-Image.jpg', name: 'Soundbrenner', slug: 'soundbrenner' },
];

export default function TopBrandsCarousel() {
  const smallScrollRef = useRef<HTMLDivElement>(null);
  const mediumScrollRef = useRef<HTMLDivElement>(null);
  const largeScrollRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations('home');

  const scroll = (direction: 'left' | 'right') => {
    // Find the currently visible carousel based on screen size
    const activeRef = [smallScrollRef, mediumScrollRef, largeScrollRef].find(
      ref => ref.current && ref.current.offsetParent !== null
    );

    if (activeRef?.current) {
      // Get the full width of the container (one complete slide)
      const containerWidth = activeRef.current.clientWidth;
      const currentScroll = activeRef.current.scrollLeft;

      // Calculate the target scroll position (move by one full slide)
      const newScrollPosition = direction === 'left'
        ? currentScroll - containerWidth
        : currentScroll + containerWidth;

      activeRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Create slides for different screen sizes
  const createSlides = (itemsPerSlide: number) => {
    const slides = [];
    for (let i = 0; i < topBrands.length; i += itemsPerSlide) {
      slides.push(topBrands.slice(i, i + itemsPerSlide));
    }
    return slides;
  };

  const smallSlides = createSlides(2);  // 1 col × 2 rows
  const mediumSlides = createSlides(4); // 2 cols × 2 rows
  const largeSlides = createSlides(6);  // 3 cols × 2 rows

  return (
    <div className="relative mb-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('topBrands')}</h2>

      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Small Screen Carousel (1 column) */}
        <div
          ref={smallScrollRef}
          className="sm:hidden flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {smallSlides.map((slideGroup, slideIndex) => (
            <div
              key={slideIndex}
              className="shrink-0 w-full grid grid-cols-1 gap-6 snap-start"
            >
              {slideGroup.map((brand) => (
                <Link
                  key={brand.code}
                  href={`/${locale}/brands/${brand.slug}`}
                  className="h-48 bg-white border border-gray-200 rounded-lg hover:shadow-xl transition-shadow overflow-hidden group/item"
                >
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <img
                      src={`https://media.sound-service.eu/images/${brand.image}`}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover/item:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.brand-name-fallback')) {
                          const textNode = document.createElement('span');
                          textNode.className = 'brand-name-fallback text-xl font-bold text-white';
                          textNode.textContent = brand.name;
                          parent.appendChild(textNode);
                        }
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Medium Screen Carousel (2 columns) */}
        <div
          ref={mediumScrollRef}
          className="hidden sm:flex lg:hidden gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mediumSlides.map((slideGroup, slideIndex) => (
            <div
              key={slideIndex}
              className="flex-shrink-0 w-full grid grid-cols-2 gap-6 snap-start"
            >
              {slideGroup.map((brand) => (
                <Link
                  key={brand.code}
                  href={`/${locale}/brands/${brand.slug}`}
                  className="h-48 bg-white border border-gray-200 rounded-lg hover:shadow-xl transition-shadow overflow-hidden group/item"
                >
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <img
                      src={`https://media.sound-service.eu/images/${brand.image}`}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover/item:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.brand-name-fallback')) {
                          const textNode = document.createElement('span');
                          textNode.className = 'brand-name-fallback text-xl font-bold text-white';
                          textNode.textContent = brand.name;
                          parent.appendChild(textNode);
                        }
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Large Screen Carousel (3 columns) */}
        <div
          ref={largeScrollRef}
          className="hidden lg:flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {largeSlides.map((slideGroup, slideIndex) => (
            <div
              key={slideIndex}
              className="flex-shrink-0 w-full grid grid-cols-3 gap-6 snap-start"
            >
              {slideGroup.map((brand) => (
                <Link
                  key={brand.code}
                  href={`/${locale}/brands/${brand.slug}`}
                  className="h-48 bg-white border border-gray-200 rounded-lg hover:shadow-xl transition-shadow overflow-hidden group/item"
                >
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <img
                      src={`https://media.sound-service.eu/images/${brand.image}`}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover/item:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.brand-name-fallback')) {
                          const textNode = document.createElement('span');
                          textNode.className = 'brand-name-fallback text-xl font-bold text-white';
                          textNode.textContent = brand.name;
                          parent.appendChild(textNode);
                        }
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
