'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { api } from '@/lib/api';
import { Building2, ArrowLeft, Check, X, Percent } from 'lucide-react';

interface Brand {
  id: number;
  code: string;
  name: string;
}

interface Category {
  id: number;
  code: string;
  name_en: string;
}

interface Discount {
  id: number;
  account_id: number;
  brand_id: number;
  discount: string;
  auth: boolean;
  brand?: Brand;
}

interface CategoryDiscount {
  id: number;
  account_id: number;
  brand_id: number;
  category_id: number;
  discount: string;
  auth: boolean;
  brand?: Brand;
  category?: Category;
}

interface Region {
  id: number;
  code: number;
  name: string;
  currency: string;
}

interface Country {
  id: number;
  code: string;
  name: string;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface Account {
  id: number;
  code: number;
  name: string;
  region_id: number;
  discount: string;
  discounts?: Discount[];
  category_discounts?: CategoryDiscount[];
  region?: Region;
  country?: Country;
  currency?: Currency;
}

export default function AccountDetailPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthorizedOnly, setShowAuthorizedOnly] = useState(false);
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);

        // Check if user is Admin
        if (!user.roles || !user.roles.includes('Admin')) {
          router.push('/dashboard');
          return;
        }

        await fetchAccount();
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [accountId, router]);

  const fetchAccount = async () => {
    try {
      const token = api.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch account details');
      }

      const data = await response.json();
      setAccount(data);
    } catch (err) {
      setError('Failed to load account details');
      console.error(err);
    }
  };

  // Filter discounts based on search query and authorization status
  const filteredDiscounts = account?.discounts?.filter((discount) => {
    const matchesSearch = !searchQuery ||
      discount.brand?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.brand?.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAuth = !showAuthorizedOnly || discount.auth;
    return matchesSearch && matchesAuth;
  }) || [];

  // Group category discounts by brand
  const categoryDiscountsByBrand = account?.category_discounts?.reduce((acc, cd) => {
    if (!acc[cd.brand_id]) {
      acc[cd.brand_id] = [];
    }
    acc[cd.brand_id].push(cd);
    return acc;
  }, {} as Record<number, CategoryDiscount[]>) || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <p className="text-lg text-red-500">Account not found</p>
            <button
              onClick={() => router.push('/admin/accounts')}
              className="mt-4 text-brand hover:underline"
            >
              Back to Accounts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/accounts')}
            className="flex items-center gap-2 text-brand hover:text-brand/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Accounts
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-brand" />
                {account.name}
              </h1>
              <p className="mt-2 text-gray-600">Account Code: {account.code}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Account Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Region</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {account.region?.name || 'N/A'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Country</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {account.country?.name || 'N/A'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Currency</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {account.currency?.code || 'N/A'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Base Discount</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {parseFloat(account.discount) < 1
                ? `${(100 - parseFloat(account.discount) * 100).toFixed(0)}%`
                : account.discount}
            </div>
          </div>
        </div>

        {/* Brand Discounts Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Percent className="w-5 h-5 text-brand" />
              Brand-Specific Discounts
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Custom discounts and authorization settings for each brand
            </p>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brands..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAuthorizedOnly}
                    onChange={(e) => setShowAuthorizedOnly(e.target.checked)}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-gray-700">Authorized only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Brand Discounts Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Additional Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Authorized
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Discounts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No brand discounts found
                    </td>
                  </tr>
                ) : (
                  filteredDiscounts.map((discount) => {
                    const categoryDiscounts = categoryDiscountsByBrand[discount.brand_id] || [];
                    return (
                      <tr key={discount.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {discount.brand?.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {discount.brand?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {parseFloat(discount.discount) > 0
                              ? `${parseFloat(discount.discount).toFixed(2)}%`
                              : 'No additional discount'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {discount.auth ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="w-3 h-3" />
                              Authorized
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <X className="w-3 h-3" />
                              Not Authorized
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {categoryDiscounts.length > 0 ? (
                            <div className="text-xs space-y-1">
                              {categoryDiscounts.map((cd) => (
                                <div key={cd.id} className="flex items-center gap-2">
                                  <span className="text-gray-600">{cd.category?.name_en}:</span>
                                  <span className="font-medium text-gray-900">
                                    {parseFloat(cd.discount).toFixed(2)}%
                                  </span>
                                  {cd.auth ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <X className="w-3 h-3 text-red-600" />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Brand Discounts</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {account.discounts?.length || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Authorized Brands</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {account.discounts?.filter((d) => d.auth).length || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Category Discounts</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {account.category_discounts?.length || 0}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
