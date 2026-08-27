'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, User } from '@/lib/api';
import { Search, Download, Square, CheckSquare, Package } from 'lucide-react';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  currency: string;
  product_code: string;
  product_name: string;
  exported: boolean;
  created_at: string;
  order: {
    id: number;
    reference: string;
    po: string;
    status: string;
    user: {
      name: string;
      email: string;
    };
    account: {
      code: string;
      name: string;
      region?: {
        code: string;
        name: string;
      };
    };
    address?: {
      name1: string;
      city: string;
      country: string;
    };
  };
}

interface Statistics {
  total_unexported: number;
  by_region: Array<{
    code: string;
    name: string;
    count: number;
  }>;
}

export default function OrderExportsPage() {
  const router = useRouter();
  const locale = useLocale();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [timeUntilSync, setTimeUntilSync] = useState('');

  // Calculate time until next sync (top of hour or 30 minutes past)
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      let targetMinute: number;
      if (minutes < 30) {
        targetMinute = 30;
      } else {
        targetMinute = 60;
      }

      const minutesRemaining = targetMinute - minutes - 1;
      const secondsRemaining = 60 - seconds;

      const displayMinutes = secondsRemaining === 60 ? minutesRemaining + 1 : minutesRemaining;
      const displaySeconds = secondsRemaining === 60 ? 0 : secondsRemaining;

      setTimeUntilSync(`${displayMinutes}m ${displaySeconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

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

  // Fetch statistics
  useEffect(() => {
    if (!currentUser) return;

    const fetchStats = async () => {
      try {
        const stats = await api.getOrderExportStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };

    fetchStats();
  }, [currentUser]);

  // Fetch order items
  useEffect(() => {
    if (!currentUser) return;

    const fetchOrderItems = async () => {
      try {
        setLoading(true);
        const data = await api.getOrderExports({
          page: currentPage,
          region: regionFilter,
          search: searchQuery,
          per_page: 50
        });

        setOrderItems(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Failed to fetch order items:', error);
        setOrderItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [currentUser, currentPage, regionFilter, searchQuery]);

  const handleSelectAll = () => {
    if (selectedItems.size === orderItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(orderItems.map(item => item.id)));
    }
  };

  // Helper to check if an order is selected (any of its items are selected)
  const isOrderSelected = (orderId: number): boolean => {
    return orderItems
      .filter(item => item.order_id === orderId)
      .some(item => selectedItems.has(item.id));
  };

  const handleSelectItem = (id: number) => {
    // Find the order_id for the clicked item
    const clickedItem = orderItems.find(item => item.id === id);
    if (!clickedItem) return;

    const orderId = clickedItem.order_id;

    // Find all items from the same order
    const orderItemIds = orderItems
      .filter(item => item.order_id === orderId)
      .map(item => item.id);

    const newSelected = new Set(selectedItems);

    // Check if any item from this order is currently selected
    const anySelected = orderItemIds.some(itemId => newSelected.has(itemId));

    if (anySelected) {
      // Deselect all items from this order
      orderItemIds.forEach(itemId => newSelected.delete(itemId));
    } else {
      // Select all items from this order
      orderItemIds.forEach(itemId => newSelected.add(itemId));
    }

    setSelectedItems(newSelected);
  };

  const handleExportToSage = async () => {
    if (selectedItems.size === 0) return;

    if (!confirm(`Export ${selectedItems.size} item(s) to Sage?`)) {
      return;
    }

    try {
      setExporting(true);
      const result = await api.exportOrderItemsToSage(Array.from(selectedItems));

      // Show result message
      if (result.success) {
        let message = result.message;
        if (result.skipped_count > 0) {
          message += `\n\nSkipped ${result.skipped_count} item(s) due to missing data.`;
        }
        if (result.errors && result.errors.length > 0) {
          message += `\n\nErrors:\n${result.errors.join('\n')}`;
        }
        alert(message);
      } else {
        alert(result.message || 'Export failed');
      }

      // Refresh data
      setSelectedItems(new Set());
      const data = await api.getOrderExports({
        page: currentPage,
        region: regionFilter,
        search: searchQuery,
        per_page: 50
      });
      setOrderItems(data.data || []);

      // Refresh statistics
      const stats = await api.getOrderExportStatistics();
      setStatistics(stats);
    } catch (error: any) {
      console.error('Failed to export to Sage:', error);
      alert(error?.message || 'Failed to export items to Sage');
    } finally {
      setExporting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex-1 bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Export Queue</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor and manage order items waiting to be exported (showing orders without a reference number)
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Export</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics.total_unexported}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Time to Next Export</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {timeUntilSync}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">By Region</p>
              <div className="space-y-1">
                {statistics.by_region.map((region) => (
                  <div key={region.code} className="flex justify-between text-sm">
                    <span className="uppercase text-gray-600">{region.code}:</span>
                    <span className="font-medium text-gray-900">{region.count}</span>
                  </div>
                ))}
                {statistics.by_region.length === 0 && (
                  <div className="text-sm text-gray-500">No data</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by product code or name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Region Filter */}
              <select
                value={regionFilter}
                onChange={(e) => {
                  setRegionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Regions</option>
                <option value="EU">EU</option>
                <option value="UK">UK</option>
              </select>

              {/* Export Button */}
              <button
                onClick={handleExportToSage}
                disabled={selectedItems.size === 0 || exporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                {exporting ? 'Exporting...' : `Export to Sage (${selectedItems.size})`}
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
            Showing {orderItems.length} of {total} items
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : orderItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No unexported order items found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center text-gray-700 hover:text-gray-900"
                        >
                          {selectedItems.size === orderItems.length ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleSelectItem(item.id)}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            {isOrderSelected(item.order_id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              #{item.order.reference || item.order.id}
                            </div>
                            {item.order.po && (
                              <div className="text-gray-500">PO: {item.order.po}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{item.product_code}</div>
                            <div className="text-gray-500">{item.product_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {item.order.account?.name}
                            </div>
                            <div className="text-gray-500">
                              {item.order.address?.city}, {item.order.address?.country}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 uppercase">
                            {item.order.account?.region?.code || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            item.order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            item.order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
