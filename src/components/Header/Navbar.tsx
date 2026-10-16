/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SAREE_COLLECTIONS } from '../../data/initialCatalog';
import { CollectionSlug, Product } from '../../types';
import { commerceStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  PhoneCall,
} from 'lucide-react';

interface NavbarProps {
  activeCollection: CollectionSlug;
  onSelectCollection: (slug: CollectionSlug) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenAccount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCollection,
  onSelectCollection,
  onOpenProductDetail,
  onOpenAccount,
}) => {
  const { cartCount, setIsCartOpen, wishlist } = useCart();
  const { userName } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search over products
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const all = commerceStore.getProducts();
    const filtered = all.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.fabric.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.color.toLowerCase().includes(query)
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const promoMessages = [
    '✨ Free Express Shipping across India on orders above ₹1,999',
    '🎁 Festive Celebration Offer: Flat 10% OFF with code FESTIVE10',
    '🪡 100% Authentic Handlooms with Silk Mark Guarantee',
    '💼 Special Corporate & Teachers Collection with Breathable Linen & Matka Silks',
  ];
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promoMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [promoMessages.length]);

  return (
    <header className="w-full bg-[#FDFBF7] shadow-xs sticky top-[33px] z-40 transition-all border-b border-[#EFE8DC]">
      {/* SECTION A: Thin Maroon Promotional Bar */}
      <div className="bg-[#5E1324] text-amber-100 text-xs py-2 px-4 text-center font-medium transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden md:inline text-[11px] text-amber-200/80">
            Helpline: +91 800-VASTRIKA (Mon–Sat 9AM–8PM)
          </span>
          <div className="mx-auto flex items-center justify-center gap-2 text-center text-xs tracking-wide">
            <span>{promoMessages[promoIndex]}</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px] text-amber-200/80">
            <span>🇮🇳 INR (₹)</span>
            <span>·</span>
            <span>All India Delivery</span>
          </div>
        </div>
      </div>

      {/* SECTION B: Header with Logo, Tagline, Search, Account, Wishlist, Cart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-stone-700 hover:text-[#5E1324] cursor-pointer"
          aria-label="Toggle mobile navigation"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Lockup */}
        <div
          onClick={() => onSelectCollection('all')}
          className="cursor-pointer flex flex-col items-start select-none"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#5E1324]">
              VASTRIKA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] inline-block mb-1" />
          </div>
          <span className="text-[10px] tracking-[0.25em] uppercase text-stone-500 font-sans font-medium -mt-1">
            Elegance for Every You
          </span>
        </div>

        {/* Search Bar with Autocomplete Dropdown */}
        <div ref={searchRef} className="relative flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search by saree fabric, color, SKU (e.g. Linen, Kanjivaram, Banarasi)..."
              className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-stone-300 rounded-full focus:outline-none focus:border-[#5E1324] focus:ring-1 focus:ring-[#5E1324] transition text-stone-800 placeholder-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 overflow-hidden">
              <div className="px-3 py-1 text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-100">
                Matching Sarees ({searchResults.length})
              </div>
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onOpenProductDetail(product);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2.5 hover:bg-[#FAF7F2] cursor-pointer flex items-center gap-3 transition"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-12 object-cover rounded bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">{product.name}</p>
                    <p className="text-[11px] text-stone-500">{product.fabric} · {product.color}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#5E1324] font-mono tabular-nums">
                      {formatINR(product.sellingPricePaise)}
                    </p>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      In Stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions: Account, Wishlist, Cart Drawer Trigger */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Account */}
          <button
            onClick={onOpenAccount}
            className="flex items-center gap-2 text-stone-700 hover:text-[#5E1324] transition cursor-pointer"
            title="My Account & Orders"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
              <User className="w-4 h-4 text-stone-600" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-[10px] text-stone-400 uppercase leading-none">Account</div>
              <div className="text-xs font-semibold text-stone-800 leading-tight truncate max-w-[110px]">
                {userName.split(' ')[0]}
              </div>
            </div>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => onSelectCollection('all')}
            className="relative p-2 text-stone-700 hover:text-[#5E1324] transition cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C5A059] text-stone-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3 py-1.5 bg-[#5E1324] hover:bg-[#781D32] text-white rounded-full transition shadow-xs cursor-pointer"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 text-amber-200" />
            <span className="text-xs font-semibold hidden sm:inline">Bag</span>
            <span className="bg-[#C5A059] text-stone-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* SECTION C: Categorized Navigation Bar (Desktop & Tablet) */}
      <nav className="border-t border-stone-200 bg-white overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 sm:space-x-2 py-1.5 min-w-max">
          {SAREE_COLLECTIONS.slice(0, 9).map((cat) => {
            const isActive = activeCollection === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => {
                  onSelectCollection(cat.slug);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#FAF7F2] text-[#5E1324] font-semibold border-b-2 border-[#5E1324]'
                    : 'text-stone-700 hover:text-[#5E1324] hover:bg-stone-50'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          <div className="h-4 w-px bg-stone-300 mx-1" />

          {/* Quick Collection Dropdown Trigger */}
          <button
            onClick={() => onSelectCollection('festival-sale')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md whitespace-nowrap transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Festival Sale 30% OFF</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 py-3 px-4 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sarees, fabrics, colors..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 text-xs border border-stone-300 rounded-lg text-stone-800"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
            Shop Collections
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SAREE_COLLECTIONS.map((c) => (
              <button
                key={c.slug}
                onClick={() => {
                  onSelectCollection(c.slug);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-2.5 py-2 text-xs rounded-md transition flex items-center justify-between ${
                  activeCollection === c.slug
                    ? 'bg-[#5E1324] text-white font-semibold'
                    : 'bg-[#FAF7F2] text-stone-800 hover:bg-stone-100'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <a href="tel:+918008278745" className="flex items-center gap-1.5 text-[#5E1324] font-medium">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Stylist</span>
            </a>
            <span className="text-[11px] text-stone-500">Free 7-Day Returns</span>
          </div>
        </div>
      )}
    </header>
  );
};
