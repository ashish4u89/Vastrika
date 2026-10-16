/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'OWNER_ADMIN'
  | 'STORE_MANAGER'
  | 'BILLING_OPERATOR'
  | 'INVENTORY_OPERATOR'
  | 'PURCHASE_MANAGER'
  | 'ORDER_MANAGER'
  | 'WAREHOUSE_PACKING'
  | 'CUSTOMER';

export type CollectionSlug =
  | 'all'
  | 'working-women'
  | 'teachers-collection'
  | 'office-wear'
  | 'bank-corporate'
  | 'daily-wear'
  | 'festival-sale'
  | 'diwali'
  | 'navratri'
  | 'karwa-chauth'
  | 'durga-puja'
  | 'wedding-guest'
  | 'festive-gifts'
  | 'new-arrivals'
  | 'bestsellers'
  | 'budget-collection';

export interface SareeCollectionMeta {
  slug: CollectionSlug;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: string;
  collections: CollectionSlug[];
  fabric: string;
  color: string;
  lengthMeters: number;
  blousePiece: 'Included (Unstitched 0.8m)' | 'Included (Contrast 0.8m)' | 'Running Blouse Piece' | 'Not Included';
  careInstructions: string;
  supplierId: string;
  supplierName: string;
  costPricePaise: number;
  sellingPricePaise: number;
  mrpPaise: number;
  discountPercent: number;
  taxRatePercent: number;
  availableQty: number;
  reservedQty: number;
  lowStockThreshold: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK';
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type:
    | 'PURCHASE_RECEIPT'
    | 'ONLINE_SALE'
    | 'POS_SALE'
    | 'CUSTOMER_RETURN'
    | 'SUPPLIER_RETURN'
    | 'DAMAGE_WRITE_OFF'
    | 'AUDIT_ADJUSTMENT';
  quantityDelta: number;
  bundleCount?: number;
  piecesPerBundle?: number;
  unitCostPaise?: number;
  referenceId: string;
  performedBy: string;
  reason?: string;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  city: string;
  state: string;
  rating: number;
  totalPurchasedPaise: number;
  leadTimeDays: number;
  paymentTerms: string;
  activeStatus: 'ACTIVE' | 'ON_HOLD' | 'PROBATION';
  onTimeDeliveryRate: number; // Percentage e.g. 96.5%
  qualityAcceptanceRate: number; // Percentage e.g. 98.2%
}

export interface PurchaseOrderItem {
  productId: string;
  sku: string;
  productName: string;
  bundles: number;
  piecesPerBundle: number;
  totalPieces: number;
  costPerPiecePaise: number;
  totalCostPaise: number;
}

export interface GoodsReceiptQC {
  receivedDate: string;
  totalReceivedPieces: number;
  acceptedPieces: number;
  rejectedPieces: number;
  rejectionReason?: string;
  inspectorName: string;
  threeWayMatched: boolean; // PO cost matches invoice and accepted quantity
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalPieces: number;
  totalAmountPaise: number;
  status: 'DRAFT' | 'APPROVED' | 'SENT_TO_WEAVER' | 'GOODS_RECEIVED' | 'QC_COMPLETED' | 'PAID' | 'CANCELLED';
  approvedBy?: string;
  createdAt: string;
  qcRecord?: GoodsReceiptQC;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  image: string;
  fabric: string;
  unitSellingPricePaise: number;
  unitCostPricePaise: number;
  quantity: number;
  subtotalPaise: number;
  taxPaise: number;
}

export type OrderFulfillmentStatus =
  | 'UNFULFILLED'
  | 'PICKED'
  | 'PACKED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export interface DispatchTracking {
  courier: 'BlueDart Express' | 'Delhivery Air' | 'India Post SpeedPost' | 'Direct Store Courier';
  trackingNumber: string;
  dispatchedAt: string;
  estimatedDeliveryDate: string;
  deliveredAt?: string;
  dispatchOfficer: string;
}

export interface ReturnDetails {
  reason: string;
  requestedAt: string;
  qcAccepted: boolean;
  refundPaise: number;
  refundStatus: 'PENDING' | 'PROCESSED' | 'REJECTED';
  refundedAt?: string;
  inspectorRole?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  source: 'ONLINE_STORE' | 'RETAIL_POS';
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress?: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotalPaise: number;
  discountPaise: number;
  couponCode?: string;
  taxPaise: number;
  shippingPaise: number;
  totalPaise: number;
  totalCostPaise: number;
  grossProfitPaise: number;
  paymentMethod: 'RAZORPAY' | 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  paymentStatus: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED';
  fulfillmentStatus: OrderFulfillmentStatus;
  dispatchDetails?: DispatchTracking;
  returnDetails?: ReturnDetails;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  notes?: string;
}

export interface POSCartItem extends OrderItem {
  availableQty: number;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FLAT_AMOUNT';
  discountValue: number;
  minOrderValuePaise: number;
  maxDiscountPaise?: number;
  isActive: boolean;
  expiryDate: string;
}

export interface FestivalCampaign {
  id: string;
  title: string;
  tagline: string;
  bannerImage: string;
  couponCode: string;
  discountPercent: number;
  collectionSlug: CollectionSlug;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export type NotificationEvent =
  | 'NEW_ORDER'
  | 'PAYMENT_FAILURE'
  | 'LOW_STOCK'
  | 'PO_PENDING_APPROVAL'
  | 'SUPPLIER_DELAY'
  | 'GOODS_REJECTED'
  | 'PACKING_OVERDUE'
  | 'DISPATCH_DELAYED'
  | 'REFUND_FAILED'
  | 'STOCK_MISMATCH';

export interface AppNotification {
  id: string;
  event: NotificationEvent;
  recipientRole: UserRole;
  isOwnerEscalation: boolean;
  title: string;
  message: string;
  referenceId: string;
  channel: 'IN_APP' | 'WHATSAPP' | 'EMAIL';
  deliveryStatus: 'DELIVERED' | 'FAILED' | 'RETRIED';
  isRead: boolean;
  timestamp: string;
}

export interface DefectRecord {
  id: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  module: string;
  title: string;
  rootCause: string;
  fixStatus: 'RESOLVED' | 'VERIFIED' | 'OPEN';
  regressionTest: string;
}

export type ApprovalType = 'FINANCIAL_REFUND' | 'DAMAGE_WRITE_OFF' | 'PO_COMMITMENT' | 'CUSTOM_DISCOUNT';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  referenceId: string;
  amountPaise: number;
  requestedBy: string;
  requesterRole: UserRole;
  reason: string;
  status: ApprovalStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  metadata?: Record<string, any>;
}
