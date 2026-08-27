import Link from 'next/link';
import { Home, Search, ShoppingBag, HelpCircle } from 'lucide-react';
import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import Image from 'next/image';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-white`}>
        {/* Simple Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/en/">
                <img
                  src="/logo.svg"
                  alt="Sound Service European Music Distribution"
                  className="h-8 w-auto"
                />
              </Link>
              <Link
                href="/en/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
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
                href="/en/"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Home className="h-5 w-5" />
                Back to Home
              </Link>
              <Link
                href="/en/brands"
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-medium"
              >
                <Search className="h-5 w-5" />
                Browse Brands
              </Link>
            </div>

            {/* Helpful Links */}
            <div className="w-full max-w-4xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Here are some helpful links instead:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/en/brands"
                  className="p-6 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 group-hover:bg-blue-200 transition-colors">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
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
                  href="/en/cart"
                  className="p-6 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all text-left group"
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
                  href="/en/contact"
                  className="p-6 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all text-left group"
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
                Contact our sales team at{' '}
                <a href="mailto:sales@sound-service.eu" className="text-blue-600 hover:underline">
                  sales@sound-service.eu
                </a>
              </p>
            </div>
          </div>
        </main>

        {/* Simple Footer */}
        <footer className="bg-gray-900 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400">
                  © {new Date().getFullYear()} Sound Service GmbH. All rights reserved.
                </p>
              </div>
              <div className="flex gap-6">
                <Link href="/en/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
                <Link href="/en/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/en/imprint" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Imprint
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
