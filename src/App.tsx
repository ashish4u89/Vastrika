/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { RoleSwitcherBar } from './components/RoleSwitcher/RoleSwitcherBar';
import { Navbar } from './components/Header/Navbar';
import { HeroBanner } from './components/Hero/HeroBanner';
import { FestivalSalePanel } from './components/Home/FestivalSalePanel';
import { CircularCategories } from './components/Home/CircularCategories';
import { ThreePromotionalBanners } from './components/Home/ThreePromotionalBanners';
import { TrustStrip } from './components/Home/TrustStrip';
import { FeaturedCollections } from './components/Home/FeaturedCollections';
import { Footer } from './components/Footer/Footer';
import { ProductDetailModal } from './components/Storefront/ProductDetailModal';
import { CartDrawer } from './components/Cart/CartDrawer';
import { CheckoutModal } from './components/Checkout/CheckoutModal';
import { StoreBillingPOS } from './components/POS/StoreBillingPOS';
import { InventoryManager } from './components/Admin/InventoryManager';
import { AutomatedTestRunner } from './components/Testing/AutomatedTestRunner';
import { AccountModal } from './components/Account/AccountModal';
import { PolicyModal } from './components/Policy/PolicyModal';
import { PWAInstallBanner } from './components/PWA/PWAInstallBanner';
import { CollectionSlug, Product, Order } from './types';
import { commerceStore } from './services/store';

const MainStorefront: React.FC = () => {
  const { toastMessage, setIsCartOpen } = useCart();

  const [activeCollection, setActiveCollection] = useState<CollectionSlug>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string | undefined>(undefined);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [policyModalData, setPolicyModalData] = useState<{ title: string; content: string } | null>(null);

  // Sync route / collections
  const handleSelectCollection = (slug: CollectionSlug) => {
    setActiveCollection(slug);
    const element = document.getElementById('collections-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderSuccess = (order: Order) => {
    // Order confirmed
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2A2523] selection:bg-[#5E1324] selection:text-white">
      {/* 1. Multi-Role Switcher Toolbar for Reviewers & Operators */}
      <RoleSwitcherBar
        onOpenPOS={() => setIsPOSOpen(true)}
        onOpenAdmin={(tab) => {
          setAdminInitialTab(tab);
          setIsAdminOpen(true);
        }}
        onOpenTests={() => setIsTestsOpen(true)}
      />

      {/* 2. Header & Promotional Strip (Sections A, B, C) */}
      <Navbar
        activeCollection={activeCollection}
        onSelectCollection={handleSelectCollection}
        onOpenProductDetail={(prod) => setSelectedProduct(prod)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* 3. Main Storefront Sections */}
      <main className="flex-1">
        {/* Section D: Hero Banner with "Elegance for Every You" */}
        <HeroBanner onSelectCollection={handleSelectCollection} />

        {/* Section E: Featured Festival Sale Panel with Countdown & Coupon */}
        <FestivalSalePanel onSelectCollection={handleSelectCollection} />

        {/* Section F: Circular Category Shortcuts */}
        <CircularCategories
          activeCollection={activeCollection}
          onSelectCollection={handleSelectCollection}
        />

        {/* Section G: Three Promotional Banners (Working Women, Festival, New Arrivals) */}
        <ThreePromotionalBanners onSelectCollection={handleSelectCollection} />

        {/* Section H: Trust Strip (4 Core Guarantees) */}
        <TrustStrip />

        {/* Section I: Product Collections & Merchandising Grid with Filters */}
        <FeaturedCollections
          activeCollection={activeCollection}
          onSelectCollection={handleSelectCollection}
          onOpenProductDetail={(prod) => setSelectedProduct(prod)}
        />
      </main>

      {/* 4. Complete Footer (Section J) */}
      <Footer
        onSelectCollection={handleSelectCollection}
        onOpenPolicy={(title, content) => setPolicyModalData({ title, content })}
      />

      {/* MODALS & DRAWERS */}

      {/* Product Detail Modal (PDP) */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDirectCheckout={(prod) => {
            setSelectedProduct(null);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onOpenCheckout={() => {
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal (Razorpay Standard Checkout Sandbox & Verification) */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Physical Store POS Billing Module */}
      {isPOSOpen && <StoreBillingPOS onClose={() => setIsPOSOpen(false)} />}

      {/* Executive Suite & Inventory Ledger (Bundle Intake, P&L, Audit Logs) */}
      {isAdminOpen && (
        <InventoryManager
          initialTab={adminInitialTab}
          onClose={() => {
            setIsAdminOpen(false);
            setAdminInitialTab(undefined);
          }}
        />
      )}

      {/* Automated Compliance & Test Suite Runner (15 tests) */}
      {isTestsOpen && <AutomatedTestRunner onClose={() => setIsTestsOpen(false)} />}

      {/* Customer Account & Order History Modal */}
      {isAccountOpen && <AccountModal onClose={() => setIsAccountOpen(false)} />}

      {/* Policy Modal */}
      {policyModalData && (
        <PolicyModal
          title={policyModalData.title}
          content={policyModalData.content}
          onClose={() => setPolicyModalData(null)}
        />
      )}

      {/* PWA Install Banner & Offline Connectivity Indicator */}
      <PWAInstallBanner />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#2A2523] text-amber-100 text-xs px-4 py-2.5 rounded-full shadow-2xl border border-stone-600 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainStorefront />
      </CartProvider>
    </AuthProvider>
  );
}
