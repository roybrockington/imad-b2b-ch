'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, Product, Brand, Category } from '@/lib/api';
import { Search, Filter, ChevronLeft, ChevronRight, Package, CheckCircle, XCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const router = useRouter();
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');

  // Check authentication and admin role
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();

      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }

      try {
        const user = await api.getCurrentUser();

        if (!user.roles?.includes('Admin')) {
          router.push(`/${locale}`);
          return;
        }

        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push(`/${locale}/login`);
      }
    };

    checkAuth();
  }, [locale, router]);

  // Fetch brands and categories for filters
  useEffect(() => {
    const fetchFilters = async () => {
      if (!currentUser) return;

      try {
        const brandsData = await api.getAdminBrands();
        setBrands(brandsData);
        // TODO: Implement getCategories endpoint or fetch categories from another source
        // setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      }
    };

    fetchFilters();
  }, [currentUser]);

  // Fetch products with pagination and filters
  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          per_page: 15
        };

        if (searchQuery) {
          params.search = searchQuery;
        }
        if (brandFilter) {
          params.brand_id = brandFilter;
        }
        if (categoryFilter) {
          params.category_id = categoryFilter;
        }
        if (publishedFilter !== '') {
          params.published = publishedFilter === 'true';
        }

        const response = await api.getProducts(params);
        setProducts(response.data || []);
        setTotalPages(response.last_page || 1);
        setTotal(response.total || 0);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentUser, currentPage, searchQuery, brandFilter, categoryFilter, publishedFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setBrandFilter('');
    setCategoryFilter('');
    setPublishedFilter('');
    setCurrentPage(1);
  };

  const getBrandName = (brandId: number) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || '-';
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.[`name_${locale}` as keyof Category] || category?.name_en || '-';
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your product catalog, categories, brands, and publishing status
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Products
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, code, or EAN..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                </div>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Brand Filter */}
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  id="brand"
                  value={brandFilter}
                  onChange={(e) => {
                    setBrandFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-brand"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-brand"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category[`name_${locale}` as keyof Category] || category.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Published Filter */}
              <div>
                <label htmlFor="published" className="block text-sm font-medium text-gray-700 mb-1">
                  Published Status
                </label>
                <select
                  id="published"
                  value={publishedFilter}
                  onChange={(e) => {
                    setPublishedFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-brand"
                >
                  <option value="">All</option>
                  <option value="true">Published</option>
                  <option value="false">Unpublished</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-brand text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {products.length} of {total} products
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
              <p className="mt-2 text-sm text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price (EU)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/${locale}/admin/products/${product.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getBrandName(product.brand_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getCategoryName(product.category_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        CHF {parseFloat(product.ssp_ch).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.published ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unpublished
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;
              const isWithinRange = Math.abs(page - currentPage) <= 2;
              const isFirstOrLast = page === 1 || page === totalPages;

              if (!isWithinRange && !isFirstOrLast) {
                if (page === currentPage - 3 || page === currentPage + 3) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-md border ${
                    isCurrentPage
                      ? 'bg-brand text-white border-brand'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
