'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartIcon() {
  const locale = useLocale();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Link
      href={`/${locale}/cart`}
      className="relative text-brand hover:text-blue-400 transition-colors"
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
