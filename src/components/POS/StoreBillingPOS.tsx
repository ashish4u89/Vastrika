/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { commerceStore } from '../../services/store';
import { Product, Order, OrderItem } from '../../types';
import { formatINR, calculateGST, generateOrderNumber } from '../../utils/formatters';
import {
  Store,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Banknote,
  Building,
  X,
  Lock,
} from 'lucide-react';

interface POSItem extends OrderItem {
  availableQty: number;
}

export const StoreBillingPOS: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { role, canAccessPOS, canViewCosts, posPasscodeVerified, verifyPOSPasscode } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // POS State
  const [skuSearch, setSkuSearch] = useState('');
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<POSItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER'>('UPI');
  const [tenderCashGiven, setTenderCashGiven] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current && posPasscodeVerified) {
      searchInputRef.current.focus();
    }
  }, [posPasscodeVerified]);

  // SKU and Name search
  useEffect(() => {
    if (!skuSearch.trim()) {
      setMatchedProducts([]);
      return;
    }
    const query = skuSearch.toLowerCase().trim();
    const all = commerceStore.getProducts();
    const matches = all.filter(
      (p) =>
        p.sku.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.fabric.toLowerCase().includes(query)
    );
    setMatchedProducts(matches.slice(0, 6));
  }, [skuSearch]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPOSPasscode(pinInput)) {
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const addItemToPOSCart = (product: Product) => {
    if (product.availableQty <= 0) {
      setErrorMessage(`Cannot add ${product.sku} - Stock is 0`);
      return;
    }

    setErrorMessage(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.availableQty) {
          setErrorMessage(`Max stock of ${product.availableQty} reached for ${product.sku}`);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotalPaise: (i.quantity + 1) * i.unitSellingPricePaise,
              }
            : i
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            image: product.images[0] || '',
            fabric: product.fabric,
            unitSellingPricePaise: product.sellingPricePaise,
            unitCostPricePaise: product.costPricePaise,
            quantity: 1,
            subtotalPaise: product.sellingPricePaise,
            taxPaise: Math.round((product.sellingPricePaise * 5) / 100),
            availableQty: product.availableQty,
          },
        ];
      }
    });
    setSkuSearch('');
  };

  const updatePOSQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    const product = commerceStore.getProductById(productId);
    if (product && newQty > product.availableQty) {
      setErrorMessage(`Stock limit reached (${product.availableQty} available)`);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: newQty,
              subtotalPaise: newQty * i.unitSellingPricePaise,
            }
          : i
      )
    );
  };

  // Authoritative calculations
  const subtotalPaise = cart.reduce((acc, i) => acc + i.subtotalPaise, 0);
  const { totalTaxPaise } = calculateGST(subtotalPaise, 5);
  const totalPayablePaise = subtotalPaise + totalTaxPaise;

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      setErrorMessage('Please add at least one saree to bill.');
      return;
    }

    const saleResult = commerceStore.createPOSSale({
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      customerName,
      customerPhone,
      paymentMethod,
      couponCode,
      operatorRole: role,
    });

    if (saleResult.success && saleResult.order) {
      setLastCompletedOrder(saleResult.order);
      setCart([]);
      setErrorMessage(null);
    } else {
      setErrorMessage(saleResult.error || 'Failed to complete transaction.');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (!canAccessPOS) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-white p-6 rounded-2xl max-w-sm text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold">Access Restricted</h3>
          <p className="text-xs text-stone-600">
            Current role ({role}) does not have Retail POS billing authorization. Please switch to
            Store Manager, Billing Operator, or Owner.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#5E1324] text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Passcode entry for physical terminal safety
  if (!posPasscodeVerified && role !== 'OWNER_ADMIN') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-white p-6 rounded-2xl max-w-xs w-full text-center space-y-4 shadow-2xl border border-stone-200">
          <div className="w-12 h-12 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-[#5E1324]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-stone-900">
            Physical Terminal Security
          </h3>
          <p className="text-xs text-stone-500">
            Enter Cashier Station PIN (Default: <strong>1234</strong> or <strong>2026</strong>)
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-3">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              autoFocus
              className="w-full text-center font-mono text-2xl tracking-widest py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
            />
            {pinError && <p className="text-xs text-rose-600 font-medium">Invalid terminal PIN</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#5E1324] text-white text-xs font-bold rounded-lg hover:bg-[#781D32] transition"
            >
              Unlock Cash Register
            </button>
          </form>
          <button onClick={onClose} className="text-xs text-stone-400 hover:underline">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[96vh]">
        {/* Top Cashier Bar */}
        <div className="px-6 py-3.5 bg-[#2A2523] text-stone-200 flex items-center justify-between border-b border-stone-700">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-[#C5A059]" />
            <div>
              <h2 className="font-serif text-sm font-bold text-white tracking-wide">
                VASTRIKA RETAIL POS — COUNTER 01
              </h2>
              <p className="text-[10px] text-stone-400">
                Logged in as: <strong className="text-amber-200">{role}</strong> · Terminal ID: TRM-BLR-01
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid: Left SKU Scanner & Cart (7 cols) + Right Checkout Tender (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left: Barcode / SKU Entry & Cart items */}
          <div className="lg:col-span-7 p-4 sm:p-6 border-r border-stone-200 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
            <div className="space-y-4">
              {/* SKU & Barcode Search Bar */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={skuSearch}
                      onChange={(e) => setSkuSearch(e.target.value)}
                      placeholder="Scan Barcode or Type SKU / Name (e.g. VAS-KAN-001, Linen)..."
                      className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#5E1324] focus:bg-white"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Instant Match Dropdown */}
                {matchedProducts.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-300 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-stone-100">
                    {matchedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => addItemToPOSCart(p)}
                        className="p-2.5 hover:bg-stone-50 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-10 object-cover rounded bg-stone-100"
                          />
                          <div>
                            <p className="font-semibold text-stone-900 truncate max-w-xs">{p.name}</p>
                            <p className="text-[10px] text-stone-500 font-mono">
                              SKU: {p.sku} · Avail: <strong className="text-emerald-700">{p.availableQty} pcs</strong>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-[#5E1324]">{formatINR(p.sellingPricePaise)}</p>
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                            + Add to Bill
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* POS Cart Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 grid grid-cols-12 text-[11px] font-bold text-stone-600 uppercase font-mono">
                  <span className="col-span-6">Saree Description</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Unit Price</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>

                <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-xs font-sans">
                      No sarees in current bill. Scan a barcode or search above.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.productId} className="px-4 py-3 grid grid-cols-12 items-center text-xs">
                        <div className="col-span-6 pr-2">
                          <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            {item.sku} · {item.fabric.split(' ')[0]}
                            {canViewCosts && (
                              <span className="text-stone-500 ml-1">
                                (Cost: {formatINR(item.unitCostPricePaise)})
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="col-span-2 flex items-center justify-center gap-1">
                          <button
                            onClick={() => updatePOSQty(item.productId, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updatePOSQty(item.productId, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>

                        <div className="col-span-2 text-right font-mono text-stone-700 tabular-nums">
                          {formatINR(item.unitSellingPricePaise)}
                        </div>

                        <div className="col-span-2 text-right font-mono font-bold text-stone-900 tabular-nums">
                          {formatINR(item.subtotalPaise)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Saree Shortcuts Strip */}
            <div className="pt-3 border-t border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5 font-mono">
                Frequent POS Quick-Add:
              </span>
              <div className="flex flex-wrap gap-2">
                {commerceStore.getProducts().slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addItemToPOSCart(p)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-[11px] font-medium border border-stone-300 transition cursor-pointer"
                  >
                    + {p.sku} ({formatINR(p.sellingPricePaise)})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Customer Info, Payment Tender & Receipt Generation (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-[#FAF7F2] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                Customer & Tender
              </div>

              {/* Customer Phone & Name Input */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-stone-600 font-medium mb-1">
                    Customer Mobile
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 font-medium mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Tender Method Selector */}
              <div>
                <label className="block text-[11px] text-stone-600 font-medium mb-1.5">
                  Payment Tender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: <QrCode className="w-4 h-4 text-emerald-600" /> },
                    { id: 'CASH', label: 'Cash Tender', icon: <Banknote className="w-4 h-4 text-amber-600" /> },
                    { id: 'CARD', label: 'POS Card Swiped', icon: <CreditCard className="w-4 h-4 text-indigo-600" /> },
                    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: <Building className="w-4 h-4 text-sky-600" /> },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs font-semibold transition cursor-pointer ${
                        paymentMethod === m.id
                          ? 'border-[#5E1324] bg-white text-[#5E1324] shadow-xs'
                          : 'border-stone-300 bg-stone-50 text-stone-700 hover:bg-white'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bill Totals Box */}
              <div className="bg-white p-4 rounded-xl border border-stone-300 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span className="font-mono tabular-nums">{formatINR(subtotalPaise)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (5% SGST + CGST)</span>
                  <span className="font-mono tabular-nums">{formatINR(totalTaxPaise)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                  <span>Net Bill Payable</span>
                  <span className="font-mono text-base text-[#5E1324] tabular-nums">
                    {formatINR(totalPayablePaise)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Complete Sale & Print */}
            <div className="space-y-2">
              <button
                onClick={handleCompleteSale}
                disabled={cart.length === 0}
                className="w-full py-3 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-200" />
                <span>Complete In-Store Sale ({formatINR(totalPayablePaise)})</span>
              </button>

              {lastCompletedOrder && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
                    <span>Invoice {lastCompletedOrder.orderNumber} Generated!</span>
                    <button
                      onClick={handlePrintReceipt}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Thermal Receipt</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Printable Thermal Receipt Container */}
        {lastCompletedOrder && (
          <div id="printable-pos-receipt" className="hidden print:block p-4 max-w-xs mx-auto font-mono text-[11px] text-black">
            <div className="text-center pb-2 border-b border-black">
              <h2 className="font-bold text-sm">VASTRIKA SAREES</h2>
              <p>Indiranagar Loom Studio, Bengaluru</p>
              <p>GSTIN: 29AAECV1234F1Z9 · Phone: +91 800-VASTRIKA</p>
              <p>TAX INVOICE: {lastCompletedOrder.orderNumber}</p>
              <p>Date: {new Date(lastCompletedOrder.createdAt).toLocaleString('en-IN')}</p>
            </div>

            <div className="py-2 border-b border-black">
              <p>Customer: {lastCompletedOrder.customerName}</p>
              <p>Phone: {lastCompletedOrder.customerPhone}</p>
              <p>Tender: {lastCompletedOrder.paymentMethod}</p>
            </div>

            <div className="py-2 border-b border-black divide-y divide-dotted divide-black">
              {lastCompletedOrder.items.map((i, idx) => (
                <div key={idx} className="py-1">
                  <p className="font-bold">{i.name}</p>
                  <div className="flex justify-between">
                    <span>{i.sku} x {i.quantity}</span>
                    <span>{formatINR(i.subtotalPaise)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatINR(lastCompletedOrder.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>{formatINR(lastCompletedOrder.taxPaise)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                <span>NET TOTAL:</span>
                <span>{formatINR(lastCompletedOrder.totalPaise)}</span>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-black mt-2">
              <p>Thank you for choosing Vastrika!</p>
              <p>Elegance for Every You.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
