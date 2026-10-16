/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { commerceStore } from '../../services/store';
import {
  Product,
  InventoryMovement,
  Supplier,
  PurchaseOrder,
  Order,
  AppNotification,
  OrderFulfillmentStatus,
  ApprovalRequest,
} from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  Warehouse,
  Boxes,
  TrendingUp,
  AlertTriangle,
  History,
  PlusCircle,
  FileText,
  DollarSign,
  X,
  CheckCircle2,
  PackagePlus,
  RefreshCw,
  Truck,
  Package,
  Layers,
  Bell,
  RotateCcw,
  Check,
  ShieldAlert,
  Clock,
  ClipboardCheck,
  Users,
  Search,
  ArrowRight,
  Send,
  Mail,
  MessageSquare,
} from 'lucide-react';

interface InventoryManagerProps {
  initialTab?: string;
  onClose: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ initialTab, onClose }) => {
  const {
    role,
    userName,
    canAdjustInventory,
    canViewCosts,
    canViewReports,
    canManageProcurement,
    canManageDispatch,
    canManageReturns,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'PROCUREMENT' | 'DISPATCH' | 'RETURNS' | 'ALERTS' | 'STOCK_INTAKE' | 'PRODUCTS' | 'MOVEMENTS' | 'APPROVALS'
  >((initialTab as any) || 'OVERVIEW');

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Filter State
  const [orderFilter, setOrderFilter] = useState<'ALL' | OrderFulfillmentStatus>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Bundle Intake Form State
  const [intakeProductId, setIntakeProductId] = useState('');
  const [bundleCount, setBundleCount] = useState<number>(2);
  const [piecesPerBundle, setPiecesPerBundle] = useState<number>(6);
  const [unitCostRupees, setUnitCostRupees] = useState<number>(200);
  const [intakeSuccessMessage, setIntakeSuccessMessage] = useState<string | null>(null);

  // Damage write-off modal state
  const [damageQty, setDamageQty] = useState<number>(1);
  const [damageReason, setDamageReason] = useState('Fabric fraying near zari border');
  const [damageSuccess, setDamageSuccess] = useState<string | null>(null);

  // New PO Modal State
  const [isNewPOModalOpen, setIsNewPOModalOpen] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poProductId, setPoProductId] = useState('');
  const [poBundles, setPoBundles] = useState(3);
  const [poPcsPerBundle, setPoPcsPerBundle] = useState(4);
  const [poCostPerPieceRupees, setPoCostPerPieceRupees] = useState(2000);
  const [poNotes, setPoNotes] = useState('Festive rush stock intake');

  // Goods Receipt QC Modal State
  const [activeQCPO, setActiveQCPO] = useState<PurchaseOrder | null>(null);
  const [qcReceivedPieces, setQcReceivedPieces] = useState<number>(12);
  const [qcAcceptedPieces, setQcAcceptedPieces] = useState<number>(12);
  const [qcRejectedPieces, setQcRejectedPieces] = useState<number>(0);
  const [qcRejectionReason, setQcRejectionReason] = useState('Defective zari weaving or stain');
  const [qcInspector, setQcInspector] = useState(userName || 'Ganesh Pillai (QC Lead)');

  // Courier Dispatch Modal State
  const [activeDispatchOrder, setActiveDispatchOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState<'BlueDart Express' | 'Delhivery Air' | 'India Post SpeedPost' | 'Direct Store Courier'>('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estDeliveryDate, setEstDeliveryDate] = useState('');

  // Return QC Modal State
  const [activeReturnOrder, setActiveReturnOrder] = useState<Order | null>(null);
  const [returnQcAccepted, setReturnQcAccepted] = useState(true);
  const [returnAction, setReturnAction] = useState<'RESTOCK' | 'DAMAGE_WRITE_OFF'>('RESTOCK');
  const [returnQcReason, setReturnQcReason] = useState('Inspection passed: Saree is unworn with tags intact.');

  // Review Approval State
  const [reviewNotes, setReviewNotes] = useState('');
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  const refreshData = () => {
    setProducts(commerceStore.getProducts());
    setMovements(commerceStore.getInventoryMovements());
    setSuppliers(commerceStore.getSuppliers());
    setPurchaseOrders(commerceStore.getPurchaseOrders());
    setOrders(commerceStore.getOrders());
    setNotifications(commerceStore.getNotifications());
    setApprovals(commerceStore.getApprovals());
  };

  useEffect(() => {
    refreshData();
    const unsub = commerceStore.subscribe(refreshData);
    return () => unsub();
  }, []);

  // Update initial tab when prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Handle Bundle Intake: 2 bundles * 6 pcs = 12 pcs added to inventory
  const handleBundleIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeProductId) return;

    const res = commerceStore.receiveBundleInventory({
      productId: intakeProductId,
      bundleCount: Number(bundleCount),
      piecesPerBundle: Number(piecesPerBundle),
      unitCostPaise: Math.round(Number(unitCostRupees) * 100),
      supplierId: 'sup-001',
      performedBy: role,
    });

    if (res.success) {
      setIntakeSuccessMessage(
        `Success! Added ${res.addedPieces} pieces (${bundleCount} bundles × ${piecesPerBundle} pcs) to inventory. New Stock: ${res.newTotalQty} pieces.`
      );
      refreshData();
      setTimeout(() => setIntakeSuccessMessage(null), 5000);
    }
  };

  const handleWriteOffDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const res = commerceStore.writeOffDamage(
      selectedProduct.id,
      Number(damageQty),
      damageReason,
      role
    );

    if (res.success) {
      setDamageSuccess(`Successfully written off ${damageQty} damaged pieces.`);
      refreshData();
      setTimeout(() => {
        setDamageSuccess(null);
        setSelectedProduct(null);
      }, 2000);
    }
  };

  // Handle PO Creation
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId || !poProductId) return;

    const res = commerceStore.createPurchaseOrder({
      supplierId: poSupplierId,
      items: [
        {
          productId: poProductId,
          bundles: Number(poBundles),
          piecesPerBundle: Number(poPcsPerBundle),
          costPerPiecePaise: Math.round(Number(poCostPerPieceRupees) * 100),
        },
      ],
      notes: poNotes,
      createdBy: role,
    });

    if (res.success) {
      setIsNewPOModalOpen(false);
      refreshData();
    }
  };

  // Handle Goods Receipt QC
  const handleProcessGoodsReceiptQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQCPO) return;

    commerceStore.receivePOGoodsWithQC({
      poId: activeQCPO.id,
      receivedPieces: Number(qcReceivedPieces),
      acceptedPieces: Number(qcAcceptedPieces),
      rejectedPieces: Number(qcRejectedPieces),
      rejectionReason: qcRejectionReason,
      inspectorName: qcInspector,
    });

    setActiveQCPO(null);
    refreshData();
  };

  // Handle Dispatch Submit
  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDispatchOrder) return;

    commerceStore.dispatchOrder({
      orderId: activeDispatchOrder.id,
      courier: courierName,
      trackingNumber: trackingNumber || `AWB-${courierName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      estimatedDeliveryDate: estDeliveryDate || new Date(Date.now() + 4 * 86400000).toISOString(),
      dispatchOfficer: userName || 'Warehouse Lead',
    });

    setActiveDispatchOrder(null);
    refreshData();
  };

  // Handle Return QC Submit
  const handleReturnQCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturnOrder) return;

    commerceStore.processReturnQC({
      orderId: activeReturnOrder.id,
      qcAccepted: returnQcAccepted,
      reason: returnQcReason,
      inspectorRole: role,
      returnAction,
    });

    setActiveReturnOrder(null);
    refreshData();
  };

  const kpis = commerceStore.getFinancialKPIs();
  const unreadAlerts = notifications.filter((n) => !n.isRead);

  // Filtered orders for Dispatch Pipeline
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'ALL' && o.fulfillmentStatus !== orderFilter) return false;
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.items.some((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[96vh] text-left">
        {/* Header */}
        <div className="px-6 py-4 bg-[#2A2523] text-stone-200 flex items-center justify-between border-b border-stone-700">
          <div className="flex items-center gap-3">
            <Warehouse className="w-5 h-5 text-[#C5A059]" />
            <div>
              <h2 className="font-serif text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>VASTRIKA EXECUTIVE SUITE & SUPPLY CHAIN CONTROL</span>
                <span className="text-[10px] font-mono bg-stone-800 text-[#C5A059] px-2 py-0.5 rounded border border-stone-700">
                  Role: {role}
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                Single Source of Truth: Procurement, 3-Way QC, Live Stock, Fulfillment Dispatch & Returns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-100 px-6 py-2 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'OVERVIEW', label: 'Financial & P&L', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'PROCUREMENT', label: 'Weavers & POs (QC)', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'DISPATCH', label: 'Dispatch & Fulfillment', icon: <Truck className="w-3.5 h-3.5" /> },
            { id: 'RETURNS', label: 'Returns & QC Restock', icon: <RotateCcw className="w-3.5 h-3.5" /> },
            { id: 'ALERTS', label: `Owner Alerts (${unreadAlerts.length})`, icon: <Bell className="w-3.5 h-3.5" /> },
            { id: 'APPROVALS', label: `Approvals (${approvals.filter(a => a.status === 'PENDING').length})`, icon: <ShieldAlert className="w-3.5 h-3.5 text-[#C5A059]" /> },
            { id: 'STOCK_INTAKE', label: 'Bundle Intake Math', icon: <PackagePlus className="w-3.5 h-3.5" /> },
            { id: 'PRODUCTS', label: 'Live Stock & Catalog', icon: <Boxes className="w-3.5 h-3.5" /> },
            { id: 'MOVEMENTS', label: 'Audit Trail', icon: <History className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#5E1324] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh] flex-1">
          {/* TAB 1: Financial & P&L Overview */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Top KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-stone-500 block">Today's Revenue</span>
                  <p className="font-mono text-xl font-bold text-stone-900 tabular-nums">
                    {formatINR(kpis.todaySalesPaise)}
                  </p>
                  <p className="text-[10px] text-stone-400">Total Orders: {kpis.totalOrdersCount}</p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-stone-500 block">Inventory Valuation</span>
                  <p className="font-mono text-xl font-bold text-[#5E1324] tabular-nums">
                    {canViewCosts ? formatINR(kpis.inventoryValuationPaise) : 'Restricted (COGS Hidden)'}
                  </p>
                  <p className="text-[10px] text-stone-400">Units in Warehouses: {kpis.totalUnitsInStock} pcs</p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-stone-500 block">Gross Profit (COGS Deducted)</span>
                  <p className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
                    {canViewCosts ? formatINR(kpis.grossProfitPaise) : 'Restricted'}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-semibold">Margin: {kpis.grossMarginPercent}%</p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-stone-500 block">Low Stock Alerts</span>
                  <p className="font-mono text-xl font-bold text-amber-700 tabular-nums">
                    {kpis.lowStockCount} Sarees
                  </p>
                  <p className="text-[10px] text-amber-800">Below Reorder Threshold</p>
                </div>
              </div>

              {/* Accounting Formulation Breakdown Box */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2 text-amber-950 font-sans">
                <h4 className="font-bold flex items-center gap-1.5 font-serif text-sm text-[#5E1324]">
                  <span>Audited Accounting Principles & Formulas</span>
                </h4>
                <p>
                  • <strong>Gross Profit</strong> = Net Revenue − Cost of Goods Sold (COGS). Line items snapshot the supplier cost at the moment of receipt to ensure historical reports remain 100% accurate when catalog prices shift.
                </p>
                <p>
                  • <strong>Test Case Reassurance (#4)</strong>: A saree sold at ₹350 with unit cost ₹200 yields an authoritative gross profit of ₹150 per piece (42.9% margin).
                </p>
              </div>

              {/* Recent Orders Stream */}
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                  <span>Authoritative Transaction Log ({orders.length} orders)</span>
                  <button
                    onClick={() => setActiveTab('DISPATCH')}
                    className="text-[#5E1324] hover:underline flex items-center gap-1 text-[11px] font-sans font-semibold cursor-pointer"
                  >
                    <span>View Fulfillment Board</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </h3>
                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">
                      No orders recorded yet. Make a purchase via Storefront or Retail POS.
                    </div>
                  ) : (
                    orders.slice(0, 5).map((order, idx) => (
                      <div key={`${order.id}-${idx}`} className="p-3 flex items-center justify-between hover:bg-stone-50">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                order.source === 'ONLINE_STORE'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-purple-50 text-purple-700'
                              }`}
                            >
                              {order.source}
                            </span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                              PAID ({order.paymentMethod})
                            </span>
                            <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-mono">
                              Status: {order.fulfillmentStatus || 'UNFULFILLED'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Customer: {order.customerName} ({order.customerPhone}) · {order.items.length} sarees
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-[#5E1324]">{formatINR(order.totalPaise)}</p>
                          {canViewCosts && (
                            <p className="text-[10px] text-emerald-700 font-mono">
                              Profit: {formatINR(order.grossProfitPaise)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Procurement & Master Weavers */}
          {activeTab === 'PROCUREMENT' && (
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Master Weavers Directory & Purchase Orders (3-Way QC Matching)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage direct relationships with handloom silk guilds, verify bundles, and execute goods inspections.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewPOModalOpen(true)}
                  className="px-3.5 py-2 bg-[#5E1324] hover:bg-[#781D32] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-[#C5A059]" />
                  <span>Create Purchase Order</span>
                </button>
              </div>

              {/* Suppliers Scorecards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {suppliers.map((s) => (
                  <div key={s.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-stone-500">{s.id}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        ★ {s.rating}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm truncate">{s.name}</h4>
                      <p className="text-[11px] text-stone-500">
                        {s.contactPerson} · {s.city}, {s.state}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stone-200/60 grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-stone-400 block">Lead Time:</span>
                        <strong className="text-stone-700">{s.leadTimeDays || 7} Days</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">QC Pass Rate:</span>
                        <strong className="text-emerald-700">{s.qualityAcceptanceRate || 99}%</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-stone-400 block">Payment Terms:</span>
                        <span className="text-stone-700 truncate block">{s.paymentTerms || 'Net 30 Days'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Purchase Orders Table */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold text-stone-900 uppercase">
                  Active & Completed Purchase Orders ({purchaseOrders.length})
                </h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                  {purchaseOrders.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">
                      No purchase orders recorded yet. Create a PO above to order bundles.
                    </div>
                  ) : (
                    purchaseOrders.map((po) => (
                      <div key={po.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-stone-50/60">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900 text-sm">{po.poNumber}</span>
                            <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {po.supplierName}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                po.status === 'QC_COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : po.status === 'APPROVED' || po.status === 'SENT_TO_WEAVER'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {po.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600">
                            {po.items.map((i) => `${i.productName} (${i.bundles} bundles × ${i.piecesPerBundle} pcs = ${i.totalPieces} pcs)`).join(', ')}
                          </p>
                          {po.qcRecord && (
                            <p className="text-[10px] text-emerald-700 font-mono">
                              ✓ 3-Way Match Verified · Accepted: {po.qcRecord.acceptedPieces} pcs | Rejected: {po.qcRecord.rejectedPieces} pcs · Inspector: {po.qcRecord.inspectorName}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 justify-end shrink-0">
                          <div className="text-right">
                            <p className="font-mono font-bold text-[#5E1324] text-sm">
                              {formatINR(po.totalAmountPaise)}
                            </p>
                            <p className="text-[10px] text-stone-400 font-mono">{po.totalPieces} sarees</p>
                          </div>

                          {/* Action Buttons based on Status */}
                          {po.status === 'DRAFT' && (
                            <button
                              onClick={() => {
                                commerceStore.approvePurchaseOrder(po.id, role);
                                refreshData();
                              }}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Approve PO
                            </button>
                          )}

                          {po.status === 'APPROVED' && (
                            <button
                              onClick={() => {
                                commerceStore.sendPurchaseOrderToWeaver(po.id);
                                refreshData();
                              }}
                              className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send to Weaver</span>
                            </button>
                          )}

                          {po.status === 'SENT_TO_WEAVER' && (
                            <button
                              onClick={() => {
                                setActiveQCPO(po);
                                setQcReceivedPieces(po.totalPieces);
                                setQcAcceptedPieces(po.totalPieces);
                                setQcRejectedPieces(0);
                              }}
                              className="px-3 py-1.5 bg-[#5E1324] hover:bg-[#781D32] text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>Goods QC Inspection</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Dispatch & Order Fulfillment Pipeline */}
          {activeTab === 'DISPATCH' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Order Fulfillment & Courier Dispatch Board
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage the end-to-end delivery pipeline: Unfulfilled → Picked → Packed in Luxury Box → Dispatched.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search orders, phone, saree..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs w-56 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                {(['ALL', 'UNFULFILLED', 'PICKED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1 rounded-full font-mono text-[11px] transition cursor-pointer whitespace-nowrap ${
                      orderFilter === st
                        ? 'bg-[#2A2523] text-[#C5A059] font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st} ({orders.filter((o) => st === 'ALL' || o.fulfillmentStatus === st).length})
                  </button>
                ))}
              </div>

              {/* Orders Fulfillment Stream */}
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 space-y-1">
                    <Package className="w-8 h-8 mx-auto text-stone-300" />
                    <p>No orders found matching status filter "{orderFilter}".</p>
                  </div>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <div key={`${order.id}-${idx}`} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-stone-50">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-stone-900 text-sm">{order.orderNumber}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              order.fulfillmentStatus === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.fulfillmentStatus === 'DISPATCHED'
                                ? 'bg-blue-100 text-blue-800'
                                : order.fulfillmentStatus === 'PACKED'
                                ? 'bg-indigo-100 text-indigo-800'
                                : order.fulfillmentStatus === 'PICKED'
                                ? 'bg-purple-100 text-purple-800'
                                : order.fulfillmentStatus === 'RETURN_REQUESTED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {order.fulfillmentStatus || 'UNFULFILLED'}
                          </span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                            {order.paymentStatus}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <p className="text-stone-700 font-medium">
                          Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
                          {order.shippingAddress && ` · ${order.shippingAddress.city}, PIN: ${order.shippingAddress.pincode}`}
                        </p>

                        <div className="text-stone-500 text-[11px] flex items-center gap-2 flex-wrap">
                          {order.items.map((i) => (
                            <span key={i.productId} className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                              {i.quantity}× {i.name} ({i.fabric})
                            </span>
                          ))}
                        </div>

                        {order.dispatchDetails && (
                          <div className="p-2 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>
                              Courier: <strong>{order.dispatchDetails.courier}</strong> · AWB: <code className="font-mono font-bold">{order.dispatchDetails.trackingNumber}</code> · Est. Arrival: {new Date(order.dispatchDetails.estimatedDeliveryDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button Row */}
                      <div className="flex items-center gap-2 justify-end shrink-0">
                        <div className="text-right pr-2">
                          <p className="font-mono font-bold text-[#5E1324] text-sm">{formatINR(order.totalPaise)}</p>
                        </div>

                        {order.fulfillmentStatus === 'UNFULFILLED' && (
                          <button
                            onClick={() => {
                              commerceStore.updateOrderFulfillment(order.id, 'PICKED', userName || 'Warehouse Staff');
                              refreshData();
                            }}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold cursor-pointer"
                          >
                            Pick Saree
                          </button>
                        )}

                        {order.fulfillmentStatus === 'PICKED' && (
                          <button
                            onClick={() => {
                              commerceStore.updateOrderFulfillment(order.id, 'PACKED', userName || 'Warehouse Staff');
                              refreshData();
                            }}
                            className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Pack in Luxury Box</span>
                          </button>
                        )}

                        {order.fulfillmentStatus === 'PACKED' && (
                          <button
                            onClick={() => {
                              setActiveDispatchOrder(order);
                              setTrackingNumber(`AWB-BD-${Date.now().toString().slice(-6)}`);
                              setEstDeliveryDate(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
                            }}
                            className="px-3 py-1.5 bg-[#5E1324] hover:bg-[#781D32] text-white rounded text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>Dispatch via Courier</span>
                          </button>
                        )}

                        {order.fulfillmentStatus === 'DISPATCHED' && (
                          <button
                            onClick={() => {
                              commerceStore.markOrderDelivered(order.id);
                              refreshData();
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Delivered</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Returns, QC & Authoritative Refund Processing */}
          {activeTab === 'RETURNS' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Customer Returns & Authoritative Restock Desk
                </h3>
                <p className="text-xs text-stone-500">
                  Inspect returned sarees, verify pleats/fabric/zari condition, and issue refunds with automatic inventory restoration.
                </p>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                {orders.filter((o) => o.fulfillmentStatus === 'RETURN_REQUESTED' || o.fulfillmentStatus === 'RETURNED').length === 0 ? (
                  <div className="p-12 text-center text-stone-400 space-y-1">
                    <RotateCcw className="w-8 h-8 mx-auto text-stone-300" />
                    <p>No return requests pending currently.</p>
                    <p className="text-[11px] text-stone-400">
                      Customers can request returns from their Account Order History after delivery.
                    </p>
                  </div>
                ) : (
                  orders
                    .filter((o) => o.fulfillmentStatus === 'RETURN_REQUESTED' || o.fulfillmentStatus === 'RETURNED')
                    .map((order, idx) => (
                      <div key={`${order.id}-${idx}`} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-stone-50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900 text-sm">{order.orderNumber}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                order.fulfillmentStatus === 'RETURNED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}
                            >
                              {order.fulfillmentStatus}
                            </span>
                            <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-mono">
                              Refund: {order.returnDetails?.refundStatus || 'PENDING'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600">
                            Customer: <strong>{order.customerName}</strong> ({order.customerPhone}) · Value: <strong className="font-mono text-[#5E1324]">{formatINR(order.totalPaise)}</strong>
                          </p>
                          <p className="text-[11px] text-rose-700 font-sans">
                            Customer Reason: "{order.returnDetails?.reason || 'Color / Drape variation'}"
                          </p>
                        </div>

                        <div className="flex items-center gap-2 justify-end shrink-0">
                          {order.fulfillmentStatus === 'RETURN_REQUESTED' && (
                            <button
                              onClick={() => {
                                setActiveReturnOrder(order);
                                setReturnQcAccepted(true);
                                setReturnAction('RESTOCK');
                              }}
                              className="px-3.5 py-2 bg-[#5E1324] hover:bg-[#781D32] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>Inspect & Process Refund</span>
                            </button>
                          )}

                          {order.fulfillmentStatus === 'RETURNED' && (
                            <span className="text-emerald-700 font-mono text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Refund Processed & Stock Restored</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Owner Escalations & Alerts Hub */}
          {activeTab === 'ALERTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Owner Escalation & Operational Notifications
                  </h3>
                  <p className="text-xs text-stone-500">
                    Automated real-time notifications: Low stock thresholds, weaver defects, signature tampering, and dispatch delays.
                  </p>
                </div>
                <button
                  onClick={() => {
                    commerceStore.markAllNotificationsRead();
                    refreshData();
                  }}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded cursor-pointer"
                >
                  Mark All Read
                </button>
              </div>

              {/* Multi-Channel Health Status Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                  <div>
                    <h5 className="font-bold text-emerald-950">In-App Notification Hub</h5>
                    <p className="text-[10px] text-emerald-800">Operational (100% Delivery)</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <div>
                    <h5 className="font-bold text-blue-950">WhatsApp Business API</h5>
                    <p className="text-[10px] text-blue-800">Simulated Sandbox (Automated Order AWBs)</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <div>
                    <h5 className="font-bold text-amber-950">Email Dispatcher (SendGrid)</h5>
                    <p className="text-[10px] text-amber-800">Active Test Credentials</p>
                  </div>
                </div>
              </div>

              {/* Notifications Stream */}
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-stone-400">No notifications logged.</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 flex items-start justify-between gap-3 transition ${
                        notif.isRead ? 'bg-white hover:bg-stone-50' : 'bg-amber-50/60 font-medium'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              notif.isOwnerEscalation
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {notif.event}
                          </span>
                          <span className="font-bold text-stone-900">{notif.title}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            Target: {notif.recipientRole}
                          </span>
                        </div>
                        <p className="text-stone-600 font-sans">{notif.message}</p>
                        <p className="text-[10px] text-stone-400 font-mono">
                          Ref: {notif.referenceId} · Channel: {notif.channel} ({notif.deliveryStatus})
                        </p>
                      </div>

                      <div className="shrink-0 pt-1">
                        {!notif.isRead ? (
                          <button
                            onClick={() => {
                              commerceStore.markNotificationRead(notif.id);
                              refreshData();
                            }}
                            className="text-[11px] text-amber-800 hover:text-amber-950 underline cursor-pointer"
                          >
                            Mark Read
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-mono">Read</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: Executive Approvals & Financial Controls */}
          {activeTab === 'APPROVALS' && (
            <div className="space-y-6">
              {/* Security Header Banner */}
              <div className="p-4 bg-gradient-to-r from-[#2A2523] to-[#40121C] text-white rounded-2xl border border-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#C5A059]" />
                    <h3 className="font-serif text-base font-bold text-white tracking-wide">
                      EXECUTIVE FINANCIAL APPROVALS & EXPOSURE QUEUE
                    </h3>
                  </div>
                  <p className="text-xs text-stone-300">
                    Mandatory Policy: Only the authorized Owner / Administrator can approve transactions incurring financial outflow, inventory write-offs, or refund payouts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full font-bold border ${
                    role === 'OWNER_ADMIN'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  }`}>
                    {role === 'OWNER_ADMIN' ? 'AUTHORIZED: OWNER SIGN-OFF ACTIVE' : `RESTRICTED: ${role} (READ-ONLY)`}
                  </span>
                </div>
              </div>

              {approvalFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{approvalFeedback}</span>
                  </div>
                  <button
                    onClick={() => setApprovalFeedback(null)}
                    className="text-stone-400 hover:text-stone-600 cursor-pointer text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* KPI Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                    Pending Authorizations
                  </span>
                  <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                    {approvals.filter((a) => a.status === 'PENDING').length}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5">Awaiting Owner digital signature</p>
                </div>

                <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                    Financial Exposure Pending
                  </span>
                  <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
                    {formatINR(
                      approvals
                        .filter((a) => a.status === 'PENDING')
                        .reduce((sum, a) => sum + a.amountPaise, 0)
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5">Pending refunds & write-offs</p>
                </div>

                <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                    Approved Historical Requests
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                    {approvals.filter((a) => a.status === 'APPROVED').length}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5">Executed with full audit trail</p>
                </div>
              </div>

              {/* Approval Request Table */}
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-[#5E1324]" />
                    <h4 className="font-serif text-sm font-bold text-stone-900">
                      Pending & Historical Authorization Requests
                    </h4>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {approvals.length} Total Records
                  </span>
                </div>

                <div className="divide-y divide-stone-100 overflow-x-auto">
                  {approvals.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-xs">
                      No approval requests currently in queue.
                    </div>
                  ) : (
                    approvals.map((req) => (
                      <div
                        key={req.id}
                        className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                          req.status === 'PENDING' ? 'bg-amber-50/40' : 'bg-white'
                        }`}
                      >
                        <div className="space-y-1 max-w-xl text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                req.type === 'FINANCIAL_REFUND'
                                  ? 'bg-blue-100 text-blue-900'
                                  : req.type === 'DAMAGE_WRITE_OFF'
                                  ? 'bg-rose-100 text-rose-900'
                                  : 'bg-purple-100 text-purple-900'
                              }`}
                            >
                              {req.type.replace('_', ' ')}
                            </span>

                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                req.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-900 animate-pulse'
                                  : req.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {req.status}
                            </span>

                            <span className="font-mono text-stone-500 text-[11px]">
                              Ref: {req.referenceId}
                            </span>
                          </div>

                          <div className="font-semibold text-stone-900 text-sm">
                            Amount: <span className="font-mono text-[#5E1324]">{formatINR(req.amountPaise)}</span>
                          </div>

                          <p className="text-stone-600 text-xs">{req.reason}</p>

                          <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2 pt-0.5">
                            <span>Requested by: <strong>{req.requestedBy}</strong> ({req.requesterRole})</span>
                            <span>·</span>
                            <span>{new Date(req.requestedAt).toLocaleString('en-IN')}</span>
                            {req.reviewedBy && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-700 font-bold">
                                  Reviewed by: {req.reviewedBy} at {new Date(req.reviewedAt || '').toLocaleTimeString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-2">
                          {req.status === 'PENDING' ? (
                            role === 'OWNER_ADMIN' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    const res = commerceStore.reviewApproval({
                                      approvalId: req.id,
                                      action: 'APPROVE',
                                      reviewerRole: 'OWNER_ADMIN',
                                      reviewerName: userName || 'Owner',
                                      reviewNotes: reviewNotes || 'Authorized upon executive review',
                                    });
                                    if (res.success) {
                                      setApprovalFeedback(`Authorized: ${req.referenceId} approved and processed.`);
                                      refreshData();
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Authorize & Execute</span>
                                </button>

                                <button
                                  onClick={() => {
                                    const res = commerceStore.reviewApproval({
                                      approvalId: req.id,
                                      action: 'REJECT',
                                      reviewerRole: 'OWNER_ADMIN',
                                      reviewerName: userName || 'Owner',
                                      reviewNotes: 'Declined by Owner',
                                    });
                                    if (res.success) {
                                      setApprovalFeedback(`Declined: ${req.referenceId} rejected.`);
                                      refreshData();
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-rose-100 hover:text-rose-800 text-stone-700 rounded-lg font-bold text-xs transition cursor-pointer"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <div className="px-3 py-1.5 bg-stone-100 border border-stone-200 text-stone-500 rounded-lg text-[11px] font-mono flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                <span>Owner Approval Required</span>
                              </div>
                            )
                          ) : (
                            <span className="text-[11px] font-mono text-stone-400 italic">
                              Closed ({req.status})
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Bundle Intake Module */}
          {activeTab === 'STOCK_INTAKE' && (
            <div className="space-y-6">
              <div className="max-w-xl mx-auto bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Receive Saree Bundles from Master Weavers
                  </h3>
                  <p className="text-xs text-stone-500 font-sans mt-0.5">
                    Weavers ship sarees in packed bundles. Enter the bundle count and pieces per bundle to mathematically update inventory.
                  </p>
                </div>

                {intakeSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{intakeSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleBundleIntake} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Select Target Saree *</label>
                    <select
                      value={intakeProductId}
                      onChange={(e) => setIntakeProductId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    >
                      <option value="">-- Choose Saree to Receive --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} — {p.name} (Current Stock: {p.availableQty})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">
                        Number of Bundles *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={bundleCount}
                        onChange={(e) => setBundleCount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-medium mb-1">
                        Pieces Per Bundle *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={piecesPerBundle}
                        onChange={(e) => setPiecesPerBundle(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>

                  {canViewCosts && (
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">
                        Supplier Unit Cost (₹ per piece)
                      </label>
                      <input
                        type="number"
                        value={unitCostRupees}
                        onChange={(e) => setUnitCostRupees(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  )}

                  {/* Calculated summary pill */}
                  <div className="p-3 bg-stone-200/60 rounded-xl text-stone-800 text-xs flex justify-between items-center font-mono font-semibold">
                    <span>Total Saree Pieces Added:</span>
                    <span className="text-base text-[#5E1324]">
                      {Number(bundleCount) * Number(piecesPerBundle)} Pieces
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer"
                  >
                    Confirm & Receive into Warehouse
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: Stock Levels & Valuation */}
          {activeTab === 'PRODUCTS' && (
            <div className="space-y-4">
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-stone-100 px-4 py-2.5 border-b border-stone-200 grid grid-cols-12 text-[11px] font-bold text-stone-600 uppercase font-mono">
                  <span className="col-span-4">Saree & SKU</span>
                  <span className="col-span-2">Weave Category</span>
                  <span className="col-span-2 text-right">Available Qty</span>
                  <span className="col-span-2 text-right">Selling Price</span>
                  <span className="col-span-2 text-center">Action</span>
                </div>

                <div className="divide-y divide-stone-100">
                  {products.map((p) => (
                    <div key={p.id} className="px-4 py-3 grid grid-cols-12 items-center hover:bg-stone-50">
                      <div className="col-span-4 pr-2">
                        <p className="font-semibold text-stone-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-stone-500 font-mono">SKU: {p.sku}</p>
                      </div>

                      <div className="col-span-2 text-stone-600 truncate">{p.category}</div>

                      <div className="col-span-2 text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            p.availableQty <= p.lowStockThreshold
                              ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded'
                              : 'text-emerald-700'
                          }`}
                        >
                          {p.availableQty} pcs
                        </span>
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-[#5E1324] tabular-nums">
                        {formatINR(p.sellingPricePaise)}
                      </div>

                      <div className="col-span-2 text-center">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="px-2.5 py-1 text-[11px] text-stone-700 hover:text-[#5E1324] bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 font-medium transition cursor-pointer"
                        >
                          Manage Stock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Product Stock Adjustment / Damage Write-Off Modal */}
              {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                  <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl border border-stone-200 text-xs">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-serif text-sm font-bold text-stone-900">
                        Adjust Stock: {selectedProduct.sku}
                      </h4>
                      <button onClick={() => setSelectedProduct(null)} className="cursor-pointer">
                        <X className="w-4 h-4 text-stone-500" />
                      </button>
                    </div>

                    <p className="text-stone-600">
                      Product: <strong>{selectedProduct.name}</strong> (Current Stock: {selectedProduct.availableQty})
                    </p>

                    {damageSuccess && (
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded">
                        {damageSuccess}
                      </div>
                    )}

                    <form onSubmit={handleWriteOffDamage} className="space-y-3">
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">
                          Damage Write-off Quantity (Deducts from Available)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={selectedProduct.availableQty}
                          value={damageQty}
                          onChange={(e) => setDamageQty(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-700 font-medium mb-1">
                          Audit Reason / Damage Note *
                        </label>
                        <input
                          type="text"
                          required
                          value={damageReason}
                          onChange={(e) => setDamageReason(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-300 rounded"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded transition cursor-pointer"
                      >
                        Write Off & Log in Audit Trail
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: Inventory Movements Audit Log */}
          {activeTab === 'MOVEMENTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>TOTAL LOGGED MOVEMENTS: {movements.length}</span>
                <span>Tamper-Proof Audit Trail</span>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs divide-y divide-stone-100">
                {movements.length === 0 ? (
                  <div className="p-8 text-center text-stone-400">
                    No movements recorded yet. Receive bundles or complete sales to generate audit records.
                  </div>
                ) : (
                  movements.map((mov) => (
                    <div key={mov.id} className="p-3 flex items-center justify-between hover:bg-stone-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              mov.quantityDelta > 0
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {mov.type}
                          </span>
                          <span className="font-semibold text-stone-900">{mov.productName}</span>
                          <span className="font-mono text-stone-400">({mov.sku})</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {mov.reason} · Ref: <code className="font-mono">{mov.referenceId}</code> · By: <strong className="text-stone-700">{mov.performedBy}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono text-sm font-bold ${
                            mov.quantityDelta > 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta} pcs
                        </span>
                        <p className="text-[10px] text-stone-400">
                          {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- MODAL DIALOGS --- */}

        {/* 1. Create Purchase Order Modal */}
        {isNewPOModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl border border-stone-200 text-xs text-left">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Create Master Weaver Purchase Order
                </h4>
                <button onClick={() => setIsNewPOModalOpen(false)} className="cursor-pointer">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>

              <form onSubmit={handleCreatePO} className="space-y-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Select Master Weaver / Guild *</label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white"
                  >
                    <option value="">-- Choose Artisan Guild --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city}, {s.state}) · Lead Time: {s.leadTimeDays}d
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Select Target Saree *</label>
                  <select
                    value={poProductId}
                    onChange={(e) => setPoProductId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white"
                  >
                    <option value="">-- Choose Saree to Order --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Number of Bundles *</label>
                    <input
                      type="number"
                      min={1}
                      value={poBundles}
                      onChange={(e) => setPoBundles(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Pieces Per Bundle *</label>
                    <input
                      type="number"
                      min={1}
                      value={poPcsPerBundle}
                      onChange={(e) => setPoPcsPerBundle(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Cost Per Saree (₹) *</label>
                  <input
                    type="number"
                    min={1}
                    value={poCostPerPieceRupees}
                    onChange={(e) => setPoCostPerPieceRupees(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-stone-100 rounded text-stone-700 font-mono text-xs flex justify-between">
                  <span>Total Sarees: <strong>{poBundles * poPcsPerBundle} pcs</strong></span>
                  <span>Total Cost: <strong className="text-[#5E1324]">{formatINR(poBundles * poPcsPerBundle * poCostPerPieceRupees * 100)}</strong></span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Procurement Notes</label>
                  <input
                    type="text"
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Generate Purchase Order
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. Goods Receipt QC Modal */}
        {activeQCPO && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl border border-stone-200 text-xs text-left">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Goods Receipt & 3-Way QC Inspection
                  </h4>
                  <p className="text-[11px] text-stone-500 font-mono">{activeQCPO.poNumber} · {activeQCPO.supplierName}</p>
                </div>
                <button onClick={() => setActiveQCPO(null)} className="cursor-pointer">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>

              <form onSubmit={handleProcessGoodsReceiptQC} className="space-y-3">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1">
                  <p><strong>PO Total Quantity:</strong> {activeQCPO.totalPieces} sarees</p>
                  <p><strong>PO Total Value:</strong> {formatINR(activeQCPO.totalAmountPaise)}</p>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Physical Received Pieces *</label>
                  <input
                    type="number"
                    min={1}
                    value={qcReceivedPieces}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setQcReceivedPieces(v);
                      setQcAcceptedPieces(v - qcRejectedPieces);
                    }}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-emerald-800 font-medium mb-1">Accepted (Intake to Stock) *</label>
                    <input
                      type="number"
                      min={0}
                      max={qcReceivedPieces}
                      value={qcAcceptedPieces}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setQcAcceptedPieces(val);
                        setQcRejectedPieces(qcReceivedPieces - val);
                      }}
                      className="w-full px-3 py-1.5 border border-emerald-300 bg-emerald-50 rounded font-mono font-bold text-emerald-900"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-800 font-medium mb-1">Rejected (Weaver Defect) *</label>
                    <input
                      type="number"
                      min={0}
                      max={qcReceivedPieces}
                      value={qcRejectedPieces}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setQcRejectedPieces(val);
                        setQcAcceptedPieces(qcReceivedPieces - val);
                      }}
                      className="w-full px-3 py-1.5 border border-rose-300 bg-rose-50 rounded font-mono font-bold text-rose-900"
                    />
                  </div>
                </div>

                {qcRejectedPieces > 0 && (
                  <div>
                    <label className="block text-rose-700 font-medium mb-1">Rejection Reason *</label>
                    <input
                      type="text"
                      required
                      value={qcRejectionReason}
                      onChange={(e) => setQcRejectionReason(e.target.value)}
                      className="w-full px-3 py-1.5 border border-rose-300 rounded"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-stone-700 font-medium mb-1">QC Inspector *</label>
                  <input
                    type="text"
                    required
                    value={qcInspector}
                    onChange={(e) => setQcInspector(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono"
                  />
                </div>

                <div className="p-2.5 bg-blue-50 text-blue-900 rounded text-[11px]">
                  ✓ 3-Way Match Audit: {qcReceivedPieces === activeQCPO.totalPieces ? 'Exact Match (100%)' : 'Variance Detected'}
                  <br />
                  Accepted pieces will immediately appear in live warehouse stock.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Verify 3-Way QC & Intake Stock
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. Courier Dispatch Modal */}
        {activeDispatchOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl border border-stone-200 text-xs text-left">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Dispatch Parcel: {activeDispatchOrder.orderNumber}
                </h4>
                <button onClick={() => setActiveDispatchOrder(null)} className="cursor-pointer">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>

              <form onSubmit={handleDispatchSubmit} className="space-y-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Courier Logistics Partner *</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white"
                  >
                    <option value="BlueDart Express">BlueDart Express (Air Courier)</option>
                    <option value="Delhivery Air">Delhivery Air Surface</option>
                    <option value="India Post SpeedPost">India Post SpeedPost (Rural / Remote)</option>
                    <option value="Direct Store Courier">Direct Store Express Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">AWB Tracking Number *</label>
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Estimated Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={estDeliveryDate}
                    onChange={(e) => setEstDeliveryDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono"
                  />
                </div>

                <div className="p-2.5 bg-stone-100 rounded text-stone-600 text-[11px]">
                  Customer: <strong>{activeDispatchOrder.customerName}</strong> ({activeDispatchOrder.customerPhone})
                  <br />
                  Destination: {activeDispatchOrder.shippingAddress?.city}, {activeDispatchOrder.shippingAddress?.pincode}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Confirm Dispatch & Send AWB to Customer
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. Return QC Inspection Modal */}
        {activeReturnOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl border border-stone-200 text-xs text-left">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Return Physical QC Inspection: {activeReturnOrder.orderNumber}
                </h4>
                <button onClick={() => setActiveReturnOrder(null)} className="cursor-pointer">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>

              <form onSubmit={handleReturnQCSubmit} className="space-y-3">
                <div className="p-3 bg-stone-50 rounded border border-stone-200 text-stone-700 text-xs space-y-1">
                  <p>Customer: <strong>{activeReturnOrder.customerName}</strong></p>
                  <p className="text-rose-700">Reason: "{activeReturnOrder.returnDetails?.reason}"</p>
                  <p className="font-mono text-[#5E1324] font-bold">Refund Value: {formatINR(activeReturnOrder.totalPaise)}</p>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Inspection Verdict *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReturnQcAccepted(true)}
                      className={`p-2 rounded border text-xs font-bold text-center cursor-pointer ${
                        returnQcAccepted ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'border-stone-200 text-stone-500'
                      }`}
                    >
                      ✓ Approve Return
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnQcAccepted(false)}
                      className={`p-2 rounded border text-xs font-bold text-center cursor-pointer ${
                        !returnQcAccepted ? 'bg-rose-50 border-rose-500 text-rose-800' : 'border-stone-200 text-stone-500'
                      }`}
                    >
                      ✕ Reject Return
                    </button>
                  </div>
                </div>

                {returnQcAccepted && (
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Inventory Action *</label>
                    <select
                      value={returnAction}
                      onChange={(e) => setReturnAction(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs bg-white"
                    >
                      <option value="RESTOCK">Restock into Available Inventory (Pristine)</option>
                      <option value="DAMAGE_WRITE_OFF">Write-off to Damage Ledger (Soiled / Snagged)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Inspection Notes *</label>
                  <input
                    type="text"
                    required
                    value={returnQcReason}
                    onChange={(e) => setReturnQcReason(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5E1324] hover:bg-[#781D32] text-white font-bold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Finalize QC & Process Authoritative Refund
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
