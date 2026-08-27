'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import OriginOfArticle from '@/components/OriginOfArticle';
import { api, Product, User } from '@/lib/api';
import { buildLocalePath } from '@/lib/utils';
import parse from 'html-react-parser';
import Head from 'next/head';
import { useCart } from '@/contexts/CartContext';

export default function ProductPage() {
  const t = useTranslations('product');
  const tPricing = useTranslations('pricing');
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const brandNameSlug = params.brand as string;
  const productNameSlug = params.product as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [currency, setCurrency] = useState('EUR');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [bstockQuantity, setBstockQuantity] = useState(1);
  const [bstockAddedToCart, setBstockAddedToCart] = useState(false);
  const { addItem } = useCart();

  // Fetch current user then product so auth state is known before handling 404s
  useEffect(() => {
    const fetchUserAndProduct = async () => {
      try {
        setLoading(true);

        // Resolve auth state first
        const token = api.getToken();
        if (token) {
          try {
            const user = await api.getCurrentUser();
            setCurrentUser(user);
          } catch (error) {
            console.error('Failed to fetch user:', error);
          }
        }

        const data = await api.getProductByBrandAndName(brandNameSlug, productNameSlug);

        // If product has variants, redirect to the first variant
        if (data.variants && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          router.push(buildLocalePath(`/${brandNameSlug}/${productNameSlug}/${firstVariant.slug}`, locale));
          return;
        }

        setProduct(data);

        // Set first available image as selected
        if (data.description) {
          const imageBaseUrl = 'https://media.sound-service.eu/Artikelbilder/Shopsystem/890x486/';
          const firstImage = data.description.image1 || data.description.image2 ||
                           data.description.image3 || data.description.image4 ||
                           data.description.image5 || data.description.image6;
          if (firstImage) {
            setSelectedImage(`${imageBaseUrl}${firstImage}`);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('status 404')) {
          // A guest hitting a 404 may be trying to access an embargoed product —
          // prompt them to log in rather than showing a hard not-found.
          setError(api.getToken() ? 'not_found' : 'login_required');
        } else {
          setError('Failed to load product');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProduct();
  }, [brandNameSlug, productNameSlug, locale, router]);

  // Load currency from user account or localStorage
  useEffect(() => {
    const loadCurrency = () => {
      // Prioritize account currency if user is logged in
      if (currentUser?.account?.currency?.code) {
        setCurrency(currentUser.account.currency.code);
      } else {
        // Fallback to localStorage for non-logged-in users
        const savedCurrency = localStorage.getItem('currency');
        setCurrency(savedCurrency || 'EUR');
      }
    };

    // Initial load
    loadCurrency();

    // Listen for storage changes (when currency is changed in Navigation)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currency' && !currentUser?.account?.currency?.code) {
        // Only use localStorage if no account currency
        loadCurrency();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also poll for changes since storage event doesn't fire in same tab
    const interval = setInterval(loadCurrency, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser]);

  // Get localized product name parts
  const getProductName1 = (): string => {
    if (!product?.description) return product?.name || '';
    const name1Key = `name1_${locale}` as keyof typeof product.description;
    return (product.description[name1Key] as string) || product?.name || '';
  };

  const getProductName2 = (): string => {
    if (!product?.description) return '';
    const name2Key = `name2_${locale}` as keyof typeof product.description;
    return (product.description[name2Key] as string) || '';
  };

  // Get full localized product name (for alt text, etc.)
  const getProductName = (): string => {
    return `${getProductName1()} ${getProductName2()}`.trim();
  };

  // Get localized product description (returns HTML)
  const getProductDescription = (): string => {
    if (!product?.description) return '';

    const text1Key = `text1_${locale}` as keyof typeof product.description;
    const text2Key = `text2_${locale}` as keyof typeof product.description;

    const text1 = product.description[text1Key] as string;
    const text2 = product.description[text2Key] as string;

    // Combine text1 and text2 with spacing if both exist
    const parts = [];
    if (text1) parts.push(text1);
    if (text2) parts.push(text2);

    return parts.join('<div class="my-4"></div>');
  };

  // Get all product images
  const getProductImages = (): Array<{ src: string; alt: string; filename: string }> => {
    if (!product?.description) return [];

    const images: Array<{ src: string; alt: string; filename: string }> = [];
    const imageBaseUrl = 'https://media.sound-service.eu/Artikelbilder/Shopsystem/890x486/';

    for (let i = 1; i <= 6; i++) {
      const imageKey = `image${i}` as keyof typeof product.description;
      const altKey = `alt${i}` as keyof typeof product.description;
      const image = product.description[imageKey];
      const alt = product.description[altKey] as string;

      if (image) {
        images.push({
          src: `${imageBaseUrl}${image}`,
          alt: alt || `Product image ${i}`,
          filename: image as string
        });
      }
    }

    return images;
  };

  // Open lightbox with large image
  const openLightbox = (imageIndex: number) => {
    setLightboxImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Navigate to next image
  const nextImage = () => {
    const images = getProductImages();
    setLightboxImageIndex((prev) => (prev + 1) % images.length);
  };

  // Navigate to previous image
  const prevImage = () => {
    const images = getProductImages();
    setLightboxImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product || !currentUser) return;

    const price = getPrice();
    addItem(product, quantity, price, currency);
    setAddedToCart(true);

    // Reset the added to cart message after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Handle B-stock quantity change
  const handleBstockQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setBstockQuantity(newQuantity);
    }
  };

  // Get B-stock price with xware discount applied
  const getBstockPrice = (discountPercent: string): string => {
    if (!product) return '0,00';

    // B-stock only available for trade customers
    if (!shouldShowTradePrices()) return '0,00';

    let price: string;
    if (currency === 'EUR') price = product.trade_eu;
    else if (currency === 'PLN') price = product.trade_pl;
    else if (currency === 'CZK') price = product.trade_cz;
    else if (currency === 'GBP') price = product.trade_uk || product.trade_eu;
    else price = product.trade_eu;

    // Apply brand discount
    const brandDiscountPercent = getBrandDiscount(product.brand_id);
    if (brandDiscountPercent > 0) {
      const numPrice = parseFloat(price);
      price = (numPrice * (1 - brandDiscountPercent / 100)).toString();
    }

    // Apply category discount
    const categoryDiscountPercent = getCategoryDiscount(product.brand_id, product.category_id);
    if (categoryDiscountPercent > 0) {
      const numPrice = parseFloat(price);
      price = (numPrice * (1 - categoryDiscountPercent / 100)).toString();
    }

    // Apply overall account discount
    if (currentUser?.account?.discount) {
      const accountDiscount = parseFloat(currentUser.account.discount);
      if (accountDiscount < 1 && accountDiscount > 0) {
        const numPrice = parseFloat(price);
        price = (numPrice * accountDiscount).toString();
      }
    }

    // Apply B-stock discount
    const bstockDiscount = parseFloat(discountPercent);
    if (bstockDiscount > 0) {
      const numPrice = parseFloat(price);
      price = (numPrice * (1 - bstockDiscount / 100)).toString();
    }

    return formatPrice(parseFloat(price));
  };

  // Handle B-stock add to cart
  const handleBstockAddToCart = (xwareCode: string, discountPercent: string) => {
    if (!product || !currentUser) return;

    const price = getBstockPrice(discountPercent);
    addItem(product, bstockQuantity, price, currency, xwareCode);
    setBstockAddedToCart(true);

    // Reset the added to cart message after 3 seconds
    setTimeout(() => {
      setBstockAddedToCart(false);
    }, 3000);
  };

  // Get currency symbol
  const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: { [key: string]: string } = {
      'EUR': '€',
      'PLN': 'zł',
      'CZK': 'Kč',
      'GBP': '£'
    };
    return symbols[currencyCode] || '€';
  };

  // Format price with currency symbol in correct position
  const formatPriceWithCurrency = (price: string): string => {
    const symbol = getCurrencySymbol(currency);
    // GBP shows symbol before price, others show after
    if (currency === 'GBP') {
      return `${symbol}${price}`;
    }
    return `${price} ${symbol}`;
  };

  // Format price with locale-specific formatting
  const formatPrice = (price: number): string => {
    if (isNaN(price)) return '0,00';

    // Format based on currency
    if (currency === 'EUR') {
      // European format: 1.234,56 (dot for thousands, comma for decimal)
      return price.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (currency === 'CZK') {
      // Czech format: 1 234,56 (space for thousands, comma for decimal)
      return price.toLocaleString('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (currency === 'PLN') {
      // Polish format: 1 234,56 (space for thousands, comma for decimal)
      return price.toLocaleString('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (currency === 'GBP') {
      // British format: 1,234.56 (comma for thousands, dot for decimal)
      return price.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    return price.toFixed(2);
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

  // Calculate price based on selected currency
  const getPrice = (): string => {
    if (!product) return '0,00';

    const useTradePrices = shouldShowTradePrices();

    // Check for active promo (only for logged-in users)
    const now = new Date();
    const promoStart = product.promo_start ? new Date(product.promo_start) : null;
    const promoEnd = product.promo_end ? new Date(product.promo_end) : null;
    const isPromoActive = currentUser && promoStart && promoEnd && now >= promoStart && now <= promoEnd;

    let price: string = '0';
    let isPromoPrice = false;

    // Get promo or regular price based on currency
    if (isPromoActive) {
      // Check if promo price exists for current currency
      if (currency === 'EUR' && product.promo_eu) {
        price = product.promo_eu;
        isPromoPrice = true;
      } else if (currency === 'PLN' && product.promo_pl) {
        price = product.promo_pl;
        isPromoPrice = true;
      } else if (currency === 'CZK' && product.promo_cz) {
        price = product.promo_cz;
        isPromoPrice = true;
      } else if (currency === 'GBP' && product.promo_uk) {
        price = product.promo_uk;
        isPromoPrice = true;
      }
    }

    // If no promo price, use regular pricing
    if (!isPromoPrice) {
      if (useTradePrices) {
        // Show trade prices for customers with account_id
        if (currency === 'EUR') price = product.trade_eu;
        else if (currency === 'PLN') price = product.trade_pl;
        else if (currency === 'CZK') price = product.trade_cz;
        else if (currency === 'GBP') price = product.trade_uk || product.trade_eu;
        else price = product.trade_eu;
      } else {
        // Show SSP prices for everyone else
        if (currency === 'EUR') price = product.ssp_eu;
        else if (currency === 'PLN') price = product.ssp_pl;
        else if (currency === 'CZK') price = product.ssp_cz;
        else if (currency === 'GBP') price = product.ssp_uk || product.ssp_eu;
        else price = product.ssp_eu;
      }
    }

    // Apply discounts based on price type
    if (useTradePrices && !isPromoPrice) {
      // All discounts only apply to non-promo prices
      const brandDiscountPercent = getBrandDiscount(product.brand_id);
      if (brandDiscountPercent > 0) {
        const numPrice = parseFloat(price);
        const discountedPrice = numPrice * (1 - brandDiscountPercent / 100);
        price = discountedPrice.toString();
      }

      const categoryDiscountPercent = getCategoryDiscount(product.brand_id, product.category_id);
      if (categoryDiscountPercent > 0) {
        const numPrice = parseFloat(price);
        const discountedPrice = numPrice * (1 - categoryDiscountPercent / 100);
        price = discountedPrice.toString();
      }

      // Overall account discount also only applies to non-promo prices
      if (currentUser?.account?.discount) {
        const accountDiscount = parseFloat(currentUser.account.discount);
        if (accountDiscount < 1 && accountDiscount > 0) {
          const numPrice = parseFloat(price);
          price = (numPrice * accountDiscount).toString();
        }
      }
    }

    return formatPrice(parseFloat(price));
  };

  // Get regular (non-promo) price for strikethrough
  const getRegularPrice = (): string => {
    if (!product) return '0,00';

    const useTradePrices = shouldShowTradePrices();
    let price: string;

    if (useTradePrices) {
      if (currency === 'EUR') price = product.trade_eu;
      else if (currency === 'PLN') price = product.trade_pl;
      else if (currency === 'CZK') price = product.trade_cz;
      else if (currency === 'GBP') price = product.trade_uk || product.trade_eu;
      else price = product.trade_eu;

      // Apply brand discount
      const brandDiscountPercent = getBrandDiscount(product.brand_id);
      if (brandDiscountPercent > 0) {
        const numPrice = parseFloat(price);
        const discountedPrice = numPrice * (1 - brandDiscountPercent / 100);
        price = discountedPrice.toString();
      }

      // Apply category discount
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
      if (currency === 'EUR') price = product.ssp_eu;
      else if (currency === 'PLN') price = product.ssp_pl;
      else if (currency === 'CZK') price = product.ssp_cz;
      else if (currency === 'GBP') price = product.ssp_uk || product.ssp_eu;
      else price = product.ssp_eu;
    }

    return formatPrice(parseFloat(price));
  };

  // Check if product is on promo
  const isOnPromo = (): boolean => {
    if (!product || !currentUser) return false;

    const now = new Date();
    const promoStart = product.promo_start ? new Date(product.promo_start) : null;
    const promoEnd = product.promo_end ? new Date(product.promo_end) : null;

    // Check if promo is active and there's a promo price for the current currency
    const hasPromoPrice = (currency === 'EUR' && product.promo_eu) ||
                          (currency === 'PLN' && product.promo_pl) ||
                          (currency === 'CZK' && product.promo_cz) ||
                          (currency === 'GBP' && product.promo_uk);

    return !!(promoStart && promoEnd && now >= promoStart && now <= promoEnd && hasPromoPrice);
  };

  // Get RRP (Recommended Retail Price) based on currency
  const getRRP = (): string => {
    if (!product) return '0,00';

    let price: string;
    if (currency === 'EUR') price = product.ssp_eu;
    else if (currency === 'PLN') price = product.ssp_pl;
    else if (currency === 'CZK') price = product.ssp_cz;
    else if (currency === 'GBP') price = product.ssp_uk || product.ssp_eu;
    else price = product.ssp_eu;

    return formatPrice(parseFloat(price));
  };

  const hasValidPrice = (): boolean => {
    if (!product) return false;
    let price: string;
    if (shouldShowTradePrices()) {
      if (currency === 'EUR') price = product.trade_eu;
      else if (currency === 'PLN') price = product.trade_pl;
      else if (currency === 'CZK') price = product.trade_cz;
      else if (currency === 'GBP') price = product.trade_uk || product.trade_eu;
      else price = product.trade_eu;
    } else {
      if (currency === 'EUR') price = product.ssp_eu;
      else if (currency === 'PLN') price = product.ssp_pl;
      else if (currency === 'CZK') price = product.ssp_cz;
      else if (currency === 'GBP') price = product.ssp_uk || product.ssp_eu;
      else price = product.ssp_eu;
    }
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0;
  };

  // Get stock availability status
  const getStockStatus = (stock: number, eta?: string | null): { text: string; color: string; icon: string } => {
    if (stock === 0) {
      if (eta) {
        const etaDate = new Date(eta);
        const formattedDate = etaDate.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long'
        });
        return {
          text: formattedDate,
          color: 'text-yellow-600',
          icon: 'calendar'
        };
      }
      return {
        text: tPricing('callForAvailability'),
        color: 'text-gray-600',
        icon: 'phone'
      };
    } else if (stock <= 5) {
      return {
        text: `${stock} in stock - Limited availability`,
        color: 'text-orange-600',
        icon: 'warning'
      };
    } else if (stock <= 20) {
      return {
        text: `${stock} in stock`,
        color: 'text-green-600',
        icon: 'check'
      };
    } else {
      return {
        text: '20+ in stock',
        color: 'text-green-600',
        icon: 'check'
      };
    }
  };

  const images = getProductImages();

  return (
    <div className="min-h-screen bg-white">
      {product?.embargo && (
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
      )}
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">{t('loading')}</p>
          </div>
        ) : error === 'not_found' ? (
          notFound()
        ) : error === 'login_required' ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-sm">
              <p className="text-lg font-semibold text-gray-900 mb-2">Login required</p>
              <p className="text-sm text-gray-600 mb-6">Please log in to view this product.</p>
              <a
                href={buildLocalePath(`/login?redirect=${encodeURIComponent(`/${brandNameSlug}/${productNameSlug}`)}`, locale)}
                className="inline-block bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
              >
                Log in
              </a>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : product ? (
          <>
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
              <button
                onClick={() => router.push(buildLocalePath(`/brands/${brandNameSlug}`, locale))}
                className="text-brand hover:underline"
              >
                {product.brand?.name}
              </button>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-600">{getProductName()}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Image Gallery */}
              <div>
                {/* Main Image */}
                <div
                  className="aspect-video border border-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand transition-colors"
                  onClick={() => {
                    if (selectedImage && images.length > 0) {
                      // Find the index of the currently selected image
                      const currentIndex = images.findIndex(img => img.src === selectedImage);
                      openLightbox(currentIndex >= 0 ? currentIndex : 0);
                    }
                  }}
                >
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={getProductName()}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">No Image Available</span>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="grid grid-cols-6 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(image.src)}
                        className={`aspect-square bg-gray-100 rounded-md overflow-hidden border-2 transition-colors ${
                          selectedImage === image.src
                            ? 'border-brand'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.brand?.name} {getProductName1()}
                </h1>
                {getProductName2() && (
                  <h2 className="text-xl text-gray-600 mb-4">
                    {getProductName2()}
                  </h2>
                )}
                {product.brand && (
                    <div className="flex items-center gap-2">
                      <div className="rounded-md pb-4 bg-white">
                        <img
                          src={`https://media.sound-service.eu/images/brands/${product.brand.code}.jpg`}
                          alt={product.brand.name}
                          className="h-8 object-contain"
                          onError={(e) => {
                            // Fallback to text if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.brand-name-fallback')) {
                              const textNode = document.createElement('span');
                              textNode.className = 'brand-name-fallback text-sm font-medium text-gray-700 px-2';
                              textNode.textContent = product.brand?.name || '';
                              parent.appendChild(textNode);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                {/* SKU and Brand */}
                <div className="mb-6 space-y-2">
                  <p className="text-sm text-gray-500">
                    SKU: <span className="font-medium text-gray-700">{product.code}</span>
                  </p>
                  {product.ean && (
                    <p className="text-sm text-gray-500">
                      EAN: <span className="font-medium text-gray-700">{product.ean}</span>
                    </p>
                  )}
                  
                  {product.category && (
                    <p className="text-sm text-gray-500">
                      Category: <span className="font-medium text-gray-700">{product.category[`name_${locale}` as keyof typeof product.category] as string}</span>
                    </p>
                  )}
                </div>

                {/* Embargo Notice - only visible to logged-in users */}
                {currentUser && product.embargo && (
                  <div className="mb-6 bg-amber-50 border border-amber-300 rounded-md p-4">
                    <p className="text-sm font-semibold text-amber-800">{t('embargoTitle')}</p>
                    <p className="text-sm text-amber-700 mt-1">{t('embargoNotice')}</p>
                  </div>
                )}

                {/* Price */}
                {shouldShowTradePrices() && (!isBrandAuthorized(product.brand_id) || !isCategoryAuthorized(product.brand_id, product.category_id)) ? (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-2xl font-medium text-gray-600">
                      {tPricing('contactSalesForPricing')}
                    </p>
                  </div>
                ) : !hasValidPrice() ? (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-2xl font-medium text-gray-600">
                      {tPricing('callForInfo')}
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    {isOnPromo() && (
                      <div className="mb-2">
                        <span className="text-xl text-gray-500 line-through">
                          {formatPriceWithCurrency(getRegularPrice())}
                        </span>
                        <span className="ml-2 inline-block bg-red-500 text-white text-sm px-2 py-1 rounded">
                          PROMO
                        </span>
                      </div>
                    )}
                    <p className="text-4xl font-bold text-brand">
                      {formatPriceWithCurrency(getPrice())}
                    </p>
                    {shouldShowTradePrices() && (
                      <p className="text-sm text-gray-500 mt-2">
                        RRP: {formatPriceWithCurrency(getRRP())}
                      </p>
                    )}
                    {shouldShowTradePrices() && product.qty_break > 0 && parseFloat(product.qty_discount) > 0 && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm font-semibold text-green-800">
                          Volume Discount Available
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Buy {product.qty_break}+ units and save {parseFloat(product.qty_discount).toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Availability Status - Only show for authorized users with brand/category access */}
                {shouldShowTradePrices() && isBrandAuthorized(product.brand_id) && isCategoryAuthorized(product.brand_id, product.category_id) && (
                  <div className="mb-6">
                    {(() => {
                      // Check if user's account region is UK
                      const isUKRegion = currentUser?.account?.region?.code?.toLowerCase() === 'uk';

                      if (isUKRegion) {
                        // For UK customers, show both UK and EU stock
                        const ukStock = product.stock_uk ?? 0;
                        const euStock = product.stock;
                        const euEta = product.eta;

                        // If out of stock in UK but EU has stock, show 3 weeks from today as UK ETA
                        const threeWeeksFromToday = (() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 21);
                          return d.toISOString().split('T')[0];
                        })();
                        const ukEta = (ukStock === 0 && euStock > 0) ? threeWeeksFromToday : (product.eta_uk ?? product.eta);

                        const ukStockStatus = getStockStatus(ukStock, ukEta);
                        const euStockStatus = getStockStatus(euStock, euEta);

                        return (
                          <div className="space-y-3 flex gap-8">
                            {/* UK Stock */}
                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1">UK Availability</div>
                              <div className={`flex items-center ${ukStockStatus.color}`}>
                                {ukStockStatus.icon === 'check' && (
                                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {ukStockStatus.icon === 'warning' && (
                                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {ukStockStatus.icon === 'calendar' && (
                                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {ukStockStatus.icon === 'phone' && (
                                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                  </svg>
                                )}
                                <span className="font-medium">{ukStockStatus.text}</span>
                              </div>
                            </div>

                            {/* EU Stock - Only show if stock > 0 */}
                            {euStock > 0 && (
                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-1">EU Availability</div>
                                <div className={`flex items-center ${euStockStatus.color}`}>
                                  {euStockStatus.icon === 'check' && (
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {euStockStatus.icon === 'warning' && (
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {euStockStatus.icon === 'calendar' && (
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {euStockStatus.icon === 'phone' && (
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                  )}
                                  <span className="font-medium">{euStockStatus.text}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        // For non-UK customers, show only their regional stock
                        const stock = product.stock;
                        const eta = product.eta;
                        const stockStatus = getStockStatus(stock, eta);
                        return (
                          <div className={`flex items-center ${stockStatus.color}`}>
                            {stockStatus.icon === 'check' && (
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {stockStatus.icon === 'warning' && (
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            {stockStatus.icon === 'cross' && (
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            {stockStatus.icon === 'calendar' && (
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                            )}
                            {stockStatus.icon === 'phone' && (
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                            )}
                            <span className="font-medium">{stockStatus.text}</span>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Add to Cart or Contact Sales Button */}
                {shouldShowTradePrices() && (!isBrandAuthorized(product.brand_id) || !isCategoryAuthorized(product.brand_id, product.category_id)) ? (
                  <a
                    href="mailto:sales@sound-service.eu"
                    className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center block mb-6"
                  >
                    {t('contactSales')}
                  </a>
                ) : shouldShowTradePrices() ? (
                  <div className="mb-6">
                    {/* Quantity Input */}
                    <div className="flex items-center gap-4 mb-4">
                      <label className="text-sm font-medium text-gray-700">{t('quantity')}</label>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          className="w-20 text-center border-x border-gray-300 py-2 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors"
                    >
                      {addedToCart ? t('addedToCart') : t('addToCart')}
                    </button>
                  </div>
                ) : currentUser && currentUser.account_id === null ? (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">{t('accountPendingApproval')}</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">{t('loginToAddToCart')}</p>
                    <a
                      href={buildLocalePath(`/login`, locale)}
                      className="w-full bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors text-center block"
                    >
                      {t('logIn')}
                    </a>
                  </div>
                )}

                {/* B-Stock / C-Stock Option */}
                {shouldShowTradePrices() &&
                 isBrandAuthorized(product.brand_id) &&
                 isCategoryAuthorized(product.brand_id, product.category_id) &&
                 product.xware &&
                 product.xware.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {product.xware.map((xwareItem) => {
                      const isCstock = xwareItem.code.startsWith('3');
                      const stockLabel = isCstock ? 'C-STOCK' : 'B-STOCK';
                      const bgColor = isCstock ? 'bg-purple-50 border-purple-200' : 'bg-amber-50 border-amber-200';
                      const badgeColor = isCstock ? 'bg-purple-500' : 'bg-amber-500';
                      const priceColor = isCstock ? 'text-purple-600' : 'text-amber-600';
                      const buttonColor = isCstock ? 'bg-purple-500 hover:bg-purple-600' : 'bg-amber-500 hover:bg-amber-600';

                      return (
                      <div key={xwareItem.id} className={`${bgColor} border rounded-lg p-3 mb-2 last:mb-0`}>
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Badge & Info */}
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`shrink-0 ${badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                              {stockLabel}
                            </span>
                            <span className="text-sm text-gray-600 truncate">{xwareItem.code}</span>
                            <span className="shrink-0 flex items-center gap-1 text-xs text-green-600">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {xwareItem.stock}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline gap-2 ml-auto">
                            <span className="text-sm text-gray-400 line-through">
                              {getPrice()}
                            </span>
                            <span className={`text-lg font-bold ${priceColor}`}>
                              {formatPriceWithCurrency(getBstockPrice(xwareItem.discount))}
                            </span>
                            <span className="text-xs text-green-600 font-medium">
                              -{parseFloat(xwareItem.discount).toFixed(0)}%
                            </span>
                          </div>

                          {/* Quantity & Button */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-300 rounded bg-white">
                              <button
                                onClick={() => handleBstockQuantityChange(bstockQuantity - 1)}
                                className="px-2 py-1 hover:bg-gray-100 transition-colors text-sm"
                                disabled={bstockQuantity <= 1}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={xwareItem.stock}
                                value={bstockQuantity}
                                onChange={(e) => handleBstockQuantityChange(parseInt(e.target.value) || 1)}
                                className="w-10 text-center border-x border-gray-300 py-1 text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                onClick={() => handleBstockQuantityChange(bstockQuantity + 1)}
                                className="px-2 py-1 hover:bg-gray-100 transition-colors text-sm"
                                disabled={bstockQuantity >= xwareItem.stock}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleBstockAddToCart(xwareItem.code, xwareItem.discount)}
                              className={`${buttonColor} text-white py-1.5 px-3 rounded font-medium transition-colors text-sm whitespace-nowrap`}
                            >
                              {bstockAddedToCart ? '✓' : (t('addToCart') || 'Add')}
                            </button>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
                                {/* Description */}
                                {getProductDescription() && (
                                    <div className="prose prose-sm max-w-none mt-24">
                                        <div className="text-gray-600 [&_h3]:text-lg [&_h3]:mb-2 [&_h3]:font-bold [&_h4]:font-bold [&_p]:mb-3 [&_ul]:list-disc [&_ul]:mb-3 [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1">
                                            {parse(getProductDescription())}
                                        </div>
                                    </div>
                                )}

                                {/* Origin of Article */}
                                <OriginOfArticle product={product} />
          </>
        ) : null}
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Previous image"
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Image */}
          <img
            src={`https://media.sound-service.eu/Artikelbilder/Shopsystem/1200x837/${images[lightboxImageIndex].filename}`}
            alt={images[lightboxImageIndex].alt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Next image"
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
              {lightboxImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
