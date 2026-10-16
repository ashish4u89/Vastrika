/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { commerceStore } from '../../services/store';
import {
  ShieldCheck,
  User,
  Store,
  Warehouse,
  ShoppingBag,
  ChevronDown,
  Truck,
  Package,
  Layers,
  Bell,
  RotateCcw,
  Database,
  Trash2,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';

export const RoleSwitcherBar: React.FC<{
  onOpenPOS: () => void;
  onOpenAdmin: (initialTab?: string) => void;
  onOpenTests: () => void;
}> = ({ onOpenPOS, onOpenAdmin, onOpenTests }) => {
  const { role, setRole, userName, canAccessPOS, canViewReports, canManageProcurement, canManageDispatch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const roles: { id: UserRole; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'OWNER_ADMIN',
      title: 'Owner / Administrator',
      subtitle: 'Full P&L, COGS, Stock, POS, Campaigns & Escalations',
      icon: <ShieldCheck className="w-4 h-4 text-[#C5A059]" />,
    },
    {
      id: 'STORE_MANAGER',
      title: 'Store Manager',
      subtitle: 'POS, Orders, Staff Oversight & Reports',
      icon: <Store className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'PURCHASE_MANAGER',
      title: 'Procurement Head',
      subtitle: 'Master Weavers, POs, 3-Way Match & Goods QC',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'ORDER_MANAGER',
      title: 'Fulfillment & Dispatch Lead',
      subtitle: 'Picking, Packing, Courier AWBs, Return QC',
      icon: <Truck className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'WAREHOUSE_PACKING',
      title: 'Warehouse Specialist',
      subtitle: 'Luxury box packaging, security seals, parcel dispatch',
      icon: <Package className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'BILLING_OPERATOR',
      title: 'Billing Operator / POS',
      subtitle: 'In-store Barcode Billing & Receipts (Costs hidden)',
      icon: <Store className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'INVENTORY_OPERATOR',
      title: 'Inventory Operator',
      subtitle: 'Bundle intake, stock adjustments, damages',
      icon: <Warehouse className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'CUSTOMER',
      title: 'Customer (Online Shopper)',
      subtitle: 'Browse sarees, bag, checkout, orders',
      icon: <User className="w-4 h-4 text-rose-400" />,
    },
  ];

  const currentRoleConfig = roles.find((r) => r.id === role) || roles[0];

  const [unreadCount, setUnreadCount] = useState(commerceStore.getUnreadNotificationsCount());

  React.useEffect(() => {
    const unsub = commerceStore.subscribe(() => {
      setUnreadCount(commerceStore.getUnreadNotificationsCount());
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-[#2A2523] text-stone-200 text-xs border-b border-stone-700 py-1.5 px-4 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Role Badge */}
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-medium uppercase tracking-wider text-[10px]">
            Active Role:
          </span>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-[#C5A059] rounded border border-stone-600 font-medium transition cursor-pointer"
            >
              {currentRoleConfig.icon}
              <span>{currentRoleConfig.title}</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1 text-stone-400" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute left-0 mt-1 w-80 bg-[#1F1B1A] border border-stone-700 rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 border-b border-stone-800 text-[11px] text-stone-400">
                  Switch Role for Immediate Evaluation:
                </div>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-stone-800 transition ${
                      role === r.id ? 'bg-stone-800/80 text-white font-medium' : 'text-stone-300'
                    }`}
                  >
                    <div className="mt-0.5">{r.icon}</div>
                    <div>
                      <div className="text-xs font-semibold">{r.title}</div>
                      <div className="text-[10px] text-stone-400">{r.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="hidden sm:inline text-stone-400 text-[11px]">
            — Signed in as: <strong className="text-stone-200">{userName}</strong>
          </span>
        </div>

        {/* Right: Quick Launch Shortcuts */}
        <div className="flex items-center gap-2">
          {canAccessPOS && (
            <button
              onClick={onOpenPOS}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#5E1324] hover:bg-[#781D32] text-amber-100 rounded font-medium transition cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Store POS Billing</span>
            </button>
          )}

          {(canViewReports || canManageProcurement || canManageDispatch) && (
            <button
              onClick={() => onOpenAdmin()}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-600 font-medium transition cursor-pointer"
            >
              <Warehouse className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Executive & Supply Chain</span>
            </button>
          )}

          <button
            onClick={() => onOpenAdmin('ALERTS')}
            className="relative flex items-center gap-1.5 px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-600 font-medium transition cursor-pointer"
            title="Owner Alerts & Escalation Hub"
          >
            <Bell className="w-3.5 h-3.5 text-[#C5A059]" />
            {unreadCount > 0 && (
              <span className="bg-rose-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsDbModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600 rounded font-medium transition cursor-pointer text-xs"
            title="Database State & Manual Testing Reset"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Reset DB</span>
          </button>

          <button
            onClick={onOpenTests}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 text-[#C5A059] border border-amber-700/50 rounded font-medium transition cursor-pointer"
            title="Run Authoritative Automated Compliance & Supply Chain Tests"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Automated Tests</span>
          </button>
        </div>
      </div>

      {/* Database State & Reset Modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs text-left">
          <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-stone-100 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <h3 className="font-serif text-base font-bold text-white tracking-wide">
                    Database State & Testing Environment
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Control data state for live manual walkthroughs & QA verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDbModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Database Summary Metrics */}
            <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Orders</span>
                <span className="font-mono text-lg font-bold text-white">
                  {commerceStore.getOrders().length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">POs</span>
                <span className="font-mono text-lg font-bold text-white">
                  {commerceStore.getPurchaseOrders().length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Approvals</span>
                <span className="font-mono text-lg font-bold text-amber-400">
                  {commerceStore.getPendingApprovalsCount()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Alerts</span>
                <span className="font-mono text-lg font-bold text-white">
                  {commerceStore.getNotifications().length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Movements</span>
                <span className="font-mono text-lg font-bold text-white">
                  {commerceStore.getInventoryMovements().length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Catalog Sarees</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {commerceStore.getProducts().length}
                </span>
              </div>
            </div>

            {toastMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Reset Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  commerceStore.resetToBlank('clean_slate');
                  setToastMessage('Database successfully reset to pristine Blank Slate (0 orders, 0 POs, 0 approvals)!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="w-full text-left p-3.5 bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-[#C5A059] rounded-xl transition flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-2 bg-amber-950/50 text-[#C5A059] rounded-lg group-hover:bg-[#5E1324] group-hover:text-white transition mt-0.5">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-200">
                    Reset to Blank Slate (Recommended for Manual Testing)
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Wipes all orders, purchase orders, approvals, alerts, and stock audit trails to 0. Restores clean authentic catalog with fresh inventory ready for manual shopping, POS checkout, and role testing.
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  commerceStore.resetToBlank('total_blank');
                  setToastMessage('Total Blank database activated (0 products, 0 orders, 0 suppliers)!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="w-full text-left p-3.5 bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-rose-500 rounded-xl transition flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-2 bg-rose-950/50 text-rose-400 rounded-lg group-hover:bg-rose-900 group-hover:text-white transition mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-300 group-hover:text-white">
                    Total Blank Slate (0 Products, 0 Suppliers, 0 Orders)
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Completely flushes all tables including product catalog and suppliers. Use this if you want to test creating catalog items and master weavers entirely from scratch.
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  commerceStore.loadDemoData();
                  setToastMessage('Demo sample dataset loaded (sample POs, approvals, and alerts restored)!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="w-full text-left p-3.5 bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-blue-500 rounded-xl transition flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-2 bg-blue-950/50 text-blue-400 rounded-lg group-hover:bg-blue-900 group-hover:text-white transition mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-300 group-hover:text-white">
                    Load Demo Sample Dataset
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Populates pre-configured sample POs with Weaver Guilds, pending Owner Return QC approvals, and Low-Stock notifications for quick feature demonstration.
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsDbModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
