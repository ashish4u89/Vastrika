/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Truck, ShieldCheck, RefreshCw, MessageSquare } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const trustPoints = [
    {
      icon: <Truck className="w-6 h-6 text-[#5E1324]" />,
      title: 'Free Express Shipping',
      subtitle: 'On all orders above ₹1,999 across India with real-time tracking.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#5E1324]" />,
      title: '100% Authentic Handloom',
      subtitle: 'Silk Mark India certified direct from registered master weaving looms.',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-[#5E1324]" />,
      title: '7-Day Easy Returns',
      subtitle: 'Hassle-free return & exchange with insured reverse courier pickup.',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-[#5E1324]" />,
      title: 'Expert Saree Stylist',
      subtitle: 'WhatsApp assistance for matching blouse fabric, drapes & video calls.',
    },
  ];

  return (
    <section className="bg-white border-y border-stone-200 py-8 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {trustPoints.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-[#FAF7F2] transition"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#EFE8DC] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed font-sans">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
