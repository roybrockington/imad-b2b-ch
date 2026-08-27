'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('orderConfirmation');
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const orderData = await api.getOrder(parseInt(orderId));
        setOrder(orderData);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: { [key: string]: string } = {
      'EUR': '€',
      'PLN': 'zł',
      'CZK': 'Kč',
      'GBP': '£'
    };
    return symbols[currencyCode] || '€';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">{t('loadingOrder')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('orderNotFound')}</h1>
            <p className="text-gray-600 mb-6">{error || t('unableToFind')}</p>
            <Link
              href={`/${locale}`}
              className="inline-block bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('orderConfirmed')}</h1>
          <p className="text-lg text-gray-600">
            {t('thankYou')}
          </p>
        </div>

        {/* Order Details */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('orderDetails')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">{t('orderNumber')}</p>
              <p className="font-semibold text-gray-900">#{order.id}</p>
            </div>
            <div>
              <p className="text-gray-600">{t('orderDate')}</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.created_at).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            {order.po && (
              <div>
                <p className="text-gray-600">{t('yourPONumber')}</p>
                <p className="font-semibold text-gray-900">{order.po}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">{t('status')}</p>
              <p className="font-semibold text-green-600 capitalize">{order.status}</p>
            </div>
            {order.account && (
              <div>
                <p className="text-gray-600">{t('account')}</p>
                <p className="font-semibold text-gray-900">{order.account.name}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">{t('subtotal')}</p>
              <p className="font-semibold text-gray-900">
                {formatPriceWithCurrency(order.total, order.currency)}
              </p>
            </div>
            {order.insurance && parseFloat(order.insurance) > 0 && (
              <div>
                <p className="text-gray-600">Insurance</p>
                <p className="font-semibold text-gray-900">
                  {formatPriceWithCurrency(order.insurance, order.currency)}
                </p>
              </div>
            )}
            {order.shipping && parseFloat(order.shipping) > 0 && (
              <div>
                <p className="text-gray-600">Shipping</p>
                <p className="font-semibold text-gray-900">
                  {formatPriceWithCurrency(order.shipping, order.currency)}
                </p>
              </div>
            )}
            {(!order.shipping || parseFloat(order.shipping) === 0) && (
              <div>
                <p className="text-gray-600">Shipping</p>
                <p className="font-semibold text-green-600">Free</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">{t('totalAmount')}</p>
              <p className="font-semibold text-gray-900 text-lg">
                {formatPriceWithCurrency(
                  parseFloat(order.total) +
                  (order.insurance ? parseFloat(order.insurance) : 0) +
                  (order.shipping ? parseFloat(order.shipping) : 0),
                  order.currency
                )}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm mb-1">{t('orderNotes')}</p>
              <p className="text-gray-900">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('orderItems')}</h2>
          <div className="space-y-3">
            {order.items.map((item: any) => {
              const imageUrl = item.product?.description?.image1
                ? `https://media.sound-service.eu/Artikelbilder/Shopsystem/278x148/${item.product.description.image1}`
                : null;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 pb-3 border-b border-gray-200 last:border-0"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product_name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400 text-xs">{t('noImage')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                      {item.product_name}
                    </h3>
                    <p className="text-xs text-gray-500">{t('sku')} {item.product_code}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {formatPriceWithCurrency(item.price, item.currency)} × {item.quantity}
                    </p>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPriceWithCurrency(parseFloat(item.price) * item.quantity, item.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">{t('whatHappensNext')}</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{t('step1')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{t('step2')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{t('step3')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{t('step4')}</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}`}
            className="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition-colors text-center"
          >
            {t('continueShopping')}
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className="px-6 py-3 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition-colors text-center"
          >
            {t('viewDashboard')}
          </Link>
        </div>
      </main>
    </div>
  );
}
