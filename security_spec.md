# VASTRIKA Security Specification & Red Team Audit

## 1. Data Invariants

1. **Customer PII Isolation**: Customer contact numbers, addresses, and order records must only be accessible to the customer who created them or authenticated administrative staff (`OWNER_ADMIN`, `STORE_MANAGER`, `BILLING_OPERATOR`).
2. **Authoritative Pricing & Stock**: Customers cannot write or modify product prices, stock quantities, or margins.
3. **Immutability of Audit Movements**: An inventory movement record once written cannot be updated or deleted.
4. **Role Escalation Prevention**: Users cannot alter their own `role` attribute in their profile.
5. **Bootstrapped Admin**: `ashish.4u89@gmail.com` is recognized as the sovereign root administrator.

## 2. The "Dirty Dozen" Attack Payloads

1. **Payload 1 (Price Tampering)**: Malicious client attempts to set `sellingPricePaise: 100` (₹1) on a Kanjivaram silk saree.
   - *Expected Outcome*: PERMISSION_DENIED.
2. **Payload 2 (Ghost Field Attack)**: Malicious user attempts to add `isAdmin: true` during profile creation.
   - *Expected Outcome*: PERMISSION_DENIED via `hasOnly()` key strictness.
3. **Payload 3 (Stock Exhaustion Spoof)**: Unauthenticated client attempts to set `availableQty: 0` directly.
   - *Expected Outcome*: PERMISSION_DENIED.
4. **Payload 4 (Audit Log Deletion)**: Staff attempts to delete an `inventoryMovement` record to hide damaged stock.
   - *Expected Outcome*: PERMISSION_DENIED (delete disallowed on movements).
5. **Payload 5 (Order Total Tamper)**: Client attempts to write `totalPaise: 0` on an order while ordering 5 sarees.
   - *Expected Outcome*: PERMISSION_DENIED.
6. **Payload 6 (ID Poisoning)**: Malicious user passes a 2KB binary string as `{productId}`.
   - *Expected Outcome*: PERMISSION_DENIED via `isValidId()`.
7. **Payload 7 (Cross-Customer Order Read)**: Customer A attempts to read `/orders/{orderId}` belonging to Customer B.
   - *Expected Outcome*: PERMISSION_DENIED.
8. **Payload 8 (Terminal State Tamper)**: Client attempts to update an order with status `PAID` back to `PENDING`.
   - *Expected Outcome*: PERMISSION_DENIED (Terminal state lock).
9. **Payload 9 (Unverified Email Write)**: Attacker attempts to write with an unverified email token.
   - *Expected Outcome*: PERMISSION_DENIED (`email_verified == true` mandate).
10. **Payload 10 (Supplier Cost Leak)**: Customer attempts to query supplier cost price records.
    - *Expected Outcome*: PERMISSION_DENIED.
11. **Payload 11 (Oversized Description Attack)**: User attempts to inject a 5MB payload into a review field.
    - *Expected Outcome*: PERMISSION_DENIED (string size constraint).
12. **Payload 12 (Client Query Delegation Bypass)**: User executes blanket collection scan on `/orders` without user ID boundary.
    - *Expected Outcome*: PERMISSION_DENIED on rule-level query evaluation.
