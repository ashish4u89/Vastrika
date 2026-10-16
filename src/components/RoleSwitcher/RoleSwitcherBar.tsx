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
} from 'lucide-react';

export const RoleSwitcherBar: React.FC<{
  onOpenPOS: () => void;
  onOpenAdmin: (initialTab?: string) => void;
  onOpenTests: () => void;
}> = ({ onOpenPOS, onOpenAdmin, onOpenTests }) => {
  const { role, setRole, userName, canAccessPOS, canViewReports, canManageProcurement, canManageDispatch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
            onClick={onOpenTests}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 text-[#C5A059] border border-amber-700/50 rounded font-medium transition cursor-pointer"
            title="Run Authoritative Automated Compliance & Supply Chain Tests"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Automated Tests</span>
          </button>
        </div>
      </div>
    </div>
  );
};
