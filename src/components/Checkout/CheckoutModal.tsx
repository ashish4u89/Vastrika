/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { commerceStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';
import { Order } from '../../types';
import {
  X,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  QrCode,
  Smartphone,
  Lock,
} from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onOrderSuccess }) => {
  const { cart, clearCart, couponCode, subtotalPaise, discountPaise, shippingPaise, taxPaise, totalPaise } = useCart();

  // Customer Form State
  const [customerName, setCustomerName] = useState('Priya Sharma');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [customerEmail, setCustomerEmail] = useState('priya.sharma@corp.in');
  const [addressLine, setAddressLine] = useState('Flat 402, Shanti Niketan Apts, Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560038');

  // Checkout Stages
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT_GATEWAY' | 'PROCESSING' | 'CONFIRMED' | 'FAILED'>('DETAILS');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Razorpay Checkout Simulation state
  const [simulateInvalidSignature, setSimulateInvalidSignature] = useState(false);
  const [razorpayOrderMeta, setRazorpayOrderMeta] = useState<{
    orderId?: string;
    razorpayOrderId?: string;
    keyId?: string;
    amountPaise?: number;
  } | null>(null);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName || !customerPhone || !pincode) {
      setErrorMessage('Please provide complete customer name, mobile number and PIN code.');
      return;
    }

    // Server-Side Order & Razorpay Creation
    const result = commerceStore.createRazorpayOrder({
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress: {
        line1: addressLine,
        city,
        state,
        pincode,
      },
      couponCode,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to initialize payment.');
      return;
    }

    setRazorpayOrderMeta({
      orderId: result.orderId,
      razorpayOrderId: result.razorpayOrderId,
      keyId: result.keyId,
      amountPaise: result.amountPaise,
    });

    setStep('PAYMENT_GATEWAY');
  };

  const handleAuthorizePayment = (mode: 'SUCCESS' | 'SIMULATE_FAILURE') => {
    if (!razorpayOrderMeta?.orderId || !razorpayOrderMeta?.razorpayOrderId) return;
    const currentOrderId = razorpayOrderMeta.orderId;
    const currentRazorpayOrderId = razorpayOrderMeta.razorpayOrderId;

    setStep('PROCESSING');

    setTimeout(() => {
      const paymentId = `pay_${Date.now().toString(36)}`;
      const signature =
        mode === 'SIMULATE_FAILURE' || simulateInvalidSignature
          ? 'INVALID_TEST_SIGNATURE'
          : `sig_${Date.now().toString(36)}`;

      // Authoritative Server-Side Signature Verification
      const verifyResult = commerceStore.verifyRazorpayPayment({
        orderId: currentOrderId,
        razorpayOrderId: currentRazorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      });

      if (verifyResult.success && verifyResult.order) {
        setConfirmedOrder(verifyResult.order);
        clearCart();
        setStep('CONFIRMED');
        onOrderSuccess(verifyResult.order);
      } else {
        setErrorMessage(verifyResult.error || 'Payment signature verification failed.');
        setStep('FAILED');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto text-left">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#5E1324]" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {step === 'CONFIRMED'
                ? 'Order Confirmed'
                : step === 'PAYMENT_GATEWAY'
                ? 'Razorpay Standard Checkout (Sandbox)'
                : 'Secure Checkout'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Address & Customer Details */}
        {step === 'DETAILS' && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-mono">
              1. Customer & Delivery Address
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Mobile Number (for SMS & Tracking) *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Shipping Address *</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#5E1324]"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal ({cart.length} sarees)</span>
                <span className="font-mono tabular-nums">{formatINR(subtotalPaise)}</span>
              </div>
              {discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span className="font-mono tabular-nums">-{formatINR(discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>GST (5%)</span>
                <span className="font-mono tabular-nums">{formatINR(taxPaise)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="font-mono tabular-nums font-semibold">
                  {shippingPaise === 0 ? 'FREE' : formatINR(shippingPaise)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                <span>Final Payable Amount</span>
                <span className="font-mono text-[#5E1324]">{formatINR(totalPaise)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Pay with Razorpay Standard Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Razorpay Standard Checkout Modal Simulation */}
        {step === 'PAYMENT_GATEWAY' && (
          <div className="p-6 space-y-6">
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-3 text-xs text-sky-900">
              <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Official Razorpay Sandbox Standard Checkout Interface</p>
                <p className="text-sky-800 mt-0.5">
                  Order ID: <code className="font-mono font-bold">{razorpayOrderMeta?.razorpayOrderId}</code> | Public Key: <code className="font-mono font-bold">{razorpayOrderMeta?.keyId}</code>
                </p>
                <p className="text-[11px] text-sky-700 mt-1">
                  Authoritative amount calculated on server: <strong>{formatINR(razorpayOrderMeta?.amountPaise || 0)}</strong>
                </p>
              </div>
            </div>

            {/* Payment Options within Razorpay */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Select Test Tender Method:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleAuthorizePayment('SUCCESS')}
                  className="p-4 rounded-xl border-2 border-stone-200 hover:border-[#5E1324] bg-white hover:bg-stone-50 flex items-center gap-3 transition text-left cursor-pointer group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 group-hover:text-[#5E1324]">
                      Instant UPI / Google Pay
                    </div>
                    <div className="text-[11px] text-stone-500">Authorize simulated UPI payment</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAuthorizePayment('SUCCESS')}
                  className="p-4 rounded-xl border-2 border-stone-200 hover:border-[#5E1324] bg-white hover:bg-stone-50 flex items-center gap-3 transition text-left cursor-pointer group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-indigo-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 group-hover:text-[#5E1324]">
                      Credit / Debit Card
                    </div>
                    <div className="text-[11px] text-stone-500">Visa, Mastercard, RuPay</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Signature Tamper / Test Failure Toggle for QA verification (Test #8) */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateInvalidSignature}
                  onChange={(e) => setSimulateInvalidSignature(e.target.checked)}
                  className="rounded text-[#5E1324]"
                />
                <span className="font-medium">Simulate Invalid Payment Signature (Tests Rejection & Stock Release)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('DETAILS')}
                className="px-4 py-2.5 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition"
              >
                Back to Details
              </button>
              <button
                onClick={() => handleAuthorizePayment('SUCCESS')}
                className="flex-1 py-3 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Authorize {formatINR(razorpayOrderMeta?.amountPaise || 0)} Payment</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Processing Animation */}
        {step === 'PROCESSING' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#5E1324] border-t-transparent rounded-full animate-spin mx-auto" />
            <h4 className="font-serif text-base font-bold text-stone-900">
              Verifying Razorpay HMAC-SHA256 Signature...
            </h4>
            <p className="text-xs text-stone-500">
              Finalizing authoritative inventory deduction and creating verified tax invoice.
            </p>
          </div>
        )}

        {/* STEP 4: Order Confirmed Receipt */}
        {step === 'CONFIRMED' && confirmedOrder && (
          <div className="p-6 space-y-5 text-left">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif text-base font-bold text-emerald-950">
                  Payment Verified & Order Confirmed!
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Your order has been recorded on the authoritative server. We have dispatched your shipment details to <strong>{confirmedOrder.customerPhone}</strong>.
                </p>
              </div>
            </div>

            {/* Official Order Slip */}
            <div className="border border-stone-200 rounded-xl p-4 bg-[#FAF7F2] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-mono">Order Number</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {confirmedOrder.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block text-[10px] uppercase font-mono">Payment ID</span>
                  <span className="font-mono text-stone-700 text-xs">
                    {confirmedOrder.razorpayPaymentId}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-stone-200">
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{item.name}</p>
                      <p className="text-[11px] text-stone-500 font-mono">SKU: {item.sku} · Qty: {item.quantity}</p>
                    </div>
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      {formatINR(item.subtotalPaise)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-stone-200 pt-2 space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatINR(confirmedOrder.subtotalPaise)}</span>
                </div>
                {confirmedOrder.discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-{formatINR(confirmedOrder.discountPaise)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>GST (5%)</span>
                  <span className="font-mono tabular-nums">{formatINR(confirmedOrder.taxPaise)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="font-mono tabular-nums">
                    {confirmedOrder.shippingPaise === 0 ? 'FREE' : formatINR(confirmedOrder.shippingPaise)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                  <span>Total Paid</span>
                  <span className="font-mono text-base text-[#5E1324] tabular-nums">
                    {formatINR(confirmedOrder.totalPaise)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold text-xs sm:text-sm rounded-xl transition"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* STEP 5: Payment Failed State */}
        {step === 'FAILED' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-900">
              Payment Authorization Failed
            </h4>
            <p className="text-xs text-rose-700 max-w-md mx-auto">
              {errorMessage || 'The payment verification could not be validated. Any reserved inventory has been automatically released back to stock.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setStep('DETAILS')}
                className="px-5 py-2.5 bg-[#5E1324] text-white text-xs font-semibold rounded-lg hover:bg-[#781D32] transition"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
