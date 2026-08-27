'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Home, Search, ShoppingBag, HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const locale = useLocale();

  return (
    <div className="flex-1 bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          {/* 404 Graphic */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
            <div className="relative -mt-16">
              <div className="text-6xl">🎵</div>
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Oops! The page you're looking for seems to have hit a wrong note.
            Don't worry, we'll help you get back on track.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link
              href={`/${locale}/`}
              className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
            <Link
              href={`/${locale}/products`}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-brand hover:text-brand transition-colors font-medium"
            >
              <Search className="h-5 w-5" />
              Browse Products
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="w-full max-w-4xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Here are some helpful links instead:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href={`/${locale}/brands`}
                className="p-6 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-full p-3 group-hover:bg-blue-200 transition-colors">
                    <ShoppingBag className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Our Brands</h4>
                    <p className="text-sm text-gray-600">
                      Explore our full range of music and audio brands
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href={`/${locale}/cart`}
                className="p-6 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-3 group-hover:bg-green-200 transition-colors">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">View Cart</h4>
                    <p className="text-sm text-gray-600">
                      Check your shopping cart and complete your order
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href={`/${locale}/contact`}
                className="p-6 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-full p-3 group-hover:bg-purple-200 transition-colors">
                    <HelpCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Contact Us</h4>
                    <p className="text-sm text-gray-600">
                      Get in touch with our support team for help
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg max-w-2xl">
            <p className="text-sm text-gray-600">
              <strong>Still can't find what you're looking for?</strong>
              <br />
              Try using the search bar in the navigation menu, or contact our sales team at{' '}
              <a href="mailto:sales@sound-service.eu" className="text-brand hover:underline">
                sales@sound-service.eu
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
