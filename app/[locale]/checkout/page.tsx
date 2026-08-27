'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { useCart } from '@/contexts/CartContext';
import { api, User, Address, Country } from '@/lib/api';
import { slugify } from '@/lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCart();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [orderReference, setOrderReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingCharge, setShippingCharge] = useState<number>(0);
  const [freightCharge, setFreightCharge] = useState<number>(0);
  const [loadingCharges, setLoadingCharges] = useState(false);

  // Fetch current user and addresses
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const user = await api.getCurrentUser();

          // Redirect Admin users away from checkout
          if (user.roles?.includes('Admin')) {
            router.push(`/${locale}/admin/dashboard`);
            return;
          }

          // Redirect users without approved account away from checkout
          if (user.account_id === null) {
            router.push(`/${locale}/dashboard`);
            return;
          }

          setCurrentUser(user);

          // Fetch addresses for the user's account
          if (user.account_id) {
            try {
              const addressesData = await api.getAddresses();
              setAddresses(addressesData);

              // Auto-select default address
              const defaultAddress = addressesData.find(addr => addr.default === 1);
              if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
              } else if (addressesData.length > 0) {
                // If no default, select first address
                setSelectedAddressId(addressesData[0].id);
              }
            } catch (error) {
              console.error('Failed to fetch addresses:', error);
            }
          }
        } else {
          router.push(`/${locale}/login`);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push(`/${locale}/login`);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [locale, router]);

  // Redirect if cart is empty (but not if order was just placed)
  useEffect(() => {
    if (!loading && items.length === 0 && !orderPlaced) {
      router.push(`/${locale}/cart`);
    }
  }, [items, loading, locale, router, orderPlaced]);

  // Calculate shipping and freight charges when address changes
  useEffect(() => {
    const calculateCharges = async () => {
      if (!selectedAddressId || !currentUser || items.length === 0) {
        setShippingCharge(0);
        setFreightCharge(0);
        return;
      }

      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress || !selectedAddress.country) {
        setShippingCharge(0);
        setFreightCharge(0);
        return;
      }

      setLoadingCharges(true);
      try {
        // Fetch country data
        const country = await api.getCountry(selectedAddress.country);
        const currency = items[0]?.currency || 'EUR';
        const currencyLower = currency.toLowerCase();

        // Calculate shipping charge (if not free shipping)
        const hasFreeShipping = currentUser?.account?.freeShipping || false;
        if (!hasFreeShipping) {
          const shippingColumn = `shipping_${currencyLower}` as keyof Country;
          const shipping = country[shippingColumn];
          setShippingCharge(shipping ? parseFloat(shipping as string) : 0);
        } else {
          setShippingCharge(0);
        }

        // Calculate freight charge (if any item has freight)
        const hasFreightProduct = items.some(item => item.product.freight);
        if (hasFreightProduct) {
          const freightColumn = `freight_${currencyLower}` as keyof Country;
          const freight = country[freightColumn];
          setFreightCharge(freight ? parseFloat(freight as string) : 0);
        } else {
          setFreightCharge(0);
        }
      } catch (error) {
        console.error('Failed to fetch country data:', error);
        setShippingCharge(0);
        setFreightCharge(0);
      } finally {
        setLoadingCharges(false);
      }
    };

    calculateCharges();
  }, [selectedAddressId, addresses, currentUser, items]);

  const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: { [key: string]: string } = {
      'EUR': '€',
      'PLN': 'zł',
      'CZK': 'Kč',
      'GBP': '£'
    };
    return symbols[currencyCode] || '€';
  };

  const parsePrice = (priceString: string, currencyCode: string): number => {
    if (currencyCode === 'GBP') {
      // British format: 1,234.56 (comma is thousands, dot is decimal)
      // Remove commas, keep dot as decimal
      return parseFloat(priceString.replace(/,/g, ''));
    } else {
      // European format: 1.234,56 (dot is thousands, comma is decimal)
      // Remove dots and spaces, replace comma with dot
      return parseFloat(priceString.replace(/[\s.]/g, '').replace(',', '.'));
    }
  };

  const formatPrice = (price: number | string, currencyCode: string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numPrice)) return '0.00';

    // Format based on currency
    if (currencyCode === 'GBP') {
      // British format: 1,234.56 (comma for thousands, dot for decimal)
      return numPrice.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (currencyCode === 'EUR') {
      // European format: 1.234,56 (dot for thousands, comma for decimal)
      return numPrice.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (currencyCode === 'CZK') {
      // Czech format: 1 234,56 (space for thousands, comma for decimal)
      return numPrice.toLocaleString('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (currencyCode === 'PLN') {
      // Polish format: 1 234,56 (space for thousands, comma for decimal)
      return numPrice.toLocaleString('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    // Default to European format
    return numPrice.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPriceWithCurrency = (price: number | string, currencyCode: string): string => {
    const formattedPrice = formatPrice(price, currencyCode);
    const symbol = getCurrencySymbol(currencyCode);

    // Currency symbol goes before the price for GBP
    if (currencyCode === 'GBP') {
      return `${symbol}${formattedPrice}`;
    }

    // Currency symbol goes after the price for other currencies
    return `${formattedPrice} ${symbol}`;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError(t('mustBeLoggedIn'));
      return;
    }

    if (currentUser.account_id === null) {
      setError(t('accountNotApproved'));
      return;
    }

    if (!selectedAddressId) {
      setError(t('selectAddress'));
      return;
    }

    if (!orderReference.trim()) {
      setError(t('poReferenceRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Prepare order data
    const orderData = {
      user_id: currentUser.id,
      account_id: currentUser.account_id,
      address_id: selectedAddressId,
      po: orderReference.trim(),
      notes: notes.trim(),
      items: items.map(item => {
        // Convert formatted price string to decimal format for backend
        const numericPrice = parsePrice(item.price, item.currency);
        const isCstock = item.xwareCode?.startsWith('3');
        const stockLabel = isCstock ? 'C-STOCK' : 'B-STOCK';
        return {
          product_id: item.product.id,
          quantity: item.quantity,
          price: numericPrice.toFixed(2),
          currency: item.currency,
          // Use xware code for B-stock/C-stock items, otherwise use product code
          product_code: item.xwareCode || item.product.code,
          product_name: item.xwareCode ? `[${stockLabel}] ${item.product.name}` : item.product.name
        };
      }),
      total: getTotalPrice(),
      currency: items[0]?.currency || 'EUR'
    };

    try {
      // Submit order to API
      const response = await api.createOrder(orderData);

      // Mark order as placed to prevent redirect to cart
      setOrderPlaced(true);

      // Clear cart after successful order
      clearCart();

      // Redirect to success page or order confirmation
      router.push(`/${locale}/order-confirmation?order=${response.id}`);
    } catch (err: any) {
      console.error('Order submission failed:', err);
      console.error('Order data that was sent:', orderData);
      setError(err.message || t('orderFailed'));
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">{t('loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!currentUser || items.length === 0) {
    return null; // Will redirect via useEffect
  }

  const totalPrice = getTotalPrice();
  const firstItemCurrency = items[0]?.currency || 'EUR';

  // Calculate insurance charge
  const insurancePercentage = currentUser?.account?.insurance ? parseFloat(currentUser.account.insurance) : 0;
  const insuranceCharge = (totalPrice * insurancePercentage) / 100;

  // Check if shipping applies (no free shipping)
  const hasFreeShipping = currentUser?.account?.freeShipping || false;

  const grandTotal = totalPrice + insuranceCharge + shippingCharge + freightCharge;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('accountInformation')}</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">{t('account')}</span> {currentUser.account?.name}
                  </p>
                  <p>
                    <span className="font-medium">{t('accountCode')}</span> {currentUser.account?.code}
                  </p>
                  <p>
                    <span className="font-medium">{t('email')}</span> {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Delivery Address Selection */}
              {addresses.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{t('deliveryAddress')}</h2>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === address.id
                            ? 'border-brand bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="mt-1 h-4 w-4 text-brand focus:ring-brand"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {address.name1}
                              </p>
                              {address.default === 1 && (
                                <span className="inline-block px-2 py-0.5 text-xs font-semibold text-white bg-brand rounded">
                                  {t('default')}
                                </span>
                              )}
                            </div>
                            {address.name2 && (
                              <p className="text-sm text-gray-600">{address.name2}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              {address.address1 && `${address.address1}, `}
                              {address.address2 && `${address.address2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.postcode} {address.city}, {address.country}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Reference */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('orderReference')}</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="orderReference" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('yourOrderReference')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="orderReference"
                      value={orderReference}
                      onChange={(e) => setOrderReference(e.target.value)}
                      placeholder={t('enterPONumber')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                      maxLength={100}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('poNumberHelp')}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('orderNotes')} <span className="text-gray-500">{t('optional')}</span>
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('specialInstructions')}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {notes.length}/500 {t('characters')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items Review */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('orderItems')}</h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const imageUrl = item.product.description?.image1
                      ? `https://media.sound-service.eu/Artikelbilder/Shopsystem/278x148/${item.product.description.image1}`
                      : null;

                    // Parse price based on currency format
                    const itemTotal = parsePrice(item.price, item.currency) * item.quantity;

                    // Use product id + xwareCode as unique key for B-stock items
                    const itemKey = item.xwareCode ? `${item.product.id}-${item.xwareCode}` : item.product.id.toString();
                    const isCstock = item.xwareCode?.startsWith('3');
                    const stockLabel = isCstock ? 'C-STOCK' : 'B-STOCK';
                    const stockBg = isCstock ? 'bg-purple-50' : 'bg-amber-50';
                    const stockBadgeColor = isCstock ? 'bg-purple-500' : 'bg-amber-500';
                    const stockTextColor = isCstock ? 'text-purple-700' : 'text-amber-700';

                    return (
                      <div
                        key={itemKey}
                        className={`flex gap-4 pb-3 border-b border-gray-200 last:border-0 ${
                          item.xwareCode ? `${stockBg} -mx-2 px-2 rounded` : ''
                        }`}
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.product.description?.alt1 || item.product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="text-gray-400 text-xs">{t('noImage')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {item.xwareCode && (
                              <span className={`inline-block ${stockBadgeColor} text-white text-xs font-bold px-1 py-0.5 rounded mr-1`}>
                                {stockLabel}
                              </span>
                            )}
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-gray-500">{t('sku')} {item.xwareCode || item.product.code}</p>
                          <p className={`text-sm mt-1 ${item.xwareCode ? stockTextColor : 'text-gray-700'}`}>
                            {formatPriceWithCurrency(item.price, item.currency)} × {item.quantity}
                          </p>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className={`font-semibold ${item.xwareCode ? stockTextColor : 'text-gray-900'}`}>
                            {formatPriceWithCurrency(itemTotal, item.currency)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('orderSummary')}</h2>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('items')}</span>
                    <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span className="font-medium">
                      {formatPriceWithCurrency(totalPrice, firstItemCurrency)}
                    </span>
                  </div>
                  {insuranceCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Insurance ({insurancePercentage}%)</span>
                      <span className="font-medium">
                        {formatPriceWithCurrency(insuranceCharge, firstItemCurrency)}
                      </span>
                    </div>
                  )}
                  {hasFreeShipping ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      {loadingCharges ? (
                        <span className="font-medium text-gray-400 italic">Calculating...</span>
                      ) : shippingCharge > 0 ? (
                        <span className="font-medium">
                          {formatPriceWithCurrency(shippingCharge, firstItemCurrency)}
                        </span>
                      ) : (
                        <span className="font-medium text-gray-400 italic">Select address</span>
                      )}
                    </div>
                  )}
                  {freightCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Freight</span>
                      {loadingCharges ? (
                        <span className="font-medium text-gray-400 italic">Calculating...</span>
                      ) : (
                        <span className="font-medium">
                          {formatPriceWithCurrency(freightCharge, firstItemCurrency)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>{t('total')}</span>
                  <span className="text-brand">
                    {formatPriceWithCurrency(grandTotal, firstItemCurrency)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand/90 transition-colors mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('placingOrder') : t('placeOrder')}
                </button>

                <Link
                  href={`/${locale}/cart`}
                  className="block text-center text-brand hover:text-brand/80 transition-colors text-sm"
                >
                  {t('backToCart')}
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
