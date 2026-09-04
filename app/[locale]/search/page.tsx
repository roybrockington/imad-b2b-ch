'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, Product, User } from '@/lib/api';
import { slugify } from '@/lib/utils';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('search');
  const tPricing = useTranslations('pricing');
  const query = searchParams.get('q') || '';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api.getProducts({
          page: currentPage,
          search: query,
        });
        setProducts(data.data);
        setTotalPages(data.last_page);
        setTotalResults(data.total);
      } catch (err) {
        setError('Failed to load search results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, currentPage]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInStockToggle = () => {
    setInStockOnly(prev => !prev);
  };

  const displayedProducts = inStockOnly
    ? products.filter(p => (p.stock + (p.stock_eu ?? 0)) > 0)
    : products;

  // Get localized product name parts
  const getProductName1 = (product: Product): string => {
    if (!product.description) return product.name;
    const name1Key = `name1_${locale}` as keyof typeof product.description;
    return (product.description[name1Key] as string) || product.name;
  };

  const getProductName2 = (product: Product): string => {
    if (!product.description) return '';
    const name2Key = `name2_${locale}` as keyof typeof product.description;
    return (product.description[name2Key] as string) || '';
  };

  // Get full localized product name (for alt text, etc.)
  const getProductName = (product: Product): string => {
    return `${getProductName1(product)} ${getProductName2(product)}`.trim();
  };

  // Format price with the CHF symbol
  const formatPriceWithCurrency = (price: string): string => {
    return `CHF ${price}`;
  };

  const hasValidPrice = (product: Product): boolean => {
    const price = shouldShowTradePrices() ? product.trade_ch : product.ssp_ch;
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0;
  };

  // Stock status
  const getStockStatus = (stock: number, eta?: string | null): { text: string; color: string } => {
    if (stock === 0) {
      if (eta) {
        const etaDate = new Date(eta);
        const formattedDate = etaDate.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long'
        });
        return { text: `📅 ${formattedDate}`, color: 'text-blue-600' };
      }
      return { text: tPricing('callForAvailability'), color: 'text-gray-600' };
    } else if (stock <= 5) {
      return { text: `${stock} in stock`, color: 'text-orange-600' };
    } else if (stock <= 20) {
      return { text: `${stock} in stock`, color: 'text-green-600' };
    } else {
      return { text: '20+ in stock', color: 'text-green-600' };
    }
  };

  // Pricing logic
  const shouldShowTradePrices = (): boolean => {
    if (!currentUser) return false;
    const roles = currentUser.roles || [];
    return roles.includes('Customer') && currentUser.account_id !== null;
  };

  const isBrandAuthorized = (brandId: number): boolean => {
    if (!currentUser?.account?.discounts) return false;
    const discount = currentUser.account.discounts.find(d => d.brand_id === brandId);
    return discount ? discount.auth : false;
  };

  const isCategoryAuthorized = (brandId: number, categoryId: number): boolean => {
    const categoryDiscount = currentUser?.account?.category_discounts?.find(
      d => d.brand_id === brandId && d.category_id === categoryId
    );
    // Only restricted if there's an explicit entry with auth: false
    return !categoryDiscount || categoryDiscount.auth;
  };

  const getBrandDiscount = (brandId: number): number => {
    if (!currentUser?.account?.discounts) return 0;
    const discount = currentUser.account.discounts.find(d => d.brand_id === brandId);
    return discount ? parseFloat(discount.discount) : 0;
  };

  const getCategoryDiscount = (brandId: number, categoryId: number): number => {
    if (!currentUser?.account?.category_discounts) return 0;
    const categoryDiscount = currentUser.account.category_discounts.find(
      d => d.brand_id === brandId && d.category_id === categoryId
    );
    return categoryDiscount ? parseFloat(categoryDiscount.discount) : 0;
  };

  const getPrice = (product: Product): string => {
    const useTradePrices = shouldShowTradePrices();
    let price: string;

    if (useTradePrices) {
      price = product.trade_ch;

      // Apply brand discount
      const brandDiscountPercent = getBrandDiscount(product.brand_id);
      if (brandDiscountPercent > 0) {
        const numPrice = parseFloat(price);
        const discountedPrice = numPrice * (1 - brandDiscountPercent / 100);
        price = discountedPrice.toString();
      }

      // Apply additional category discount
      const categoryDiscountPercent = getCategoryDiscount(product.brand_id, product.category_id);
      if (categoryDiscountPercent > 0) {
        const numPrice = parseFloat(price);
        const discountedPrice = numPrice * (1 - categoryDiscountPercent / 100);
        price = discountedPrice.toString();
      }

      // Apply overall account discount if less than 1
      if (currentUser?.account?.discount) {
        const accountDiscount = parseFloat(currentUser.account.discount);
        if (accountDiscount < 1 && accountDiscount > 0) {
          const numPrice = parseFloat(price);
          price = (numPrice * accountDiscount).toString();
        }
      }
    } else {
      price = product.ssp_ch;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '0.00';

    return numPrice.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          {query && (
            <p className="mt-2 text-sm text-gray-600">
              {loading ? t('searching') : t('resultsFor', { count: totalResults, query })}
            </p>
          )}
        </div>

        {!query ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('enterQuery')}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">{t('loading')}</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('noResults', { query })}</p>
          </div>
        ) : (
          <>
            {/* In Stock Filter - only shown to authorized trade customers */}
            {shouldShowTradePrices() && (
              <div className="mb-6">
                <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                  <span className="text-sm font-medium text-gray-700">In stock only</span>
                  <button
                    role="switch"
                    aria-checked={inStockOnly}
                    onClick={handleInStockToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                      inStockOnly ? 'bg-brand' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        inStockOnly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {displayedProducts.map((product) => {
                const brandSlug = product.brand?.slug || '';
                const productName = product.description?.name1_en || product.name;
                const productSlug = slugify(productName);

                // If product has a variant, link to the variant page
                let productUrl = `/${locale}/${brandSlug}/${productSlug}`;
                if (product.variant && product.description?.name2_en) {
                  const variantSlug = slugify(product.description.name2_en);
                  productUrl = `/${locale}/${brandSlug}/${productSlug}/${variantSlug}`;
                }

                const imageUrl = product.description?.image1
                  ? `https://media.sound-service.eu/Artikelbilder/Shopsystem/278x148/${product.description.image1}`
                  : null;

                return (
                  <a
                    key={product.id}
                    href={productUrl}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow block flex flex-col"
                  >
                    <div className="aspect-square border border-gray-200 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.description?.alt1 || product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400">{t('noImage')}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {product.brand?.name} {getProductName1(product)}
                    </h3>
                    {getProductName2(product) && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {getProductName2(product)}
                      </p>
                    )}

                    {/* Spacer to push content to bottom */}
                    <div className="flex-grow"></div>

                    {/* Stock Status - Only show for authorized users with brand/category access */}
                    {shouldShowTradePrices() && isBrandAuthorized(product.brand_id) && isCategoryAuthorized(product.brand_id, product.category_id) && (
                      (() => {
                        // Combined CH (primary) + EU (backup) stock
                        const stock = product.stock + (product.stock_eu ?? 0);
                        const stockStatus = getStockStatus(stock, product.eta);
                        return (
                          <p className={`text-sm font-medium mb-2 ${stockStatus.color}`}>
                            {stockStatus.text}
                          </p>
                        );
                      })()
                    )}

                    {/* Price or Contact Sales */}
                    {!hasValidPrice(product) ? (
                      <p className="text-sm font-medium text-gray-600">
                        {tPricing('callForInfo')}
                      </p>
                    ) : shouldShowTradePrices() && (!isBrandAuthorized(product.brand_id) || !isCategoryAuthorized(product.brand_id, product.category_id)) ? (
                      <p className="text-sm font-medium text-gray-600">
                        {tPricing('contactSalesForPricing')}
                      </p>
                    ) : (
                      <p className="text-lg font-bold text-brand">
                        {formatPriceWithCurrency(getPrice(product))}
                      </p>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {(() => {
                    const pageNumbers: (number | string)[] = [];
                    const maxVisible = 5;

                    if (totalPages <= maxVisible + 2) {
                      for (let i = 1; i <= totalPages; i++) {
                        pageNumbers.push(i);
                      }
                    } else {
                      pageNumbers.push(1);

                      let startPage = Math.max(2, currentPage - 1);
                      let endPage = Math.min(totalPages - 1, currentPage + 1);

                      if (currentPage <= 3) {
                        startPage = 2;
                        endPage = maxVisible - 1;
                      }

                      if (currentPage >= totalPages - 2) {
                        startPage = totalPages - (maxVisible - 2);
                        endPage = totalPages - 1;
                      }

                      if (startPage > 2) {
                        pageNumbers.push('...');
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(i);
                      }

                      if (endPage < totalPages - 1) {
                        pageNumbers.push('...');
                      }

                      pageNumbers.push(totalPages);
                    }

                    return pageNumbers.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`px-4 py-2 border rounded-md ${
                            currentPage === page
                              ? 'bg-brand text-white border-brand'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
