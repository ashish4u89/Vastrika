/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { commerceStore } from '../services/store';

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: string[]; // Product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCouponError: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  cartCount: number;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('vastrika_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vastrika_wishlist');
      return saved ? JSON.parse(saved) : ['prod-001', 'prod-002'];
    } catch {
      return ['prod-001', 'prod-002'];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCodeState] = useState('');
  const [appliedCouponError, setAppliedCouponError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('vastrika_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vastrika_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product: Product, quantity = 1): boolean => {
    const existing = cart.find((i) => i.productId === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;
    const requestedQty = currentQtyInCart + quantity;

    if (requestedQty > product.availableQty) {
      showToast(`Only ${product.availableQty} available in stock.`);
      return false;
    }

    if (existing) {
      setCart((prev) =>
        prev.map((i) => (i.productId === product.id ? { ...i, quantity: requestedQty } : i))
      );
    } else {
      setCart((prev) => [...prev, { productId: product.id, product, quantity }]);
    }

    showToast(`Added "${product.name.slice(0, 24)}..." to bag`);
    return true;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = commerceStore.getProductById(productId);
    if (product && quantity > product.availableQty) {
      showToast(`Cannot exceed available stock of ${product.availableQty}`);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCodeState('');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from wishlist' : 'Saved to your wishlist');
      return updated;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;
    const pricing = commerceStore.validateAndPriceCart(
      cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      clean
    );
    if (pricing.discountPaise > 0) {
      setCouponCodeState(clean);
      setAppliedCouponError(null);
      showToast(`Coupon ${clean} applied successfully!`);
      return true;
    } else {
      setAppliedCouponError('Coupon is not applicable or minimum order value not met.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCodeState('');
    setAppliedCouponError(null);
  };

  // Authoritative calculations via store
  const pricing = commerceStore.validateAndPriceCart(
    cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    couponCode
  );

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        couponCode,
        setCouponCode: setCouponCodeState,
        appliedCouponError,
        applyCoupon,
        removeCoupon,
        cartCount,
        subtotalPaise: pricing.subtotalPaise,
        discountPaise: pricing.discountPaise,
        shippingPaise: pricing.shippingPaise,
        taxPaise: pricing.taxPaise,
        totalPaise: pricing.totalPaise,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
