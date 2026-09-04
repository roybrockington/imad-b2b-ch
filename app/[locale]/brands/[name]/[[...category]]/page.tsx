'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { api, Brand, Product, Category, User } from '@/lib/api';
import { slugify, buildLocalePath } from '@/lib/utils';
import Image from 'next/image';

export default function BrandPage() {
  const tCategories = useTranslations('categories');
  const tPricing = useTranslations('pricing');
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const brandSlug = params.name as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const p = parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initialUrlParsed, setInitialUrlParsed] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const initialLoadDone = useRef(false);

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

  // Parse URL pathname to extract category slugs and set initial selection
  useEffect(() => {
    // Only run once after categories are loaded and we haven't parsed the URL yet
    if (categories.length === 0 || initialUrlParsed) return;

    // Extract category slugs from pathname
    const pathParts = pathname.split('/').filter(Boolean);

    // Find the indices - pathname could be:
    // /brands/dixon/accessories-parts (no locale in path)
    // or /en/brands/dixon/accessories-parts (with locale)
    const brandsIndex = pathParts.indexOf('brands');
    const brandIndex = brandsIndex + 1;
    const categoryIndex = brandIndex + 1;

    const parentSlug = pathParts[categoryIndex]; // Category slug after brand
    const childSlug = pathParts[categoryIndex + 1];  // Subcategory slug

    // If no category in URL, mark as parsed and exit
    if (!parentSlug) {
      setInitialUrlParsed(true);
      return;
    }

    // Find parent category by slug
    const parentCategory = categories.find(cat => {
      const nameKey = `name_${locale}` as keyof Category;
      const name = cat[nameKey] as string;
      return slugify(name) === parentSlug;
    });

    if (!parentCategory) {
      setInitialUrlParsed(true);
      return;
    }

    // If we have a child slug, we'll wait for child categories to load
    // Otherwise, just set the parent
    if (!childSlug) {
      setSelectedCategoryId(parentCategory.id);
      setSelectedParentId(parentCategory.id);
      setInitialUrlParsed(true);
    } else {
      // Set parent first to trigger loading child categories
      setSelectedCategoryId(parentCategory.id);
      setSelectedParentId(parentCategory.id);
      // Don't mark as parsed yet - wait for child categories
    }
  }, [categories, pathname, locale, initialUrlParsed]);

  // Handle child category selection from URL after child categories are loaded
  useEffect(() => {
    // Only process if we have a parent selected but haven't finished parsing
    if (initialUrlParsed || !selectedParentId || childCategories.length === 0) return;

    // Extract child slug from pathname dynamically
    const pathParts = pathname.split('/').filter(Boolean);
    const brandsIndex = pathParts.indexOf('brands');
    const brandIndex = brandsIndex + 1;
    const categoryIndex = brandIndex + 1;
    const childSlug = pathParts[categoryIndex + 1]; // Child slug after parent category

    if (!childSlug) {
      // No child in URL, we're done parsing
      setInitialUrlParsed(true);
      return;
    }

    // Find child category by slug
    const childCategory = childCategories.find(cat => {
      const nameKey = `name_${locale}` as keyof Category;
      const name = cat[nameKey] as string;
      return slugify(name) === childSlug;
    });

    if (childCategory) {
      setSelectedCategoryId(childCategory.id);
      setInitialUrlParsed(true);
    } else {
      // Child not found, just mark as parsed
      setInitialUrlParsed(true);
    }
  }, [childCategories, pathname, locale, initialUrlParsed, selectedParentId]);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        // Only show full loading on initial load
        if (!initialLoadDone.current) {
          setLoading(true);
        } else {
          // Show products loading for subsequent category changes
          setProductsLoading(true);
        }

        // Pass the slug directly to the API
        const data = await api.getBrand(brandSlug, currentPage, selectedCategoryId);

        // Only update brand and categories on initial load
        if (!initialLoadDone.current) {
          setBrand(data.brand);
          setCategories(data.categories);
          initialLoadDone.current = true;

          // Mark URL as parsed after first data load if there's no category in URL
          // This prevents an extra re-render from the URL parsing effect
          const pathParts = pathname.split('/').filter(Boolean);
          const brandsIndex = pathParts.indexOf('brands');
          const categoryIndex = brandsIndex + 2; // Category would be after brand name
          if (!pathParts[categoryIndex]) {
            setInitialUrlParsed(true);
          }
        }

        // Keep child categories visible if we have them
        if (data.child_categories && data.child_categories.length > 0) {
          setChildCategories(data.child_categories);

          // Determine the parent ID based on whether selected category is parent or child
          // Only update if we don't already have a selectedParentId from URL parsing
          if (!selectedParentId && data.selected_category) {
            if (data.selected_category.parent_id === null) {
              // Selected category is a parent
              setSelectedParentId(data.selected_category.id);
            } else {
              // Selected category is a child, use its parent_id
              setSelectedParentId(data.selected_category.parent_id);
            }
          }

        } else if (data.selected_category && data.selected_category.parent_id) {
          // Fallback: If selected category is a child but no child_categories returned
          if (!selectedParentId) {
            setSelectedParentId(data.selected_category.parent_id);
          }
        } else {
          // Clear child categories if no parent is selected
          setChildCategories([]);
          if (selectedCategoryId === undefined) {
            setSelectedParentId(undefined);
          }
        }

        setSelectedCategory(data.selected_category || null);
        setProducts(data.products.data);
        setTotalPages(data.products.last_page);
      } catch (err) {
        setError('Failed to load brand data');
        console.error(err);
      } finally {
        setLoading(false);
        setProductsLoading(false);
      }
    };

    fetchBrandData();
  }, [brandSlug, currentPage, selectedCategoryId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const url = new URL(window.location.href);
    if (page === 1) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', page.toString());
    }
    window.history.pushState({}, '', url.toString());
    const productsElement = document.getElementById('products-grid');
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInStockToggle = () => {
    setInStockOnly(prev => !prev);
    setCurrentPage(1);
  };

  const displayedProducts = inStockOnly
    ? products.filter(p => (p.stock + (p.stock_eu ?? 0)) > 0)
    : products;

  const handleCategoryChange = (categoryId: number | undefined) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1); // Reset to first page when changing category

    // Update selectedParentId immediately for correct highlighting
    if (!categoryId) {
      // Clear both when "All Categories" is clicked
      setSelectedParentId(undefined);
    } else {
      // Check if this is a parent or child category
      const selectedCat = categories.find(c => c.id === categoryId);
      const selectedChild = childCategories.find(c => c.id === categoryId);

      if (selectedCat) {
        // It's a parent category - set it as the parent
        setSelectedParentId(categoryId);
      }
      // If it's a child, keep the existing selectedParentId
    }

    // Update URL without triggering navigation using window.history.pushState
    // This keeps the URL in sync while maintaining smooth performance
    let newUrl;

    if (!categoryId) {
      // No category selected - go to brand page
      newUrl = buildLocalePath(`/brands/${brandSlug}`, locale);
    } else {
      // Find if this is a parent or child category
      const selectedCat = categories.find(c => c.id === categoryId);
      const selectedChild = childCategories.find(c => c.id === categoryId);

      if (selectedCat) {
        // It's a parent category
        const categorySlug = getCategorySlug(selectedCat);
        newUrl = buildLocalePath(`/brands/${brandSlug}/${categorySlug}`, locale);
      } else if (selectedChild && selectedParentId) {
        // It's a child category - need to include parent in URL
        const parent = categories.find(c => c.id === selectedParentId);
        if (parent) {
          const parentSlug = getCategorySlug(parent);
          const childSlug = getCategorySlug(selectedChild);
          newUrl = buildLocalePath(`/brands/${brandSlug}/${parentSlug}/${childSlug}`, locale);
        }
      }
    }

    if (newUrl) {
      // Update URL without page navigation
      window.history.pushState({}, '', newUrl);
    }
  };

  // Helper to get category slug based on locale
  const getCategorySlug = (category: Category): string => {
    const nameKey = `name_${locale}` as keyof Category;
    const name = category[nameKey] as string;
    return slugify(name);
  };

  // Get the category name based on current locale
  const getCategoryName = (category: Category): string => {
    const nameKey = `name_${locale}` as keyof Category;
    return category[nameKey] as string;
  };

  // Format price with the CHF symbol
  const formatPriceWithCurrency = (price: string): string => {
    return `CHF ${price}`;
  };

  // Get stock availability text
  const getStockStatus = (stock: number, eta?: string | null): { text: string; color: string } => {
    if (stock === 0) {
      if (eta) {
        const etaDate = new Date(eta);
        const formattedDate = etaDate.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long'
        });
        return { text: `Eta ${formattedDate}`, color: 'text-yellow-600' };
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

  // Determine if user should see trade prices
  const shouldShowTradePrices = (): boolean => {
    if (!currentUser) return false;
    const roles = currentUser.roles || [];
    return roles.includes('Customer') && currentUser.account_id !== null;
  };

  // Check if user is authorized for a brand
  const isBrandAuthorized = (brandId: number): boolean => {
    if (!currentUser?.account?.discounts) return false;
    const discount = currentUser.account.discounts.find(d => d.brand_id === brandId);
    return discount ? discount.auth : false;
  };

  // Check if user is authorized for a specific brand+category combination
  const isCategoryAuthorized = (brandId: number, categoryId: number): boolean => {
    const categoryDiscount = currentUser?.account?.category_discounts?.find(
      d => d.brand_id === brandId && d.category_id === categoryId
    );
    // Only restricted if there's an explicit entry with auth: false
    return !categoryDiscount || categoryDiscount.auth;
  };

  // Get additional discount percentage for a brand
  const getBrandDiscount = (brandId: number): number => {
    if (!currentUser?.account?.discounts) return 0;
    const discount = currentUser.account.discounts.find(d => d.brand_id === brandId);
    return discount ? parseFloat(discount.discount) : 0;
  };

  // Get additional category discount percentage for a brand+category combination
  const getCategoryDiscount = (brandId: number, categoryId: number): number => {
    if (!currentUser?.account?.category_discounts) return 0;
    const categoryDiscount = currentUser.account.category_discounts.find(
      d => d.brand_id === brandId && d.category_id === categoryId
    );
    return categoryDiscount ? parseFloat(categoryDiscount.discount) : 0;
  };

  // Check if product has a valid price (non-zero)
  const hasValidPrice = (product: Product): boolean => {
    const price = shouldShowTradePrices() ? product.trade_ch : product.ssp_ch;
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0;
  };

  // Get price (CHF) with formatting
  const getPrice = (product: Product): string => {
    const useTradePrices = shouldShowTradePrices();
    let price: string;

    if (useTradePrices) {
      // Show trade prices for customers with account_id
      price = product.trade_ch;

      // Apply brand discount if available
      const brandDiscountPercent = getBrandDiscount(product.brand_id);
      if (brandDiscountPercent > 0) {
        const numPrice = parseFloat(price);
        const discountedPrice = numPrice * (1 - brandDiscountPercent / 100);
        price = discountedPrice.toString();
      }

      // Apply additional category discount if available
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
      // Show SSP prices for everyone else
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {brand?.name}
            </h1>

            {/* Brand Description */}
            {brand && (() => {
              const descriptionKey = `description_${locale}` as keyof Brand;
              const description = brand[descriptionKey];
              return description ? (
                <div className="mb-8 text-gray-700 prose max-w-none">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
              ) : null;
            })()}

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mb-6 space-y-4">
                {/* Parent Categories */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange(undefined)}
                      className={`px-4 py-2 rounded-full border transition-colors ${
                        selectedCategoryId === undefined
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-brand'
                      }`}
                    >
                      {tCategories('allCategories')}
                    </button>
                    {categories.map((category) => {
                      // Highlight parent if:
                      // 1. One of its children is selected (selectedParentId matches), OR
                      // 2. The parent itself is directly selected
                      const isParentActive = selectedParentId === category.id;
                      const isDirectlySelected = selectedCategoryId === category.id;
                      const shouldHighlight = isParentActive || isDirectlySelected;

                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.id)}
                          className={`px-4 py-2 rounded-full border transition-colors ${
                            shouldHighlight
                              ? 'bg-brand text-white border-brand'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-brand'
                          }`}
                        >
                          {getCategoryName(category)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Child Categories (shown when parent is selected) */}
                {childCategories.length > 0 && selectedParentId && (
                  <div className="pl-6 border-l-2 border-gray-200">
                                                {/*<p className="text-sm text-gray-600 mb-2">
                      Subcats:
                    </p>*/}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCategoryChange(selectedParentId)}
                        className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                          selectedCategoryId === selectedParentId && !childCategories.some(c => c.id === selectedCategoryId)
                            ? 'bg-brand text-white border-brand'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-brand'
                        }`}
                      >
                        {tCategories('all')}
                      </button>
                      {childCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.id)}
                          className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                            selectedCategoryId === category.id
                              ? 'bg-brand text-white border-brand'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-brand'
                          }`}
                        >
                          {getCategoryName(category)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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

            {/* Products Grid */}
            <div id="products-grid">
              {productsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-lg text-gray-500">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <p className="text-lg text-gray-500">No products available for this brand.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {displayedProducts.map((product) => {
                    // Convert product name1_en from description to URL-friendly slug
                    const productName = product.description?.name1_en || product.name;
                    const productSlug = slugify(productName);

                    // If product has a variant, link to the variant page
                    let productUrl = buildLocalePath(`/${brandSlug}/${productSlug}`, locale);
                    if (product.variant && product.description?.name2_en) {
                      const variantSlug = slugify(product.description.name2_en);
                      productUrl = buildLocalePath(`/${brandSlug}/${productSlug}/${variantSlug}`, locale);
                    }

                    // Get product image URL (using smaller size for grid performance)
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
                            <span className="text-gray-400">No Image</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {brand?.name} {getProductName1(product)}
                        </h3>
                        {getProductName2(product) && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            {getProductName2(product)}
                          </p>
                        )}

                        {/* Embargo badge - only visible to logged-in users */}
                        {currentUser && product.embargo && (
                          <span className="inline-block mb-2 bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold px-2 py-0.5 rounded">
                            EMBARGOED
                          </span>
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
                          // Show all pages if total is small
                          for (let i = 1; i <= totalPages; i++) {
                            pageNumbers.push(i);
                          }
                        } else {
                          // Always show first page
                          pageNumbers.push(1);

                          let startPage = Math.max(2, currentPage - 1);
                          let endPage = Math.min(totalPages - 1, currentPage + 1);

                          // Adjust if near the start
                          if (currentPage <= 3) {
                            startPage = 2;
                            endPage = maxVisible - 1;
                          }

                          // Adjust if near the end
                          if (currentPage >= totalPages - 2) {
                            startPage = totalPages - (maxVisible - 2);
                            endPage = totalPages - 1;
                          }

                          // Add ellipsis after first page if needed
                          if (startPage > 2) {
                            pageNumbers.push('...');
                          }

                          // Add middle pages
                          for (let i = startPage; i <= endPage; i++) {
                            pageNumbers.push(i);
                          }

                          // Add ellipsis before last page if needed
                          if (endPage < totalPages - 1) {
                            pageNumbers.push('...');
                          }

                          // Always show last page
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
            </div>
          </>
        )}
      </main>
    </div>
  );
}
