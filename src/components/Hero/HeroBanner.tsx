/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CollectionSlug } from '../../types';
import { HERO_BANNER_IMG } from '../../data/initialCatalog';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  onSelectCollection: (slug: CollectionSlug) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCollection }) => {
  return (
    <section className="relative bg-[#FAF7F2] overflow-hidden border-b border-[#EFE8DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Subtle Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/70 border border-amber-300/60 rounded-full text-[#781D32] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Authentic Handlooms & Silk Mark Certified</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#5E1324] leading-[1.15] tracking-tight">
              Elegance for Every You.
            </h1>

            {/* Body Copy */}
            <p className="text-sm sm:text-base md:text-lg text-stone-700 font-sans max-w-xl leading-relaxed">
              From crisp, breathable linen drapes for 10-hour workdays to resplendent Kanjivaram and
              Banarasi zari silks for Diwali and wedding feasts. Experience pure Indian craftsmanship
              crafted for the woman of today.
            </p>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 pb-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium">All-Day Breathable</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium">Direct Master Weavers</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium">Zero-Compromise Purity</span>
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => onSelectCollection('working-women')}
                className="px-6 py-3.5 bg-[#5E1324] hover:bg-[#781D32] text-white font-medium text-xs sm:text-sm rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Shop Working Women Sarees</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectCollection('festival-sale')}
                className="px-6 py-3.5 bg-white hover:bg-stone-50 text-[#5E1324] border border-[#5E1324] font-medium text-xs sm:text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Explore Festival Collection</span>
              </button>
            </div>

            {/* Social Proof Trust Bar */}
            <div className="pt-4 border-t border-stone-200/80 flex items-center gap-6 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <span className="inline-block w-6 h-6 rounded-full bg-amber-200 border border-white text-[10px] font-bold text-center leading-6 text-[#5E1324]">
                    P
                  </span>
                  <span className="inline-block w-6 h-6 rounded-full bg-rose-200 border border-white text-[10px] font-bold text-center leading-6 text-[#5E1324]">
                    A
                  </span>
                  <span className="inline-block w-6 h-6 rounded-full bg-emerald-200 border border-white text-[10px] font-bold text-center leading-6 text-[#5E1324]">
                    R
                  </span>
                </div>
                <span className="font-semibold text-stone-800">25,000+</span> Sarees Delivered
              </div>
              <span className="text-stone-300">|</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                <span>Silk Mark India Certified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual Asset (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Background Accent Frame */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#5E1324]/10 via-[#C5A059]/10 to-transparent rounded-2xl transform -rotate-1" />

              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-stone-100 aspect-16/10 lg:aspect-4/5">
                <img
                  src={HERO_BANNER_IMG}
                  alt="Vastrika Royal Crimson Kanjivaram Pure Silk Saree"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top hover:scale-102 transition duration-700"
                />

                {/* Subtle Image Floating Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-stone-200 shadow-lg flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                      Featured Festive Weave
                    </div>
                    <div className="text-xs font-bold text-stone-900 font-serif">
                      Rajkanya Pure Silk Kanjivaram
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectCollection('festival-sale')}
                    className="px-3 py-1.5 bg-[#5E1324] text-white text-xs font-semibold rounded-md hover:bg-[#781D32] transition"
                  >
                    View Saree
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
