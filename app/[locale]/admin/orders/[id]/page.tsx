'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, User } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Package, User as UserIcon, Building2, Calendar, Hash, FileText } from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Fetch current user and check permissions
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = api.getToken();
        if (!token) {
          router.push(`/${locale}/login`);
          return;
        }

        const user = await api.getCurrentUser();
        const roles = user.roles || [];

        if (!roles.includes('Admin') && !roles.includes('Staff')) {
          router.push(`/${locale}`);
          return;
        }

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

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    try {
      setUpdatingStatus(true);
      await api.updateOrderStatus(order.id, newStatus);

      // Refresh order data
      const data = await api.getOrder(order.id);
      setOrder(data);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatPrice = (amount: number, currency: string): string => {
    const locale = currency === 'GBP' ? 'en-GB' : 'de-DE';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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
    // Check if all items are fully shipped
    if (order.status === 'pending' && order.items && order.items.length > 0) {
      const allShipped = order.items.every((item: any) =>
        item.shipped && item.shipped === item.quantity
      );
      if (allShipped) {
        return 'complete';
      }
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
              href={`/${locale}/admin/orders`}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header with back link */}
        <div className="mb-6">
          <Link
            href={`/${locale}/admin/orders`}
            className="inline-flex items-center text-brand hover:text-brand/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {new Date(order.created_at).toLocaleString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 text-sm font-semibold rounded-full capitalize border ${getStatusColor(getDisplayStatus(order))}`}>
                {getDisplayStatus(order)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Items ({order.items?.length || 0})
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
                          SKU: {item.product_code}
                        </p>
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <span className="text-gray-700">
                            {formatPrice(parseFloat(item.price.replace(/\s/g, '').replace(',', '.')), item.currency)}
                          </span>
                          <span className="text-gray-500">×</span>
                          <span className="text-gray-700">Qty: {item.quantity}</span>
                        </div>
                        {item.shipped > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className={`font-medium ${item.shipped === item.quantity ? 'text-green-600' : 'text-blue-600'}`}>
                                Shipped: {item.shipped} of {item.quantity}
                              </span>
                            </div>
                            {item.courier && (
                              <p className="text-sm text-gray-600">
                                Courier: <span className="font-medium">{item.courier}</span>
                              </p>
                            )}
                            {item.tracking && (
                              <p className="text-sm text-gray-600">
                                Tracking: <span className="font-mono font-medium">{item.tracking}</span>
                              </p>
                            )}
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
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(parseFloat(order.total), order.currency)}
                  </span>
                </div>
                {order.insurance && parseFloat(order.insurance) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Insurance:</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(parseFloat(order.insurance), order.currency)}
                    </span>
                  </div>
                )}
                {order.shipping && parseFloat(order.shipping) > 0 ? (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(parseFloat(order.shipping), order.currency)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Order Total:</span>
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
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Order Notes
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Management */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updatingStatus}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {updatingStatus && (
                <p className="text-sm text-gray-500 mt-2">Updating...</p>
              )}
            </div>

            {/* Order Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <Hash className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Order ID</p>
                    <p className="font-medium text-gray-900">#{order.id}</p>
                  </div>
                </div>

                {order.reference && (
                  <div className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Customer Reference</p>
                      <p className="font-medium text-gray-900">{order.reference}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <Calendar className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Order Date</p>
                    <p className="font-medium text-gray-900">
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

            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3 text-sm">
                {order.user && (
                  <div className="flex items-start">
                    <UserIcon className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Customer</p>
                      <p className="font-medium text-gray-900">{order.user.name || order.user.email}</p>
                      <p className="text-gray-600">{order.user.email}</p>
                    </div>
                  </div>
                )}

                {order.account && (
                  <div className="flex items-start">
                    <Building2 className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Account</p>
                      <p className="font-medium text-gray-900">{order.account.name}</p>
                      <p className="text-gray-600">Code: {order.account.code}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
