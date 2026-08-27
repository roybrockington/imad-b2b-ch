'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, User } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, Hash, FileText, MapPin } from 'lucide-react';

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('orders');
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = api.getToken();
        if (!token) {
          router.push(`/${locale}/login`);
          return;
        }

        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push(`/${locale}/login`);
      }
    };

    fetchUser();
  }, [locale, router]);

  // Fetch order details
  useEffect(() => {
    if (!currentUser || !orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await api.getOrder(parseInt(orderId));

        setOrder(data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch order:', error);
        setError(error.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [currentUser, orderId]);

  const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: { [key: string]: string } = {
      'EUR': '€',
      'PLN': 'zł',
      'CZK': 'Kč',
      'GBP': '£'
    };
    return symbols[currencyCode] || '€';
  };

  const formatPrice = (price: string | number, currency: string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/\s/g, '').replace(',', '.')) : price;

    if (currency === 'GBP') {
      // GBP: £1,234.56 (symbol before, dot for decimal, comma for thousands)
      const formatted = new Intl.NumberFormat('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numPrice);
      return `£${formatted}`;
    } else if (currency === 'EUR') {
      // EUR: 1.234,56 € (symbol after, comma for decimal, dot for thousands)
      const formatted = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numPrice);
      return `${formatted} €`;
    } else if (currency === 'CZK') {
      // CZK: 1 234,56 Kč (symbol after, comma for decimal, space for thousands)
      const formatted = new Intl.NumberFormat('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numPrice);
      return `${formatted} Kč`;
    } else if (currency === 'PLN') {
      // PLN: 1 234,56 zł (symbol after, comma for decimal, space for thousands)
      const formatted = new Intl.NumberFormat('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numPrice);
      return `${formatted} zł`;
    }

    // Default to EUR format
    const formatted = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
    return `${formatted} €`;
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      complete: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDisplayStatus = (order: any): string => {
    // Check if all items are fully shipped (highest priority - check this first)
    if (order.items && order.items.length > 0) {
      const allShipped = order.items.every((item: any) => {
        const shipped = Number(item.shipped) || 0;
        const quantity = Number(item.quantity) || 0;
        return shipped > 0 && shipped >= quantity;
      });
      if (allShipped) {
        return 'complete';
      }
    }

    // Orders with reference should show as processing (only if not fully shipped)
    if (order.status === 'pending' && order.reference && order.reference.trim() !== '') {
      return 'processing';
    }

    return order.status;
  };

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">Loading order details...</p>
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
          <div className="mb-6">
            <Link
              href={`/${locale}/orders`}
              className="inline-flex items-center text-brand hover:text-brand/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </div>
          <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold mb-2">Error Loading Order</p>
            <p className="text-red-600">{error || 'Order not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header with back link */}
        <div className="mb-6">
          <Link
            href={`/${locale}/orders`}
            className="inline-flex items-center text-brand hover:text-brand/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToOrders')}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('orderNumber')} {order.reference}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {t('placedOn')} {new Date(order.created_at).toLocaleString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-4 py-2 text-sm font-semibold rounded-full capitalize border ${getStatusColor(getDisplayStatus(order))}`}>
              {getDisplayStatus(order)}
            </span>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <Hash className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
              <div>
                <p className="text-blue-600">{t('orderId')}</p>
                <p className="font-semibold text-blue-900">#{order.id}</p>
              </div>
            </div>

            {order.po && (
              <div className="flex items-start">
                <FileText className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                <div>
                  <p className="text-blue-600">{t('yourReference')}</p>
                  <p className="font-semibold text-blue-900">{order.po}</p>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <Calendar className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
              <div>
                <p className="text-blue-600">{t('orderDate')}</p>
                <p className="font-semibold text-blue-900">
                  {new Date(order.created_at).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.address && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {t('deliveryAddress')}
            </h2>
            <div className="text-gray-700 space-y-1">
              {order.address.name1 && <p className="font-semibold">{order.address.name1}</p>}
              {order.address.name2 && <p>{order.address.name2}</p>}
              {order.address.address1 && <p>{order.address.address1}</p>}
              {order.address.address2 && <p>{order.address.address2}</p>}
              <p>
                {order.address.postcode} {order.address.city}
              </p>
              {order.address.country && <p>{order.address.country}</p>}
              {order.address.tel && (
                <p className="mt-2">
                  <span className="text-gray-500">{t('tel')}:</span> {order.address.tel}
                </p>
              )}
              {order.address.email && (
                <p>
                  <span className="text-gray-500">{t('email')}:</span> {order.address.email}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            {t('orderItems')} ({order.items?.length || 0})
          </h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => {
              const imageUrl = item.product?.description?.image1
                ? `https://media.sound-service.eu/Artikelbilder/Shopsystem/278x148/${item.product.description.image1}`
                : null;

              const itemTotal = parseFloat(item.price.replace(/\s/g, '').replace(',', '.')) * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 border border-gray-200 rounded-md overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product_name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {t('sku')}: {item.product_code}
                    </p>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className="text-gray-700">
                        {formatPrice(item.price, item.currency)}
                      </span>
                      <span className="text-gray-500">×</span>
                      <span className="text-gray-700">{t('qty')}: {item.quantity}</span>
                    </div>
                    {Number(item.shipped || 0) > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`font-medium ${Number(item.shipped || 0) >= Number(item.quantity) ? 'text-green-600' : 'text-blue-600'}`}>
                            {t('shipped')}: {Number(item.shipped || 0)} {t('of')} {item.quantity}
                          </span>
                        </div>
                        {item.courier && (
                          <p className="text-sm text-gray-600">
                            {t('courier')}: <span className="font-medium">{item.courier}</span>
                          </p>
                        )}
                        {item.tracking && (
                          <p className="text-sm text-gray-600">
                            {t('tracking')}: <span className="font-mono font-medium">{item.tracking}</span>
                          </p>
                        )}
                      </div>
                    )}
                    {/* Show ETA for items with unshipped quantities */}
                    {Number(item.shipped || 0) < Number(item.quantity) && item.product && order.account?.region && (
                      <div className="mt-2">
                        {(() => {
                          const regionCode = order.account.region.code?.toLowerCase();
                          const eta = regionCode === 'uk' ? item.product.eta_uk : item.product.eta;

                          if (eta) {
                            // Format date from ISO string to dd/mm/yy or show "Call for info" if past
                            const formatETA = (dateString: string) => {
                              try {
                                const date = new Date(dateString);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0); // Reset time to compare dates only

                                // If ETA is in the past, show "Call for info"
                                if (date < today) {
                                  return 'Call for info';
                                }

                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = String(date.getFullYear()).slice(-2);
                                return `${day}/${month}/${year}`;
                              } catch {
                                return dateString;
                              }
                            };

                            return (
                              <p className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block">
                                {t('eta')}: {formatETA(eta)}
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(itemTotal, item.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t('subtotal')}:</span>
              <span className="font-medium text-gray-900">
                {formatPrice(order.total, order.currency)}
              </span>
            </div>
            {order.insurance && parseFloat(order.insurance) > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Insurance:</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.insurance, order.currency)}
                </span>
              </div>
            )}
            {order.shipping && parseFloat(order.shipping) > 0 ? (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.shipping, order.currency)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">{t('orderTotal')}:</span>
              <span className="text-2xl font-bold text-brand">
                {formatPrice(
                  parseFloat(order.total) +
                  (order.insurance ? parseFloat(order.insurance) : 0) +
                  (order.shipping ? parseFloat(order.shipping) : 0),
                  order.currency
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {t('orderNotes')}
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}

        {/* Need Help */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">{t('needHelp')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('needHelpText')}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-block bg-brand text-white py-2 px-4 rounded-lg font-semibold hover:bg-brand/90 transition-colors text-sm"
          >
            {t('contactSupport')}
          </Link>
        </div>
      </main>
    </div>
  );
}
