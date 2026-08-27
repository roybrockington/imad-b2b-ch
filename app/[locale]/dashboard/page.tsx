'use client';

import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { api, User } from '@/lib/api';
import { Package, ShoppingBag, User as UserIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';

export default function CustomerDashboardPage() {
  const t = useTranslations('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrdersCount, setRecentOrdersCount] = useState<number>(0);
  const router = useRouter();
  const locale = useLocale();
  const { getTotalItems } = useCart();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getCurrentUser();

        // Redirect Admin users to admin dashboard
        if (userData.roles?.includes('Admin')) {
          router.push('/admin/dashboard');
          return;
        }

        setUser(userData);

        // Fetch recent orders count (orders from last 30 days)
        try {
          const ordersData = await api.getUserOrders();
          // Count orders from the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentOrders = ordersData.data.filter((order: any) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= thirtyDaysAgo;
          });

          setRecentOrdersCount(recentOrders.length);
        } catch (error) {
          console.error('Failed to fetch orders:', error);
          // Don't fail the whole page if orders can't be fetched
        }
      } catch (error) {
        // Not authenticated, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.logout();
      api.setToken(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear token anyway
      api.setToken(null);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t('loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  // Check if user account is pending approval
  const isPendingApproval = user.account_id === null;

  return (
    <div className="flex-1 bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Pending Approval Banner */}
        {isPendingApproval && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-yellow-800">{t('pendingApproval.title')}</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {t('pendingApproval.message')}
                  </p>
                  <p className="mt-2">
                    {t('pendingApproval.contact')}{' '}
                    <a href="mailto:info@sound-service.eu" className="font-medium underline">
                      info@sound-service.eu
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-1">{t('welcomeBack', { name: user.name })}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-brand transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {t('logout')}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Package className="h-6 w-6 text-brand" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('stats.recentOrders')}</p>
                <p className="text-2xl font-bold text-gray-900">{recentOrdersCount}</p>
                <p className="text-xs text-gray-500 mt-1">{t('stats.last30Days')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-3">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('stats.activeCart')}</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalItems()} {getTotalItems() === 1 ? t('stats.item') : t('stats.items')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${isPendingApproval ? 'bg-yellow-100' : 'bg-purple-100'} rounded-full p-3`}>
                <UserIcon className={`h-6 w-6 ${isPendingApproval ? 'text-yellow-600' : 'text-purple-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('stats.accountStatus')}</p>
                <p className="text-2xl font-bold text-gray-900">{isPendingApproval ? t('stats.pending') : t('stats.active')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('accountInfo.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t('accountInfo.name')}</p>
              <p className="text-gray-900 font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('accountInfo.email')}</p>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
            {user.account && (
              <>
                <div>
                  <p className="text-sm text-gray-600">{t('accountInfo.companyName')}</p>
                  <p className="text-gray-900 font-medium">{user.account.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('accountInfo.accountCode')}</p>
                  <p className="text-gray-900 font-medium">{user.account.code}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('quickActions.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/${locale}/`}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all block"
            >
              <h3 className="font-medium text-gray-900 mb-1">{t('quickActions.browseCatalog')}</h3>
              <p className="text-sm text-gray-600">{t('quickActions.browseCatalogDesc')}</p>
            </Link>
            <Link
              href={`/${locale}/orders`}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all block"
            >
              <h3 className="font-medium text-gray-900 mb-1">{t('quickActions.viewOrders')}</h3>
              <p className="text-sm text-gray-600">{t('quickActions.viewOrdersDesc')}</p>
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all block"
            >
              <h3 className="font-medium text-gray-900 mb-1">{t('quickActions.contactSupport')}</h3>
              <p className="text-sm text-gray-600">{t('quickActions.contactSupportDesc')}</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
