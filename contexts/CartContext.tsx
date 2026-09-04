'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/api';

export interface CartItem {
  product: Product;
  quantity: number;
  price: string; // Calculated price at time of adding
  currency: string;
  xwareCode?: string; // B-stock item code (if this is a B-stock item)
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, price: string, currency: string, xwareCode?: string) => void;
  removeItem: (productId: number, xwareCode?: string) => void;
  updateQuantity: (productId: number, quantity: number, xwareCode?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number, price: string, currency: string, xwareCode?: string) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.product.id === product.id && item.xwareCode === xwareCode
      );

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        // Add new item
        return [...currentItems, { product, quantity, price, currency, xwareCode }];
      }
    });
  };

  const removeItem = (productId: number, xwareCode?: string) => {
    setItems((currentItems) => currentItems.filter(
      (item) => !(item.product.id === productId && item.xwareCode === xwareCode)
    ));
  };

  const updateQuantity = (productId: number, quantity: number, xwareCode?: string) => {
    if (quantity <= 0) {
      removeItem(productId, xwareCode);
      return;
    }

    setItems((currentItems) => {
      const newItems = [...currentItems];
      const itemIndex = newItems.findIndex(
        (item) => item.product.id === productId && item.xwareCode === xwareCode
      );
      if (itemIndex > -1) {
        newItems[itemIndex].quantity = quantity;
      }
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price);
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
