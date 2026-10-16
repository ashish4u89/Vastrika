/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { commerceStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';
import {
  User,
  Package,
  MapPin,
  X,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  Truck,
} from 'lucide-react';

export const AccountModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { role, userName, userPhone, userEmail, firebaseUser, signInWithGoogle, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'PROFILE' | 'ADDRESSES'>('ORDERS');
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnReasonInput, setReturnReasonInput] = useState('Color tone / drape stiffness variation');

  const orders = commerceStore.getOrders();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh] text-left">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#5E1324]" />
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Customer Account & Orders
              </h3>
              <p className="text-[11px] text-stone-500">
                Welcome, {userName} · Current Role: <strong className="text-[#5E1324]">{role}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-50 px-6 py-2 border-b border-stone-200 flex items-center gap-2">
          {[
            { id: 'ORDERS', label: 'My Orders', icon: <Package className="w-4 h-4" /> },
            { id: 'PROFILE', label: 'Profile Details', icon: <User className="w-4 h-4" /> },
            { id: 'ADDRESSES', label: 'Saved Addresses', icon: <MapPin className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === tab.id
                  ? 'bg-white text-[#5E1324] shadow-xs border border-stone-300'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'ORDERS' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  <Package className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                  <p>You have not placed any saree orders yet.</p>
                </div>
              ) : (
                orders.map((o, idx) => (
                  <div key={`${o.id}-${idx}`} className="p-4 border border-stone-200 rounded-xl space-y-3 bg-[#FDFBF7]">
                    <div className="flex items-center justify-between border-b border-stone-200/60 pb-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            {o.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              o.fulfillmentStatus === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.fulfillmentStatus === 'DISPATCHED'
                                ? 'bg-blue-100 text-blue-800'
                                : o.fulfillmentStatus === 'PACKED'
                                ? 'bg-indigo-100 text-indigo-800'
                                : o.fulfillmentStatus === 'RETURN_REQUESTED'
                                ? 'bg-amber-100 text-amber-800'
                                : o.fulfillmentStatus === 'RETURNED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {o.fulfillmentStatus || 'UNFULFILLED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Placed on {new Date(o.createdAt).toLocaleDateString('en-IN')} via {o.source}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {o.paymentStatus} ({o.paymentMethod})
                        </span>
                        <p className="font-mono font-bold text-[#5E1324] mt-0.5 text-xs">
                          {formatINR(o.totalPaise)}
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-stone-100 text-xs">
                      {o.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-10 object-cover rounded bg-stone-100"
                            />
                            <div>
                              <p className="font-medium text-stone-800">{item.name}</p>
                              <p className="text-[11px] text-stone-400 font-mono">
                                Qty: {item.quantity} · {item.fabric}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono tabular-nums text-stone-800">
                            {formatINR(item.subtotalPaise)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking details if dispatched */}
                    {o.dispatchDetails && (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            Courier: <strong>{o.dispatchDetails.courier}</strong> · AWB: <code className="font-mono font-bold">{o.dispatchDetails.trackingNumber}</code>
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-blue-800">
                          Est. Arrival: {new Date(o.dispatchDetails.estimatedDeliveryDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}

                    {/* Return Action / Status */}
                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                      <div>
                        {o.fulfillmentStatus === 'DELIVERED' && (
                          <button
                            onClick={() => {
                              setReturnOrderId(o.id);
                              setReturnReasonInput('Color tone / drape stiffness variation');
                            }}
                            className="text-[#5E1324] hover:text-[#781D32] font-semibold underline cursor-pointer"
                          >
                            Request 7-Day Return / Exchange
                          </button>
                        )}
                        {o.fulfillmentStatus === 'RETURN_REQUESTED' && (
                          <span className="text-amber-800 font-medium">
                            Return requested ({o.returnDetails?.reason}) · QC inspection in progress
                          </span>
                        )}
                        {o.fulfillmentStatus === 'RETURNED' && (
                          <span className="text-emerald-700 font-medium">
                            ✓ Return QC Accepted · 100% Refund ({formatINR(o.totalPaise)}) Processed
                          </span>
                        )}
                        {(!o.fulfillmentStatus || o.fulfillmentStatus === 'UNFULFILLED' || o.fulfillmentStatus === 'PICKED' || o.fulfillmentStatus === 'PACKED') && (
                          <span className="flex items-center gap-1 text-stone-600 font-medium">
                            <Truck className="w-3.5 h-3.5 text-stone-400" />
                            <span>Order in warehouse fulfillment</span>
                          </span>
                        )}
                      </div>
                      <span>Verified GST Invoice</span>
                    </div>

                    {/* Return Request Inline Modal */}
                    {returnOrderId === o.id && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-amber-950 font-serif">Request Saree Return</h5>
                          <button onClick={() => setReturnOrderId(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-amber-900">
                          Please provide the reason for return. Saree must be folded in original packaging with tags intact.
                        </p>
                        <input
                          type="text"
                          value={returnReasonInput}
                          onChange={(e) => setReturnReasonInput(e.target.value)}
                          placeholder="e.g. Color under natural light, fabric drape preference..."
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded text-xs"
                        />
                        <button
                          onClick={() => {
                            commerceStore.requestOrderReturn(o.id, returnReasonInput);
                            setReturnOrderId(null);
                          }}
                          className="px-3 py-1 bg-[#5E1324] hover:bg-[#781D32] text-white rounded font-bold text-xs cursor-pointer"
                        >
                          Submit Return Request
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'PROFILE' && (
            <div className="space-y-4 text-xs">
              {/* Firebase Authentication Widget */}
              {firebaseUser ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-950">Firebase Authenticated</p>
                      <p className="text-[11px] text-emerald-800 font-mono">{firebaseUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-semibold text-xs transition"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <p className="font-semibold text-stone-800">Sign in for Cloud Synced Orders</p>
                  <button
                    onClick={signInWithGoogle}
                    className="w-full py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-lg font-bold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google (Firebase Auth)</span>
                  </button>
                </div>
              )}

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#5E1324] text-white flex items-center justify-center font-serif text-lg font-bold">
                    {userName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{userName}</h4>
                    <p className="text-stone-500 font-mono text-[11px]">Vastrika Connoisseur Tier</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-mono">Phone Number</span>
                    <span className="font-medium text-stone-800">{userPhone}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-mono">Account Email</span>
                    <span className="font-medium text-stone-800">{userEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ADDRESSES' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 border border-[#5E1324]/40 bg-[#FAF7F2] rounded-xl flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">Corporate Office (Primary)</span>
                    <span className="text-[10px] bg-[#5E1324] text-white px-1.5 py-0.2 rounded">
                      Default
                    </span>
                  </div>
                  <p className="text-stone-600 mt-1">
                    Flat 402, Shanti Niketan Apartments, 100 Feet Road, Indiranagar
                  </p>
                  <p className="text-stone-500 mt-0.5">Bengaluru, Karnataka — 560038</p>
                  <p className="text-stone-500 mt-0.5">Phone: +91 98765 43210</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
