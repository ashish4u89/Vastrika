/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatINR, checkPincodeServiceability } from '../../utils/formatters';
import {
  X,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Check,
  Share2,
  Sparkles,
  Info,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectCheckout: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onDirectCheckout,
}) => {
  if (!product) return null;

  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<ReturnType<
    typeof checkPincodeServiceability
  > | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.availableQty <= 0;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkPincodeServiceability(pincode);
    setPincodeStatus(result);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto max-h-[92vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-black flex items-center justify-center shadow-md transition cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Gallery (5 cols) */}
        <div className="md:w-1/2 bg-stone-100 p-4 sm:p-6 flex flex-col justify-between">
          <div className="aspect-3/4 rounded-xl overflow-hidden bg-white shadow-inner relative">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-[#5E1324] text-white text-xs font-bold px-2.5 py-1 rounded shadow">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    selectedImage === idx
                      ? 'border-[#5E1324] ring-1 ring-[#5E1324]'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module (7 cols) */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[85vh] flex flex-col justify-between space-y-6 text-left">
          <div className="space-y-4">
            {/* Header: Collection unboxed tag & SKU */}
            <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
              <span className="text-[#5E1324] font-semibold uppercase tracking-wider">
                {product.category}
              </span>
              <span>SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
              {product.name}
            </h2>

            {/* Price Box */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-bold text-[#5E1324] tabular-nums">
                {formatINR(product.sellingPricePaise)}
              </span>
              {product.mrpPaise > product.sellingPricePaise && (
                <span className="font-mono text-sm text-stone-400 line-through tabular-nums">
                  {formatINR(product.mrpPaise)}
                </span>
              )}
              <span className="text-xs text-stone-500 font-sans">
                (Inclusive of all taxes & 5% GST)
              </span>
            </div>

            {/* Stock Availability */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.availableQty > 5
                    ? 'bg-emerald-600'
                    : product.availableQty > 0
                    ? 'bg-amber-600'
                    : 'bg-rose-600'
                }`}
              />
              <span className="text-xs font-medium text-stone-700">
                {product.availableQty > 5
                  ? `In Stock (${product.availableQty} pieces available for immediate dispatch)`
                  : product.availableQty > 0
                  ? `Hurry! Only ${product.availableQty} pieces left in stock`
                  : 'Currently Out of Stock'}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans border-y border-stone-100 py-3">
              {product.description}
            </p>

            {/* Saree Specifications Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-400 block text-[11px]">Fabric Weave</span>
                <span className="font-semibold text-stone-800">{product.fabric}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Color Palette</span>
                <span className="font-semibold text-stone-800">{product.color}</span>
              </div>
              <div className="mt-1">
                <span className="text-stone-400 block text-[11px]">Saree Length</span>
                <span className="font-semibold text-stone-800">{product.lengthMeters} Meters</span>
              </div>
              <div className="mt-1">
                <span className="text-stone-400 block text-[11px]">Blouse Piece</span>
                <span className="font-semibold text-stone-800">{product.blousePiece}</span>
              </div>
            </div>

            {/* PIN Code Serviceability Check */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#5E1324]" />
                <span>Estimate Delivery Time</span>
              </label>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit PIN code..."
                  className="w-48 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg transition"
                >
                  Check
                </button>
              </form>

              {pincodeStatus && (
                <div className="text-xs pt-1">
                  {pincodeStatus.isServiceable ? (
                    <div className="text-emerald-700 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Delivery to {pincodeStatus.city} in {pincodeStatus.estimatedDeliveryDays} business days.
                        {pincodeStatus.isExpressAvailable && ' (Express Eligible)'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-rose-600">
                      Please enter a valid 6-digit Indian Postal Code.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Select Quantity:</span>
              <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-stone-600 hover:bg-stone-100 transition"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-bold text-stone-900 font-mono tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.availableQty, q + 1))}
                  disabled={quantity >= product.availableQty}
                  className="px-3 py-1 text-stone-600 hover:bg-stone-100 transition disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  onClose();
                }}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
                  isOutOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-[#5E1324] hover:bg-[#781D32] text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-200" />
                <span>Add to Shopping Bag</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                  inWishlist
                    ? 'border-[#5E1324] bg-rose-50 text-[#5E1324]'
                    : 'border-stone-300 hover:bg-stone-50 text-stone-700'
                }`}
                title={inWishlist ? 'In your wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 transition cursor-pointer flex items-center justify-center"
                title="Share Saree Link"
              >
                {copiedLink ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
