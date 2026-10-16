/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CollectionSlug } from '../../types';
import {
  BANNER_WORKING_WOMEN,
  BANNER_FESTIVAL_SAREE,
  BANNER_NEW_ARRIVALS,
} from '../../data/initialCatalog';
import { ArrowRight } from 'lucide-react';

interface ThreePromotionalBannersProps {
  onSelectCollection: (slug: CollectionSlug) => void;
}

export const ThreePromotionalBanners: React.FC<ThreePromotionalBannersProps> = ({
  onSelectCollection,
}) => {
  const banners = [
    {
      id: 'working-women',
      slug: 'working-women' as CollectionSlug,
      title: 'Working Women Edit',
      subtitle: '100% Breathable Flax Linens & Matka Cotton',
      description: 'Zero-fuss drapes tailored for long presentations and busy workdays.',
      cta: 'Explore Office Wear',
      image: BANNER_WORKING_WOMEN,
      tag: 'Workplace Essential',
    },
    {
      id: 'festival',
      slug: 'festival-sale' as CollectionSlug,
      title: 'Grand Festival Collection',
      subtitle: 'Pure Kadwa Banarasi & Kanjivaram Zari',
      description: 'Luminous heritage silks to celebrate Diwali, Navratri & Karwa Chauth.',
      cta: 'Explore Festive Weaves',
      image: BANNER_FESTIVAL_SAREE,
      tag: 'Festive Spotlight',
    },
    {
      id: 'new-arrivals',
      slug: 'new-arrivals' as CollectionSlug,
      title: 'New Season Arrivals',
      subtitle: 'Sheer Organza Tissue & Champagne Tones',
      description: 'Delicate metallic embroideries and modern pastel palettes.',
      cta: 'Discover New Looms',
      image: BANNER_NEW_ARRIVALS,
      tag: 'Fresh Off Loom',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {banners.map((b) => (
          <div
            key={b.id}
            onClick={() => onSelectCollection(b.slug)}
            className="group relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-white cursor-pointer hover:shadow-2xl transition duration-500 flex flex-col"
          >
            {/* Visual Image Area */}
            <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
              <img
                src={b.image}
                alt={b.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-106 transition duration-700"
              />
              <div className="absolute top-3 left-3 bg-[#5E1324] text-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow">
                {b.tag}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#5E1324] transition">
                  {b.title}
                </h3>
                <p className="text-xs font-semibold text-[#C5A059] mt-0.5">{b.subtitle}</p>
                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#5E1324] group-hover:underline flex items-center gap-1.5">
                  <span>{b.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition duration-200" />
                </span>
                <span className="text-[11px] text-stone-400 font-sans">Handcrafted</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
