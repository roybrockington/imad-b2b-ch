'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, User } from '@/lib/api';
import Link from 'next/link';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
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

  // Fetch orders
  useEffect(() => {
    if (!currentUser) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await api.getUserOrders(currentPage);

        setOrders(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
        setTotal(data.total || 0);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        setError(error.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, currentPage]);

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
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

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
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      complete: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
          {currentUser.account && (
            <p className="mt-2 text-sm text-gray-600">
              {t('showingOrdersFor')} <span className="font-semibold">{currentUser.account.name}</span>
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {total} {total === 1 ? t('order') : t('orders')} {t('totalOrders')}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              <strong>{t('error')}:</strong> {error}
            </p>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">{t('loading')}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">{t('noOrdersYet')}</p>
            <p className="text-gray-500 mb-6">{t('startShopping')}</p>
            <Link
              href={`/${locale}`}
              className="inline-block bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
            >
              {t('browseProducts')}
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/${locale}/orders/${order.id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-brand transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {t('orderNumber')} {order.reference}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(getDisplayStatus(order))}`}>
                          {getDisplayStatus(order)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">{t('date')}</p>
                          <p className="font-medium text-gray-900">
                            {new Date(order.created_at).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                          <div>
                            <p className="text-gray-500">{t('reference')}</p>
                            <p className="font-medium text-gray-900">{order.po || '-'}</p>
                          </div>
                        <div>
                          <p className="text-gray-500">{t('items')}</p>
                          <p className="font-medium text-gray-900">
                            {order.items?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t('total')}</p>
                          <p className="font-bold text-brand">
                            {formatPrice(order.total, order.currency)}
                          </p>
                        </div>
                      </div>
                      {order.user && order.user.id !== currentUser.id && order.user.email !== 'r.brockington@sound-service.eu' && (
                        <p className="text-xs text-gray-500 mt-2">
                          {t('orderedBy')}: {order.user.email}
                        </p>
                      )}
                    </div>

                    {/* View Details Arrow */}
                    <div className="flex items-center text-brand">
                      <span className="text-sm font-medium mr-2">{t('viewDetails')}</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => {
                    setCurrentPage(Math.max(1, currentPage - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => {
                          setCurrentPage(pageNumber);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-4 py-2 border rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-brand text-white border-brand'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage(Math.min(totalPages, currentPage + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
