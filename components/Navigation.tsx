'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { Search, User, ShoppingBag, Shield, Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { api, Brand, Product, User as UserType } from '@/lib/api';
import { slugify } from '@/lib/utils';
import CartIcon from './CartIcon';

const languages = [
  // Temporarily disabled in the nav menu (English remains the site's
  // underlying default/fallback locale, see i18n.ts / i18n/routing.ts):
  // { code: 'en', name: 'English', countryCode: 'gb' },
  { code: 'de', name: 'Deutsch', countryCode: 'de' },
  { code: 'fr', name: 'Français', countryCode: 'fr' },
  { code: 'it', name: 'Italiano', countryCode: 'it' },
  // Temporarily disabled until translations are complete:
  // { code: 'nl', name: 'Nederlands', countryCode: 'nl' },
  // { code: 'pl', name: 'Polski', countryCode: 'pl' },
];

const CURRENCY = { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' };

export default function Navigation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const isFetchingUser = useRef(false);
  const lastTokenCheck = useRef<string | null>(null);

  const t = useTranslations('navigation');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  // Track when component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch current user if authenticated
  useEffect(() => {
    const fetchCurrentUser = async () => {
      // Prevent duplicate fetches
      if (isFetchingUser.current) return;

      const token = api.getToken();

      if (token) {
        isFetchingUser.current = true;
        try {
          const userData = await api.getCurrentUser();
          setCurrentUser(userData);
          lastTokenCheck.current = token;
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          setCurrentUser(null);
          lastTokenCheck.current = null;
        } finally {
          isFetchingUser.current = false;
        }
      } else {
        setCurrentUser(null);
        lastTokenCheck.current = null;
      }
    };

    // Initial fetch
    fetchCurrentUser();

    // Poll for token changes (check every 2 seconds, not 500ms)
    const interval = setInterval(() => {
      const token = api.getToken();

      // Only fetch if token has changed
      if (token !== lastTokenCheck.current) {
        fetchCurrentUser();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run once on mount

  // Lazy load brands only when dropdown is opened
  useEffect(() => {
    if (isBrandsOpen && brands.length === 0 && !brandsLoading) {
      const fetchBrands = async () => {
        setBrandsLoading(true);
        try {
          const brandsData = await api.getBrands();
          setBrands(brandsData);
        } catch (error) {
          console.error('Failed to fetch brands:', error);
        } finally {
          setBrandsLoading(false);
        }
      };

      fetchBrands();
    }
  }, [isBrandsOpen]);

  // Refetch brands when user changes (login/logout) to apply country filtering
  useEffect(() => {
    if (brands.length > 0) {
      const refetchBrands = async () => {
        try {
          const brandsData = await api.getBrands();
          setBrands(brandsData);
        } catch (error) {
          console.error('Failed to refetch brands:', error);
        }
      };
      refetchBrands();
    }
  }, [currentUser?.id]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await api.searchProducts(searchQuery.trim(), 5);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  const handleProductClick = (product: Product) => {
    const brandSlug = slugify(product.brand?.name || '');
    // Use name1_en from description for the base product slug
    const productName = product.description?.name1_en || product.name;
    const productSlug = slugify(productName);

    // If product has a variant, link to the variant page
    if (product.variant && product.description?.name2_en) {
      const variantSlug = slugify(product.description.name2_en);
      router.push(`/${brandSlug}/${productSlug}/${variantSlug}`);
    } else {
      router.push(`/${brandSlug}/${productSlug}`);
    }

    setShowSearchResults(false);
    setSearchQuery('');
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

  const handleLanguageChange = (language: typeof languages[0]) => {
    setIsLanguageOpen(false);

    startTransition(() => {
      // Use next-intl's router to switch locale while preserving the current path
      router.replace(pathname, { locale: language.code });
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20 gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-brand hover:text-blue-400 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo - Responsive */}
          <div className="flex-shrink-0">
            <Link href="/">
              {/* Mobile logo - compact version */}
              <img
                src="https://media.sound-service.eu/images/imad/iMAD_logo.jpg"
                alt="iMAD"
                className="h-8 w-auto md:hidden"
              />
              {/* Desktop logo - full version */}
              <img
                src="/logo.svg"
                alt="Sound Service European Music Distribution"
                className="hidden md:block h-12 w-auto"
              />
            </Link>
          </div>

          {/* Center Search Bar - Hidden on mobile, shown on md+ */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  aria-label={t('search')}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery.trim().length >= 2 && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
                    {isSearching ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((product) => {
                          const imageUrl = product.description?.image1
                            ? `https://media.sound-service.eu/Artikelbilder/Shopsystem/278x148/${product.description.image1}`
                            : null;

                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleProductClick(product)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              {/* Product Image */}
                              <div className="shrink-0 w-16 h-16 border border-gray-200 rounded overflow-hidden">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={product.description?.alt1 || product.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {product.brand?.name} {getProductName1(product)}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {getProductName2(product)}{getProductName2(product) ? ' • ' : ''}SKU: {product.code}
                                </p>
                                {product.available_for_sale && (
                                  <p className="text-sm font-semibold text-brand mt-1">
                                    {parseFloat(product.trade_ch).toFixed(2)} {CURRENCY.symbol}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        {/* View All Results Link */}
                        <button
                          type="submit"
                          className="w-full px-4 py-3 text-sm text-brand hover:bg-gray-50 transition-colors text-center font-medium"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right section with icons */}
          <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
            {/* Currency - Hidden on mobile */}
            <div className="hidden sm:flex items-center px-3 py-2">
              <span className="text-sm font-medium text-gray-700">{CURRENCY.code}</span>
            </div>

            {/* Language Selector - Hidden on mobile */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Select language"
              >
                <img
                  src={`https://flagcdn.com/w40/${currentLanguage.countryCode}.png`}
                  srcSet={`https://flagcdn.com/w80/${currentLanguage.countryCode}.png 2x`}
                  width="24"
                  height="18"
                  alt={currentLanguage.name}
                  className="rounded-sm"
                />
              </button>
              {isLanguageOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLanguageOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-lg rounded-md min-w-[180px] py-2 z-20">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 transition-colors ${currentLanguage.code === language.code ? 'bg-gray-50' : ''
                          }`}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${language.countryCode}.png`}
                          srcSet={`https://flagcdn.com/w80/${language.countryCode}.png 2x`}
                          width="24"
                          height="18"
                          alt={language.name}
                          className="rounded-sm"
                        />
                        <span className="text-sm text-gray-900">{language.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Admin Dashboard Link - Hidden on mobile */}
            {isMounted && currentUser && currentUser.roles && currentUser.roles.includes('Admin') && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:block p-2 text-brand hover:text-blue-400 transition-colors"
                aria-label="Admin Dashboard"
              >
                <Shield className="h-5 w-5" />
              </Link>
            )}

            {/* User/Login Link */}
            {isMounted && (
              <Link
                href={
                  api.getToken()
                    ? currentUser?.roles?.includes('Admin')
                      ? "/admin/dashboard"
                      : "/dashboard"
                    : "/login"
                }
                className="p-1 sm:p-2 text-brand hover:text-blue-400 transition-colors"
                aria-label={api.getToken() ? 'Dashboard' : t('account')}
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Cart Icon - Hidden for Admin users */}
            {isMounted && !(currentUser?.roles?.includes('Admin')) && (
              <div className="p-1 sm:p-2">
                <CartIcon />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Menu - Desktop only */}
      <nav className="hidden lg:block bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-8">
              {/* Brands with submenu */}
              <li className="relative">
                <button
                  onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                  onMouseEnter={() => setIsBrandsOpen(true)}
                  onMouseLeave={() => setIsBrandsOpen(false)}
                  className="hover:text-gray-200 transition-colors flex items-center"
                >
                  {t('brands')}
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isBrandsOpen && (
                  <div
                    className="absolute left-0 top-full mt-0 bg-white text-gray-900 shadow-lg rounded-md min-w-[1200px] p-4"
                    onMouseEnter={() => setIsBrandsOpen(true)}
                    onMouseLeave={() => setIsBrandsOpen(false)}
                  >
                    {brandsLoading ? (
                      <p className="px-4 py-2 text-sm text-gray-500">{t('loading')}</p>
                    ) : brands.length === 0 ? (
                      <p className="px-4 py-2 text-sm text-gray-500">{t('noBrandsYet')}</p>
                    ) : (
                      <div className="grid grid-cols-8 gap-3">
                        {brands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/brands/${brand.slug}`}
                            className="flex items-center justify-center p-3 border border-gray-200 rounded-md hover:shadow-md hover:border-brand transition-all bg-white"
                            onClick={() => setIsBrandsOpen(false)}
                            title={brand.name}
                          >
                            <img
                              src={`https://media.sound-service.eu/images/brands/${brand.code}.jpg`}
                              alt={brand.name}
                              className="max-w-full max-h-16 object-contain"
                              onError={(e) => {
                                // Fallback to text if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.brand-name-fallback')) {
                                  const textNode = document.createElement('span');
                                  textNode.className = 'brand-name-fallback text-sm font-medium text-gray-900 text-center';
                                  textNode.textContent = brand.name;
                                  parent.appendChild(textNode);
                                }
                              }}
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>

              {/* About Us */}
              <li>
                <Link href="/about" className="text-white hover:text-gray-200 transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>

              {/* News */}
              <li>
                <a href="https://blog.sound-service.eu/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 transition-colors">
                  {t('news')}
                </a>
              </li>

              {/* Sales Areas */}
              <li>
                <Link href="/sales-areas" className="text-white hover:text-gray-200 transition-colors">
                  {t('salesAreas')}
                </Link>
              </li>

              {/* Returns */}
              <li>
                <Link href="/returns" className="text-white hover:text-gray-200 transition-colors">
                  {t('returns')}
                </Link>
              </li>
            </div>

            {/* Contact Link - Right side */}
            <li>
              <Link href="/contact" className="text-white hover:text-gray-200 transition-colors">
                {t('contact')}
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-white shadow-xl z-50 lg:hidden overflow-y-auto">
            <div className="p-4">
              {/* Close button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="mb-6">
                <img
                  src="https://media.sound-service.eu/images/sound-service_logo_xs.svg"
                  alt="Sound Service"
                  className="h-10 w-auto"
                />
              </div>

              {/* Mobile Search */}
              <div className="mb-6">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('search')}
                      className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                      aria-label={t('search')}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </form>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {/* Brands */}
                <div>
                  <button
                    onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 !text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <span className="font-medium">{t('brands')}</span>
                    <svg className={`h-5 w-5 transition-transform ${isBrandsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isBrandsOpen && (
                    <div className="pl-4 pr-2 py-2 space-y-2 max-h-60 overflow-y-auto">
                      {brandsLoading ? (
                        <p className="px-4 py-2 text-sm !text-gray-500">{t('loading')}</p>
                      ) : brands.length === 0 ? (
                        <p className="px-4 py-2 text-sm !text-gray-500">{t('noBrandsYet')}</p>
                      ) : (
                        brands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/brands/${brand.slug}`}
                            className="block px-4 py-2 text-sm !text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => {
                              setIsBrandsOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            {brand.name}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* About Us */}
                <Link
                  href="/about"
                  className="block px-4 py-3 !text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('aboutUs')}
                </Link>

                {/* News */}
                <a
                  href="https://blog.sound-service.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 !text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('news')}
                </a>

                {/* Sales Areas */}
                <Link
                  href="/sales-areas"
                  className="block px-4 py-3 !text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('salesAreas')}
                </Link>

                {/* Returns */}
                <Link
                  href="/returns"
                  className="block px-4 py-3 !text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('returns')}
                </Link>
              </nav>

              {/* Currency & Language Selectors */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                {/* Currency */}
                <div className="w-full flex items-center justify-between px-4 py-3 text-gray-900">
                  <span className="font-medium">{t('currency')}</span>
                  <span className="text-sm font-medium text-gray-700">{CURRENCY.code} {CURRENCY.symbol}</span>
                </div>

                {/* Language Selector */}
                <div>
                  <button
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <span className="font-medium">{t('language')}</span>
                    <img
                      src={`https://flagcdn.com/w40/${currentLanguage.countryCode}.png`}
                      srcSet={`https://flagcdn.com/w80/${currentLanguage.countryCode}.png 2x`}
                      width="24"
                      height="18"
                      alt={currentLanguage.name}
                      className="rounded-sm"
                    />
                  </button>
                  {isLanguageOpen && (
                    <div className="mt-2 space-y-1">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => {
                            handleLanguageChange(language);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors ${currentLanguage.code === language.code ? 'bg-gray-50' : ''
                            }`}
                        >
                          <img
                            src={`https://flagcdn.com/w40/${language.countryCode}.png`}
                            srcSet={`https://flagcdn.com/w80/${language.countryCode}.png 2x`}
                            width="24"
                            height="18"
                            alt={language.name}
                            className="rounded-sm"
                          />
                          <span className="text-sm text-gray-900">{language.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Link (if admin) */}
              {isMounted && currentUser && currentUser.roles && currentUser.roles.includes('Admin') && (
                <div className="mt-4">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center space-x-2 px-4 py-3 text-brand hover:bg-gray-100 rounded-md transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
