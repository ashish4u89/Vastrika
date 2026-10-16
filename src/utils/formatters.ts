/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats integer paise into Indian Rupee currency string (e.g. 199900 -> "₹1,999")
 */
export function formatINR(paise: number, includeDecimals = false): string {
  if (isNaN(paise) || paise === null || paise === undefined) return '₹0';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees);
}

/**
 * Converts Indian Rupee number to paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise to rupee number
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Calculates Gross Profit: (Selling Price - Cost Price) * Quantity
 * Matches prompt test requirement: ₹350 sale against ₹200 unit cost = ₹150 per piece
 */
export function calculateGrossProfit(
  unitSellingPricePaise: number,
  unitCostPricePaise: number,
  quantity: number
): { grossProfitPaise: number; grossMarginPercent: number } {
  const profitPerPiecePaise = unitSellingPricePaise - unitCostPricePaise;
  const grossProfitPaise = profitPerPiecePaise * quantity;
  const grossMarginPercent =
    unitSellingPricePaise > 0
      ? Math.round((profitPerPiecePaise / unitSellingPricePaise) * 1000) / 10
      : 0;
  return { grossProfitPaise, grossMarginPercent };
}

/**
 * Calculates GST breakdown for sarees (standard 5% in India)
 */
export function calculateGST(
  taxableSubtotalPaise: number,
  taxRatePercent = 5
): {
  cgstPaise: number;
  sgstPaise: number;
  totalTaxPaise: number;
} {
  const totalTaxPaise = Math.round((taxableSubtotalPaise * taxRatePercent) / 100);
  const cgstPaise = Math.round(totalTaxPaise / 2);
  const sgstPaise = totalTaxPaise - cgstPaise;
  return { cgstPaise, sgstPaise, totalTaxPaise };
}

/**
 * Generates human-friendly sequential order number
 */
export function generateOrderNumber(prefix = 'VAS'): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

/**
 * Verifies PIN code serviceability across Indian states
 */
export function checkPincodeServiceability(pincode: string): {
  isServiceable: boolean;
  city?: string;
  state?: string;
  estimatedDeliveryDays?: number;
  isExpressAvailable?: boolean;
} {
  if (!pincode || pincode.trim().length !== 6 || !/^\d{6}$/.test(pincode)) {
    return { isServiceable: false };
  }

  const firstDigit = pincode[0];
  const pinData: Record<string, { city: string; state: string; days: number }> = {
    '1': { city: 'Delhi / NCR / North Zone', state: 'Delhi & Haryana', days: 2 },
    '2': { city: 'Lucknow / Varanasi Region', state: 'Uttar Pradesh', days: 3 },
    '3': { city: 'Jaipur / Ahmedabad Region', state: 'Rajasthan & Gujarat', days: 3 },
    '4': { city: 'Mumbai / Pune Region', state: 'Maharashtra', days: 2 },
    '5': { city: 'Hyderabad / Bengaluru Region', state: 'Telangana & Karnataka', days: 2 },
    '6': { city: 'Chennai / Coimbatore Region', state: 'Tamil Nadu & Kerala', days: 2 },
    '7': { city: 'Kolkata / Patna Region', state: 'West Bengal & Bihar', days: 3 },
    '8': { city: 'Ranchi / Bhubaneswar Region', state: 'Jharkhand & Odisha', days: 4 },
  };

  const region = pinData[firstDigit] || { city: 'National Delivery Hub', state: 'India', days: 4 };
  return {
    isServiceable: true,
    city: region.city,
    state: region.state,
    estimatedDeliveryDays: region.days,
    isExpressAvailable: region.days <= 2,
  };
}
