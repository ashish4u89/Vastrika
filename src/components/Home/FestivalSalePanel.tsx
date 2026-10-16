/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CollectionSlug } from '../../types';
import { Sparkles, Clock, Copy, Check, ArrowRight } from 'lucide-react';
import { BANNER_FESTIVAL_SAREE } from '../../data/initialCatalog';

interface FestivalSalePanelProps {
  onSelectCollection: (slug: CollectionSlug) => void;
}

export const FestivalSalePanel: React.FC<FestivalSalePanelProps> = ({ onSelectCollection }) => {
  const [copied, setCopied] = useState(false);

  // Countdown timer for festival sale urgency
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 50,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FESTIVE10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#4A0E1B] via-[#5E1324] to-[#781D32] text-white shadow-xl border border-amber-900/40">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative grid grid-cols-1 md:grid-cols-12 items-center p-6 sm:p-8 lg:p-10 gap-6">
          {/* Left Text & Timer (7 cols) */}
          <div className="md:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-[#EFE8DC] border border-amber-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Diwali & Navratri Grand Festivity</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              The Grand Festive Saree Celebration
            </h2>

            <p className="text-xs sm:text-sm text-stone-200/90 max-w-lg leading-relaxed">
              Step into auspicious festivals draped in authentic handwoven Banarasi, Kanjivaram, and
              Chanderi zari silks. Enjoy an exclusive <strong className="text-amber-300">extra 10% OFF</strong> on all festive orders.
            </p>

            {/* Promo Code & Urgency Strip */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-amber-500/40">
                <span className="text-xs text-amber-200">Use Code:</span>
                <span className="font-mono text-sm font-bold text-amber-300 tracking-wider">
                  FESTIVE10
                </span>
                <button
                  onClick={handleCopyCode}
                  className="ml-1 text-xs text-stone-300 hover:text-white p-1 transition cursor-pointer"
                  title="Copy Coupon Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Countdown clock */}
              <div className="flex items-center gap-2 text-xs text-amber-100 font-mono">
                <Clock className="w-4 h-4 text-amber-300" />
                <span className="text-stone-300 font-sans text-xs">Ends in:</span>
                <span className="bg-white/10 px-2 py-1 rounded font-bold">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-white/10 px-2 py-1 rounded font-bold">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-white/10 px-2 py-1 rounded font-bold">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectCollection('festival-sale')}
                className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#B38E44] text-stone-950 font-bold text-xs sm:text-sm rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Shop Festival Weaves Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Media Thumbnail (5 cols) */}
          <div className="md:col-span-5 relative hidden md:block">
            <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-amber-300/30 max-h-56">
              <img
                src={BANNER_FESTIVAL_SAREE}
                alt="Banarasi Festive Saree Celebration"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
