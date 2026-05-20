# 🏛️ ERP: Financial System Backend Architecture
**Version:** 1.0.0
**Module:** Accounts & Finance (Inflows, Outflows, Payroll, POS)
**Architecture Style:** Event-Driven, Double-Entry Ledger System

---

## 1. System Overview
This is a high-security financial ERP. It does not use "mutable" debt counters. Instead, it relies on an **Event-Driven Ledger**. 
* **Receivables** are mathematically derived from `FeeInvoice` objects.
* **Inflows** are immutable `PaymentTransaction` events.
* **Outflows** are immutable `ExpenseTransaction` events.
* **Cash POS** is strictly governed by `CashSession` shifts to prevent front-desk skimming.

---

## 2. Database Models (Entity Relationships)

### A. The Master Catalog
**`FeeComponent`** (The billing rules)
* `id` (UUID, Primary Key)
* `name` (String, Unique)
* `defaultAmount` (Decimal)
* `billingCycle` (Enum: MONTHLY, TERMLY, YEARLY, ONE_TIME)
* `isTaxable`, `isRefundable` (Boolean)
* `status` (Enum: active, archived)

### B. Accounts Receivable (The Billing Engine)
**`FeeInvoice`** (The frozen snapshot of dues)
* `id` (UUID, Primary Key)
* `studentId` (UUID, Foreign Key)
* `invoiceNumber` (String, Unique, Auto-increment e.g., INV-2026-0001)
* `issueDate`, `dueDate` (Date)
* `items` (JSON Array of `{ name, amount }`)
* `subTotal` (Decimal)
* `concession` (JSON Object `{ amount, reason, approvedBy }` - Nullable)
* `totalAmount` (Decimal - Calculated as subTotal minus concession)
* `amountPaid` (Decimal)
* `status` (Enum: DRAFT, UNPAID, PARTIAL, PAID, VOID)

### C. The Cash Desk & Front Office Governance
**`CashSession`** (Anti-fraud till management)
* `id` (UUID, Primary Key)
* `openedByUserId` (UUID, Foreign Key)
* `openedAt`, `closedAt` (Timestamp)
* `openingBalance` (Decimal - Float provided at morning)
* `expectedCash` (Decimal - System calculated)
* `declaredCash` (Decimal - Physically counted at night)
* `status` (Enum: OPEN, CLOSED, RECONCILED)

### D. The Revenue Ledger (Inflows)
**`PaymentTransaction`** (Money entering the school)
* `id` (UUID, Primary Key)
* `invoiceId` (UUID, Foreign Key)
* `studentId` (UUID, Foreign Key)
* `sessionId` (UUID, Foreign Key - Nullable for online payments)
* `amount` (Decimal)
* `method` (Enum: CASH, UPI, CARD, BANK_TRANSFER)
* `paidBy` (String)
* `bankReference` (String - Nullable)
* `status` (Enum: PENDING, SUCCESS, FAILED)

### E. The Payroll & Outflow Ledger (Expenses)
**`SalaryStructure`** (Fixed pay parameters)
* `id` (UUID)
* `staffId` (UUID, Foreign Key)
* `baseSalary` (Decimal)
* `components` (JSON Array of `{ type: ALLOWANCE/DEDUCTION, amount }`)

**`PayrollRecord`** (Monthly Salary Slip)
* `id` (UUID)
* `staffId` (UUID)
* `monthYear` (String, e.g., "2026-05")
* `netPayable` (Decimal)
* `attendancePenalty` (Decimal)
* `status` (Enum: DRAFT, APPROVED, DISBURSED)

**`ExpenseTransaction`** (Money leaving the school)
* `id` (UUID, Primary Key)
* `category` (Enum: PAYROLL, UTILITIES, VENDOR, REFUND, MISC)
* `paidTo` (String)
* `referenceId` (UUID - Links to PayrollRecord ID or Vendor Bill ID)
* `amount` (Decimal)
* `method` (Enum: CASH, BANK_TRANSFER, CHEQUE)
* `status` (Enum: CLEARED, PENDING)

---

## 3. Required REST API Endpoints

###   3.1 Cash Desk (POS) APIs
* `POST /api/v1/finance/sessions/open`
  * **Payload:** `{ openingBalance: 1000 }`
  * **Logic:** Fails if the user already has an `OPEN` session.
* `POST /api/v1/finance/sessions/:sessionId/close`
  * **Payload:** `{ declaredCash: 5000 }`
  * **Logic:** Calculates variance (`declaredCash` - `expectedCash`), updates status to `CLOSED`.

###   3.2 Billing & Concessions
* `POST /api/v1/finance/invoices/generate`
  * **Payload:** `studentId`, array of `componentIds`, `dueDate`.
  * **Logic:** Backend fetches component prices from DB (do NOT trust frontend prices). Calculates `subTotal` and creates `UNPAID` invoice.
* `POST /api/v1/finance/invoices/:invoiceId/concession`
  * **Payload:** `{ amount: 2000, reason: "Merit Scholarship" }`
  * **Guards:** Fails if invoice is already `PAID`. Fails if amount > `subTotal`. Updates `totalAmount` and sets to `PAID` if remaining due is 0.

###   3.3 Payments (Inflows)
* `POST /api/v1/finance/payments`
  * **Payload:** `{ invoiceId, amount, method, bankReference, sessionId? }`
  * **Transactions (Must be ACID compliant):**
    1. Insert into `PaymentTransaction`.
    2. Update `FeeInvoice.amountPaid`. If `amountPaid >= totalAmount`, set status to `PAID`.
    3. **CRITICAL:** If method is `CASH`, look up the `sessionId` and increment `expectedCash` by `amount`.

###   3.4 Payroll & Disbursements (Outflows)
* `POST /api/v1/finance/payroll/draft`
  * **Payload:** `{ staffId, monthYear, finalAllowances, finalDeductions, finalPenalty }`
  * **Logic:** Generates/Updates the `DRAFT` record for that specific month.
* `PUT /api/v1/finance/payroll/:payrollId/approve`
  * **Logic:** Locks the record. Status changes to `APPROVED`.
* `POST /api/v1/finance/expenses/disburse-salary`
  * **Payload:** `{ payrollId, bankReference }`
  * **Transactions:**
    1. Set Payroll record to `DISBURSED`.
    2. Generate an `ExpenseTransaction` categorized as `PAYROLL` mapped to the `payrollId`.

###   3.5 Executive Aggregations (Read-Only)
* `GET /api/v1/finance/dashboard`
  * **Returns:** Highly optimized aggregation query (SUM of all SUCCESS payments, SUM of all CLEARED expenses, SUM of UNPAID invoices). *Hint: Use SQL Views or MongoDB Aggregation Pipelines to prevent heavy load on the frontend.*

---

## 4. Automated Background Jobs (Cron)
The backend must run these automated tasks via a task queue (e.g., Celery, BullMQ, Node-Cron):

1. **Auto-Invoicing (Runs 1st of every month at 00:01):** Looks up all active students and their assigned `FeeComponents` (e.g., Monthly Tuition) and auto-generates their `FeeInvoice` for the month.
2. **Late Fee Generator (Runs Daily at 00:01):** Scans all `UNPAID` or `PARTIAL` invoices where `dueDate < TODAY`. Automatically appends a new `InvoiceItem` called "Late Fine" and increases the `totalAmount`.