'use client';

import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { api, User, DashboardStats } from '@/lib/api';
import { Users, Package, ShoppingBag, TrendingUp, Settings, LogOut, Shield, FileText, Newspaper, Briefcase, Plus, Building2, UserCheck, Image, Download, ScrollText, Box, Tag, FolderTree } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getCurrentUser();

        // Check if user has Admin role
        if (!userData.roles || !userData.roles.includes('Admin')) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        setUser(userData);

        // Fetch dashboard stats
        try {
          const statsData = await api.getDashboardStats();
          setStats(statsData);
        } catch (error) {
          console.error('Failed to fetch stats:', error);
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
            <p className="text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex-1 bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                You do not have permission to access the admin dashboard.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-brand hover:bg-sky-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Go to Customer Dashboard
                </Link>
                <Link
                  href="/"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex-1 bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-brand" />
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-brand transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats ? stats.total_users.toLocaleString() : '...'}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-8 w-8 text-brand" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats ? stats.total_products.toLocaleString() : '...'}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats ? stats.total_orders.toLocaleString() : '...'}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats ? `€${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '...'}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-brand" />
                User Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link
                  href="/admin/users"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="h-4 w-4 text-brand" />
                    <h3 className="font-medium text-gray-900">Manage Users</h3>
                  </div>
                  <p className="text-sm text-gray-600">View, edit, and manage user accounts, roles, and approvals</p>
                </Link>
                <Link
                  href="/admin/accounts"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-brand" />
                    <h3 className="font-medium text-gray-900">Manage Accounts</h3>
                  </div>
                  <p className="text-sm text-gray-600">View accounts and their brand-specific discounts</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Orders Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand" />
                Orders Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link
                  href="/admin/orders"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="h-4 w-4 text-brand" />
                    <h3 className="font-medium text-gray-900">Manage Orders</h3>
                  </div>
                  <p className="text-sm text-gray-600">View, search, and manage customer orders</p>
                </Link>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand" />
                System Settings
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link
                  href="/admin/slides"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Image className="h-4 w-4 text-brand" />
                    <h3 className="font-medium text-gray-900">Manage Slides</h3>
                  </div>
                  <p className="text-sm text-gray-600">Create and manage homepage slides</p>
                </Link>
                <Link
                  href="/admin/order-exports"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="h-4 w-4 text-brand" />
                    <h3 className="font-medium text-gray-900">Orders Exports</h3>
                  </div>
                  <p className="text-sm text-gray-600">Show most recent CSV exports or force jobs</p>
                </Link>
                <Link
                  href="/admin/logs"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ScrollText className="h-4 w-4 text-brand" />
                    <h3 className="font-medium text-gray-900">Activity Logs</h3>
                  </div>
                  <p className="text-sm text-gray-600">Monitor system activity</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Product Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-brand" />
                Product Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link
                  href="/admin/products"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Box className="h-4 w-4 text-brand" />
                    <h3 className="font-medium text-gray-900">Manage Products</h3>
                  </div>
                  <p className="text-sm text-gray-600">Show products, sync and trigger cleanups</p>
                </Link>
                <Link
                  href="/admin/brands"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="h-4 w-4 text-brand" />
                    <h3 className="font-medium text-gray-900">Manage Brands</h3>
                  </div>
                  <p className="text-sm text-gray-600">Browse currently synced brands</p>
                </Link>
                <Link
                  href="/admin/categories"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FolderTree className="h-4 w-4 text-brand" />
                    <h3 className="font-medium text-gray-900">Manage Categories</h3>
                  </div>
                  <p className="text-sm text-gray-600">Show category results and sync status</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand" />
              Content Management
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/admin/articles"
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <Newspaper className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Manage Articles</h3>
                    <p className="text-sm text-gray-600">View, create, and edit news articles and blog posts</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/articles/new"
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all bg-gradient-to-br from-blue-50 to-transparent"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-brand rounded-full p-2 mt-1">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Create New Article</h3>
                    <p className="text-sm text-gray-600">Write and publish a new article or blog post</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/careers"
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2 mt-1">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Manage Careers</h3>
                    <p className="text-sm text-gray-600">View, create, and edit job listings and career opportunities</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/careers/create"
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand hover:shadow-md transition-all bg-gradient-to-br from-purple-50 to-transparent"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-purple-600 rounded-full p-2 mt-1">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Create New Career Listing</h3>
                    <p className="text-sm text-gray-600">Post a new job opportunity on the careers page</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
