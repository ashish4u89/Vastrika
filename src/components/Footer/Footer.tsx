/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CollectionSlug } from '../../types';
import { SAREE_COLLECTIONS } from '../../data/initialCatalog';
import {
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface FooterProps {
  onSelectCollection: (slug: CollectionSlug) => void;
  onOpenPolicy: (title: string, content: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCollection, onOpenPolicy }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#1F1B1A] text-stone-300 border-t border-stone-800 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Assistance Strip */}
        <div className="pb-12 border-b border-stone-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-2">
            <h3 className="font-serif text-2xl font-bold text-amber-100">
              Join the Vastrika Saree Connoisseur Circle
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 font-sans leading-relaxed">
              Receive private invitations to seasonal loom launches, master weaver masterclasses,
              and secret festival previews. No spam, only handloom heritage.
            </p>
          </div>

          <div className="lg:col-span-5">
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! You are now subscribed to our private heirloom launches.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="flex-1 px-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5E1324] hover:bg-[#781D32] text-amber-100 font-medium text-xs rounded-lg transition shadow-md cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand Info & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                VASTRIKA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] inline-block mb-1" />
            </div>
            <p className="text-xs text-[#C5A059] font-medium tracking-widest uppercase">
              Elegance for Every You.
            </p>
            <p className="text-xs text-stone-400 leading-relaxed font-sans">
              Dedicated to celebrating the multifaceted Indian woman. We bridge ancient loom
              traditions with contemporary silhouettes for daily corporate confidence and
              heartfelt festivities.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-amber-200/90">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Silk Mark India Registered Guild</span>
            </div>
          </div>

          {/* Col 2: Handcrafted Collections */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
              Curated Collections
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-sans">
              {SAREE_COLLECTIONS.slice(1, 8).map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => onSelectCollection(c.slug)}
                    className="hover:text-amber-200 transition cursor-pointer text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
              Care & Policies
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-sans">
              <li>
                <button
                  onClick={() =>
                    onOpenPolicy(
                      'Shipping & Delivery Policy',
                      'Free express shipping on all orders above ₹1,999. Standard delivery takes 2-4 business days across India. All shipments are insured and packaged in breathable muslin covers.'
                    )
                  }
                  className="hover:text-amber-200 transition cursor-pointer"
                >
                  Shipping & Delivery Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onOpenPolicy(
                      '7-Day Return & Exchange Policy',
                      'We provide a hassle-free 7-day return policy for unstitched sarees with original tags intact. Reverse doorstep pickup is arranged with our certified courier partners.'
                    )
                  }
                  className="hover:text-amber-200 transition cursor-pointer"
                >
                  7-Day Return & Exchange Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onOpenPolicy(
                      'Authenticity & Silk Mark Guarantee',
                      'Every pure silk saree from Vastrika carries an official Silk Mark tag issued by the Silk Mark Organisation of India (SMOI), guaranteeing 100% natural silk purity.'
                    )
                  }
                  className="hover:text-amber-200 transition cursor-pointer"
                >
                  Authenticity & Silk Mark
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onOpenPolicy(
                      'Privacy & Secure Data Policy',
                      'Vastrika respects your privacy. All payment transactions are encrypted and processed through PCI-DSS compliant gateways. We never store credit card or CVV details.'
                    )
                  }
                  className="hover:text-amber-200 transition cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onOpenPolicy(
                      'Terms of Service',
                      'Orders are subject to inventory verification. In the rare event of out-of-stock items, immediate 100% refund is initiated to the original payment source.'
                    )
                  }
                  className="hover:text-amber-200 transition cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Store & Live Stylist Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
              Live Saree Stylist
            </h4>

            {/* WhatsApp Direct Assistance Card */}
            <a
              href="https://wa.me/918008278745?text=Hello%20Vastrika%2C%20I%20would%20like%20assistance%20with%20a%20saree%20selection"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl flex items-center gap-3 transition cursor-pointer text-emerald-200"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Chat on WhatsApp</div>
                <div className="text-[10px] text-emerald-300">Live styling & video drapery</div>
              </div>
            </a>

            <div className="pt-2 space-y-2 text-xs text-stone-400 font-sans">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>+91 800-VASTRIKA (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>care@vastrika.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                <span>Flagship Loom Studio, Indiranagar, Bengaluru, KA 560038</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Payment Badges */}
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} VASTRIKA Sarees Private Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <span>Secure 256-Bit SSL</span>
            <span>·</span>
            <span>Razorpay Verified</span>
            <span>·</span>
            <span>UPI / NetBanking / Cards / COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
