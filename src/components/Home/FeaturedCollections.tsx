/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CollectionSlug, Product } from '../../types';
import { commerceStore } from '../../services/store';
import { SAREE_COLLECTIONS } from '../../data/initialCatalog';
import { ProductCard } from '../Storefront/ProductCard';
import { SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';

interface FeaturedCollectionsProps {
  activeCollection: CollectionSlug;
  onSelectCollection: (slug: CollectionSlug) => void;
  onOpenProductDetail: (product: Product) => void;
}

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({
  activeCollection,
  onSelectCollection,
  onOpenProductDetail,
}) => {
  const [selectedFabric, setSelectedFabric] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC'>('FEATURED');

  const allProducts = commerceStore.getProducts();

  // Unique fabrics for filter
  const fabrics = useMemo(() => {
    const list = Array.from(new Set(allProducts.map((p) => p.category)));
    return ['ALL', ...list];
  }, [allProducts]);

  // Filtered and sorted products
  const displayedProducts = useMemo(() => {
    let result = commerceStore.getProductsByCollection(activeCollection);

    if (selectedFabric !== 'ALL') {
      result = result.filter((p) => p.category === selectedFabric);
    }

    if (sortBy === 'PRICE_ASC') {
      result = [...result].sort((a, b) => a.sellingPricePaise - b.sellingPricePaise);
    } else if (sortBy === 'PRICE_DESC') {
      result = [...result].sort((a, b) => b.sellingPricePaise - a.sellingPricePaise);
    }

    return result;
  }, [activeCollection, selectedFabric, sortBy, allProducts]);

  const activeMeta = SAREE_COLLECTIONS.find((c) => c.slug === activeCollection) || SAREE_COLLECTIONS[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="collections-grid">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5E1324] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Curated Heritage Collections</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {activeMeta.name}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-sans mt-0.5 max-w-xl">
            {activeMeta.description}
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fabric Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[11px] text-stone-500 font-medium">Fabric:</span>
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-900 focus:outline-none cursor-pointer"
            >
              {fabrics.map((f) => (
                <option key={f} value={f}>
                  {f === 'ALL' ? 'All Weaves' : f}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[11px] text-stone-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-stone-900 focus:outline-none cursor-pointer"
            >
              <option value="FEATURED">Featured</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>

          <span className="text-xs text-stone-500 font-sans pl-1">
            Showing <strong className="text-stone-900">{displayedProducts.length}</strong> sarees
          </span>
        </div>
      </div>

      {/* Collection Quick Tabs Strip */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-4 border-b border-stone-100">
        {SAREE_COLLECTIONS.map((c) => (
          <button
            key={c.slug}
            onClick={() => onSelectCollection(c.slug)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition cursor-pointer ${
              activeCollection === c.slug
                ? 'bg-[#5E1324] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductDetail}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 my-6">
          <p className="text-sm font-semibold text-stone-700">
            No sarees found matching the selected weave.
          </p>
          <button
            onClick={() => {
              setSelectedFabric('ALL');
              onSelectCollection('all');
            }}
            className="mt-3 px-4 py-2 bg-[#5E1324] text-white text-xs font-medium rounded-lg hover:bg-[#781D32] transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
