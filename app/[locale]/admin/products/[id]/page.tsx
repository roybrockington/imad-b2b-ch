'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, Product } from '@/lib/api';
import {
  ArrowLeft,
  Package,
  CheckCircle,
  XCircle,
  Tag,
  Boxes,
  Euro,
  Calendar,
  Barcode,
  Archive
} from 'lucide-react';

export default function AdminProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const productId = parseInt(params.id as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!currentUser || !productId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await api.getProduct(productId);
        setProduct(data);
      } catch (error: any) {
        console.error('Failed to fetch product:', error);
        setError(error.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [currentUser, productId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: string) => {
    return `CHF ${parseFloat(price).toFixed(2)}`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <p className="mt-2 text-sm text-gray-500">Loading product details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button
            onClick={() => router.push(`/${locale}/admin/products`)}
            className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Products
          </button>
          <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="mx-auto h-12 w-12 text-red-400" />
            <p className="mt-2 text-sm text-red-600">{error || 'Product not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/${locale}/admin/products`)}
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-2 text-sm text-gray-600">Product Code: {product.code}</p>
            </div>
            <div className="flex gap-2">
              {product.published ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Unpublished
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-gray-400" />
                Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Product Code</label>
                  <p className="text-sm text-gray-900 font-mono">{product.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
                  <p className="text-sm text-gray-900">{product.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Brand</label>
                  <p className="text-sm text-gray-900">{product.brand?.name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <p className="text-sm text-gray-900">
                    {product.category?.[`name_${locale}` as keyof typeof product.category] ||
                     product.category?.name_en || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Barcode className="h-4 w-4 mr-1" />
                    EAN
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{product.ean || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Archive className="h-4 w-4 mr-1" />
                    Stock
                  </label>
                  <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock} units
                  </p>
                </div>
              </div>
            </div>

            {/* Product Attributes */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-gray-400" />
                Product Attributes
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.bundle && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Bundle Product
                  </span>
                )}
                {product.esd && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Electronic Software Distribution
                  </span>
                )}
                {product.qty_break_ch > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Quantity Break: {product.qty_break_ch} ({product.qty_discount_ch}% discount)
                  </span>
                )}
              </div>
              {!product.bundle && !product.esd && product.qty_break_ch === 0 && (
                <p className="text-sm text-gray-500">No special attributes</p>
              )}
            </div>

            {/* Pricing - CHF */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Euro className="h-5 w-5 mr-2 text-gray-400" />
                Pricing (CHF)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">SSP</label>
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(product.ssp_ch)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Trade Price</label>
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(product.trade_ch)}</p>
                </div>
                {product.promo_ch && (
                  <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-red-700 mb-1">Promotional Price</label>
                    <p className="text-2xl font-bold text-red-600">{formatPrice(product.promo_ch)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Descriptions */}
            {product.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Descriptions</h2>
                <div className="space-y-6">
                  {/* German */}
                  {(product.description.name1_de || product.description.name2_de ||
                    product.description.text1_de || product.description.text2_de) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <img
                          src="https://flagcdn.com/w40/de.png"
                          srcSet="https://flagcdn.com/w80/de.png 2x"
                          width="24"
                          height="18"
                          alt="German"
                          className="inline-block mr-2 rounded-sm"
                        />
                        German (DE)
                      </h3>
                      <div className="space-y-2 pl-8">
                        {product.description.name1_de && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Name 1</label>
                            <p className="text-sm text-gray-900">{product.description.name1_de}</p>
                          </div>
                        )}
                        {product.description.name2_de && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Name 2</label>
                            <p className="text-sm text-gray-900">{product.description.name2_de}</p>
                          </div>
                        )}
                        {product.description.text1_de && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Description 1</label>
                            <p className="text-sm text-gray-900">{product.description.text1_de}</p>
                          </div>
                        )}
                        {product.description.text2_de && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Description 2</label>
                            <p className="text-sm text-gray-900">{product.description.text2_de}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* English */}
                  {(product.description.name1_en || product.description.name2_en ||
                    product.description.text1_en || product.description.text2_en) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <img
                          src="https://flagcdn.com/w40/gb.png"
                          srcSet="https://flagcdn.com/w80/gb.png 2x"
                          width="24"
                          height="18"
                          alt="English"
                          className="inline-block mr-2 rounded-sm"
                        />
                        English (EN)
                      </h3>
                      <div className="space-y-2 pl-8">
                        {product.description.name1_en && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Name 1</label>
                            <p className="text-sm text-gray-900">{product.description.name1_en}</p>
                          </div>
                        )}
                        {product.description.name2_en && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Name 2</label>
                            <p className="text-sm text-gray-900">{product.description.name2_en}</p>
                          </div>
                        )}
                        {product.description.text1_en && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Description 1</label>
                            <p className="text-sm text-gray-900">{product.description.text1_en}</p>
                          </div>
                        )}
                        {product.description.text2_en && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Description 2</label>
                            <p className="text-sm text-gray-900">{product.description.text2_en}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Polish */}
                  {(product.description.name1_pl || product.description.name2_pl ||
                    product.description.text1_pl || product.description.text2_pl) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <img
                          src="https://flagcdn.com/w40/pl.png"
                          srcSet="https://flagcdn.com/w80/pl.png 2x"
                          width="24"
                          height="18"
                          alt="Polish"
                          className="inline-block mr-2 rounded-sm"
                        />
                        Polish (PL)
                      </h3>
                      <div className="space-y-2 pl-8">
                        {product.description.name1_pl && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Name 1</label>
                            <p className="text-sm text-gray-900">{product.description.name1_pl}</p>
                          </div>
                        )}
                        {product.description.name2_pl && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Name 2</label>
                            <p className="text-sm text-gray-900">{product.description.name2_pl}</p>
                          </div>
                        )}
                        {product.description.text1_pl && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Description 1</label>
                            <p className="text-sm text-gray-900">{product.description.text1_pl}</p>
                          </div>
                        )}
                        {product.description.text2_pl && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Description 2</label>
                            <p className="text-sm text-gray-900">{product.description.text2_pl}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Images */}
            {product.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const imageKey = `image${num}` as keyof typeof product.description;
                    const altKey = `alt${num}` as keyof typeof product.description;
                    const imageUrl = product.description?.[imageKey];
                    const altText = product.description?.[altKey];

                    if (!imageUrl) return null;

                    return (
                      <div key={num} className="border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={String(imageUrl)}
                          alt={String(altText || `Product image ${num}`)}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        {altText && (
                          <div className="p-2 bg-gray-50">
                            <p className="text-xs text-gray-600 truncate">{altText}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {![1, 2, 3, 4, 5, 6].some(num => product.description?.[`image${num}` as keyof typeof product.description]) && (
                  <p className="text-sm text-gray-500">No images available</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            {/* Promotional Period */}
            {(product.promo_start || product.promo_end || product.promo_ch) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  Promotional Period
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                    <p className="text-sm text-gray-900">{formatDate(product.promo_start)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                    <p className="text-sm text-gray-900">{formatDate(product.promo_end)}</p>
                  </div>
                  {(product.promo_start && product.promo_end) && (
                    <div className="pt-2 border-t border-gray-200">
                      {new Date() >= new Date(product.promo_start) && new Date() <= new Date(product.promo_end) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active Promotion
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Promotion Inactive
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Product ID</label>
                  <p className="text-sm text-gray-900 font-mono">{product.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                  <p className="text-sm text-gray-900">{formatDate(product.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(product.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Boxes className="h-5 w-5 mr-2 text-gray-400" />
                Stock Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Stock</label>
                  <p className={`text-2xl font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Source Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> This product data is populated from an external source and cannot be edited directly from this interface.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
