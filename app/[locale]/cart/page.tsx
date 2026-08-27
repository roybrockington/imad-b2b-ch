'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { useCart } from '@/contexts/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { api, User } from '@/lib/api';
import { slugify } from '@/lib/utils';
import CsvUpload from '@/components/CsvUpload';

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: { [key: string]: string } = {
      'EUR': '€',
      'PLN': 'zł',
      'CZK': 'Kč',
      'GBP': '£'
    };
    return symbols[currencyCode] || '€';
  };

  const parsePrice = (priceString: string, currencyCode: string): number => {
    if (currencyCode === 'GBP') {
      // British format: 1,234.56 (comma is thousands, dot is decimal)
      // Remove commas, keep dot as decimal
      return parseFloat(priceString.replace(/,/g, ''));
    } else {
      // European format: 1.234,56 (dot is thousands, comma is decimal)
      // Remove dots and spaces, replace comma with dot
      return parseFloat(priceString.replace(/[\s.]/g, '').replace(',', '.'));
    }
  };

  const formatPrice = (price: number | string, currencyCode: string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numPrice)) return '0.00';

    // Format based on currency
    if (currencyCode === 'GBP') {
      // British format: 1,234.56 (comma for thousands, dot for decimal)
      return numPrice.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (currencyCode === 'EUR') {
      // European format: 1.234,56 (dot for thousands, comma for decimal)
      return numPrice.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (currencyCode === 'CZK') {
      // Czech format: 1 234,56 (space for thousands, comma for decimal)
      return numPrice.toLocaleString('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (currencyCode === 'PLN') {
      // Polish format: 1 234,56 (space for thousands, comma for decimal)
      return numPrice.toLocaleString('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    // Default to European format
    return numPrice.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPriceWithCurrency = (price: number | string, currencyCode: string): string => {
    const formattedPrice = formatPrice(price, currencyCode);
    const symbol = getCurrencySymbol(currencyCode);

    // Currency symbol goes before the price for GBP
    if (currencyCode === 'GBP') {
      return `${symbol}${formattedPrice}`;
    }

    // Currency symbol goes after the price for other currencies
    return `${formattedPrice} ${symbol}`;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
            <p className="text-gray-600 mb-6">{t('loginPrompt')}</p>
            <Link
              href={`/${locale}/login`}
              className="inline-block bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
            >
              {t('logIn')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Redirect Admin users away from cart
  if (currentUser?.roles?.includes('Admin')) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('accessRestricted')}</h1>
            <p className="text-gray-600 mb-6">{t('notAvailableForAdmin')}</p>
            <Link
              href={`/${locale}/admin/dashboard`}
              className="inline-block bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
            >
              {t('goToAdminDashboard')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isCustomer = currentUser?.roles?.includes('Customer');
  // Always use the currency from the user's account as the authoritative source
  const userCurrency = currentUser?.account?.currency?.code || 'EUR';

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

          {/* CSV Upload for Customer role - even when cart is empty */}
          {isCustomer && (
            <CsvUpload
              userCurrency={userCurrency}
              userAccount={currentUser?.account}
            />
          )}

          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">{t('emptyCart')}</p>
            <Link
              href={`/${locale}`}
              className="inline-block bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  // Use user's account currency instead of first item's currency for consistency
  const displayCurrency = userCurrency;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            {t('clearCart')}
          </button>
        </div>

        {/* CSV Upload for Customer role */}
        {isCustomer && (
          <CsvUpload
            userCurrency={userCurrency}
            userAccount={currentUser?.account}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const brandSlug = slugify(item.product.brand?.name || '');
              const productName = item.product.description?.name1_en || item.product.name;
              const productSlug = slugify(productName);
              const productUrl = `/${locale}/${brandSlug}/${productSlug}`;

              const imageUrl = item.product.description?.image1
                ? `https://media.sound-service.eu/Artikelbilder/Shopsystem/278x148/${item.product.description.image1}`
                : null;

              // Parse price based on how it was stored (item.currency)
              const unitPrice = parsePrice(item.price, item.currency);
              const itemTotal = unitPrice * item.quantity;

              // Use product id + xwareCode as unique key for B-stock items
              const itemKey = item.xwareCode ? `${item.product.id}-${item.xwareCode}` : item.product.id.toString();
              const isCstock = item.xwareCode?.startsWith('3');
              const stockLabel = isCstock ? 'C-STOCK' : 'B-STOCK';
              const stockBorderBg = isCstock ? 'border-purple-300 bg-purple-50' : 'border-amber-300 bg-amber-50';
              const stockBadgeColor = isCstock ? 'bg-purple-500' : 'bg-amber-500';
              const stockPriceColor = isCstock ? 'text-purple-600' : 'text-amber-600';

              return (
                <div
                  key={itemKey}
                  className={`flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow ${
                    item.xwareCode ? stockBorderBg : 'border-gray-200'
                  }`}
                >
                  {/* Product Image */}
                  <Link href={productUrl} className="flex-shrink-0">
                    <div className="w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product.description?.alt1 || item.product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400 text-xs">{t('noImage')}</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={productUrl} className="hover:text-brand transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item.xwareCode && (
                          <span className={`inline-block ${stockBadgeColor} text-white text-xs font-bold px-1.5 py-0.5 rounded mr-2`}>
                            {stockLabel}
                          </span>
                        )}
                        {item.product.name}
                      </h3>
                    </Link>
                    {item.product.brand && (
                      <p className="text-sm text-gray-500 mb-2">{item.product.brand.name}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {t('sku')} {item.xwareCode || item.product.code}
                    </p>
                    <p className={`text-lg font-bold mt-2 ${item.xwareCode ? stockPriceColor : 'text-brand'}`}>
                      {formatPriceWithCurrency(unitPrice, displayCurrency)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.product.id, item.xwareCode)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.xwareCode)}
                        className="px-2 py-1 hover:bg-gray-100 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 min-w-[2.5rem] text-center border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.xwareCode)}
                        className="px-2 py-1 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      {formatPriceWithCurrency(itemTotal, displayCurrency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('orderSummary')}</h2>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('items')}</span>
                  <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>{t('total')}</span>
                <span className="text-brand">
                  {formatPriceWithCurrency(totalPrice, displayCurrency)}
                </span>
              </div>

              <Link
                href={`/${locale}/checkout`}
                className="block w-full bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors mb-3 text-center"
              >
                {t('proceedToCheckout')}
              </Link>

              <Link
                href={`/${locale}`}
                className="block text-center text-brand hover:text-brand/80 transition-colors text-sm"
              >
                {t('continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
