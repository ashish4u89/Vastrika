/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatters';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const inWishlist = isInWishlist(product.id);
  const isLowStock = product.availableQty > 0 && product.availableQty <= product.lowStockThreshold;
  const isOutOfStock = product.availableQty <= 0;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-stone-200/90 hover:border-stone-400 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Visual Image Container */}
      <div className="relative aspect-3/4 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onOpenDetail(product)}>
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.discountPercent > 0 && (
            <span className="bg-[#5E1324] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
              {product.discountPercent}% OFF
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-600 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
              Only {product.availableQty} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-stone-800 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition shadow-md cursor-pointer ${
            inWishlist
              ? 'bg-[#5E1324] text-white'
              : 'bg-white/90 text-stone-700 hover:text-[#5E1324] hover:bg-white'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Floating Action Bar on Hover */}
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="flex-1 py-2 bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold rounded-lg shadow-md flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-xs transition"
          >
            <Eye className="w-3.5 h-3.5 text-stone-700" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5 text-left">
        <div>
          {/* Category & Fabric Unboxed Tag */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium tracking-wide">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.fabric.split(' ')[0]}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onOpenDetail(product)}
            className="font-serif text-sm font-semibold text-stone-900 group-hover:text-[#5E1324] transition line-clamp-1 mt-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Color & Blouse metadata */}
          <p className="text-[11px] text-stone-500 truncate mt-0.5 font-sans">
            {product.color} · {product.blousePiece}
          </p>
        </div>

        {/* Pricing & Add to Bag */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-sm font-bold text-[#5E1324] tabular-nums">
                {formatINR(product.sellingPricePaise)}
              </span>
              {product.mrpPaise > product.sellingPricePaise && (
                <span className="font-mono text-[11px] text-stone-400 line-through tabular-nums">
                  {formatINR(product.mrpPaise)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-400 font-sans">Incl. 5% GST</span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#FAF7F2] text-[#5E1324] hover:bg-[#5E1324] hover:text-white border border-[#5E1324]/30'
            }`}
            title="Add to shopping bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
