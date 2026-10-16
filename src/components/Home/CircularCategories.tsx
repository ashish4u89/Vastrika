/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CollectionSlug } from '../../types';
import {
  HERO_BANNER_IMG,
  BANNER_WORKING_WOMEN,
  BANNER_FESTIVAL_SAREE,
  BANNER_NEW_ARRIVALS,
} from '../../data/initialCatalog';

interface CircularCategoriesProps {
  activeCollection: CollectionSlug;
  onSelectCollection: (slug: CollectionSlug) => void;
}

export const CircularCategories: React.FC<CircularCategoriesProps> = ({
  activeCollection,
  onSelectCollection,
}) => {
  const categories = [
    {
      id: 'kanjivaram',
      slug: 'diwali' as CollectionSlug,
      title: 'Kanjivaram Silk',
      tag: 'Grand Bridal',
      image: HERO_BANNER_IMG,
    },
    {
      id: 'linen',
      slug: 'working-women' as CollectionSlug,
      title: 'Office Linen',
      tag: '100-Count Flax',
      image: BANNER_WORKING_WOMEN,
    },
    {
      id: 'banarasi',
      slug: 'festival-sale' as CollectionSlug,
      title: 'Kadwa Banarasi',
      tag: 'Zari Brocade',
      image: BANNER_FESTIVAL_SAREE,
    },
    {
      id: 'organza',
      slug: 'wedding-guest' as CollectionSlug,
      title: 'Organza Tissue',
      tag: 'Sheer Luxury',
      image: BANNER_NEW_ARRIVALS,
    },
    {
      id: 'teachers',
      slug: 'teachers-collection' as CollectionSlug,
      title: 'Teachers Handloom',
      tag: 'Zero-Fuss',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'corporate',
      slug: 'bank-corporate' as CollectionSlug,
      title: 'Bank & Corporate',
      tag: 'Tussar & Ghicha',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'daily',
      slug: 'daily-wear' as CollectionSlug,
      title: 'Daily Mulmul',
      tag: 'Featherlight',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#5E1324]">
            Shop by Weave & Heritage
          </h2>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Hand-curated fabric categories crafted across India's master weaving clusters
          </p>
        </div>
      </div>

      {/* Circular Shortcuts Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-6 justify-center">
        {categories.map((cat) => {
          const isSelected = activeCollection === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCollection(cat.slug)}
              className="group flex flex-col items-center text-center focus:outline-none cursor-pointer"
            >
              {/* Outer Circular Ring with hover effect */}
              <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-1 transition duration-300 ${
                  isSelected
                    ? 'ring-3 ring-[#5E1324] shadow-md scale-105'
                    : 'ring-1 ring-stone-300 hover:ring-[#C5A059] group-hover:scale-105'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-stone-100 shadow-inner">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-115 transition duration-500"
                  />
                </div>
              </div>

              {/* Title & Micro Tag */}
              <span
                className={`mt-2 text-xs font-semibold leading-tight transition ${
                  isSelected ? 'text-[#5E1324]' : 'text-stone-800 group-hover:text-[#5E1324]'
                }`}
              >
                {cat.title}
              </span>
              <span className="text-[10px] text-stone-500 font-normal">
                {cat.tag}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
