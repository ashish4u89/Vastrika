/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatters';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotalPaise,
    discountPaise,
    shippingPaise,
    taxPaise,
    totalPaise,
    couponCode,
    applyCoupon,
    removeCoupon,
    appliedCouponError,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isCartOpen) return null;

  // Free shipping progress calculation (threshold = 199,900 paise = ₹1,999)
  const freeShippingThresholdPaise = 199900;
  const progressPercent = Math.min(
    100,
    Math.round((subtotalPaise / freeShippingThresholdPaise) * 100)
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdPaise - subtotalPaise);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon);
      setInputCoupon('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between text-left">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#5E1324]" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Shopping Bag ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200 transition cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200/60 text-xs">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-stone-700">
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5 text-[#5E1324]" />
                    <span>Add {formatINR(remainingForFreeShipping)} more for FREE Express Delivery</span>
                  </span>
                  <span className="font-bold text-[#5E1324]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#5E1324] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>You unlocked FREE Express Delivery across India!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-base font-semibold text-stone-800">
                  Your shopping bag is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore our breathable linen and opulent festive silk collections to add your first drape.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-[#5E1324] text-white text-xs font-semibold rounded-lg hover:bg-[#781D32] transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="py-4 flex gap-3.5">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-18 h-22 object-cover rounded-lg bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-stone-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-stone-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                        {item.product.fabric.split(' ')[0]} · {item.product.color}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 transition text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-800 font-mono tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 transition text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-[#5E1324] tabular-nums">
                          {formatINR(item.product.sellingPricePaise * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-[#FAF7F2] space-y-3.5">
              {/* Coupon Form */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Code '{couponCode}' applied</span>
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-500 hover:text-stone-900 underline text-[11px] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      placeholder="Enter promo coupon (e.g. FESTIVE10)"
                      className="flex-1 px-3 py-1.5 text-xs uppercase bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {appliedCouponError && (
                  <p className="text-[11px] text-rose-600 mt-1">{appliedCouponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 font-sans border-t border-stone-200/60 pt-2.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-900 tabular-nums">
                    {formatINR(subtotalPaise)}
                  </span>
                </div>

                {discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-{formatINR(discountPaise)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-mono text-stone-900 tabular-nums">
                    {formatINR(taxPaise)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-mono tabular-nums">
                    {shippingPaise === 0 ? (
                      <strong className="text-emerald-700">FREE</strong>
                    ) : (
                      formatINR(shippingPaise)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-300">
                  <span>Total Amount</span>
                  <span className="font-mono text-base text-[#5E1324] tabular-nums">
                    {formatINR(totalPaise)}
                  </span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>100% Encrypted & Secure Razorpay Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
