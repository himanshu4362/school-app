import { z } from 'zod';

// 1. FINANCIAL ENUMS
export const BillingCycleEnum = z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']);
export const FeeComponentTypeEnum = z.enum(['TUITION', 'TRANSPORT', 'HOSTEL', 'EXAM', 'LIBRARY', 'LATE_FINE', 'OTHER']);
export const FinanceOperationalStatus = z.enum(['active', 'archived']);

// 2. FEE COMPONENT SCHEMA (The Building Blocks of a Bill)
export const FeeComponentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Component name must be at least 2 characters."), // e.g., "Class 10 Tuition Fee"
  type: FeeComponentTypeEnum,
  
  // The default monetary value
  defaultAmount: z.number().min(0, "Amount cannot be negative."),
  
  billingCycle: BillingCycleEnum,
  
  // Accounting Rules
  isTaxable: z.boolean().default(false),
  isRefundable: z.boolean().default(false),
  
  status: FinanceOperationalStatus.default('active'),
});

export const InvoiceStatusEnum = z.enum(['DRAFT', 'UNPAID', 'PARTIAL', 'PAID', 'VOID']);
// The Snapshot of the fee at the time of billing
export const InvoiceItemSchema = z.object({
  id: z.string().uuid(),
  componentId: z.string(), 
  name: z.string(),        
  amount: z.number(),      
  isTaxable: z.boolean()
});
export const ConcessionSchema = z.object({
  amount: z.number().min(1),
  reason: z.string(), // e.g., "Staff Child Discount" or "Sports Scholarship"
  approvedBy: z.string(), // Admin ID who authorized it
  appliedAt: z.string()
});

export const FeeInvoiceSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().min(1, "Student ID is required"),
  academicYearId: z.string(),
  
  invoiceNumber: z.string(), 
  issueDate: z.string(),
  dueDate: z.string(),
  
  status: InvoiceStatusEnum.default('UNPAID'),
  
  items: z.array(InvoiceItemSchema).min(1, "Invoice must have at least one item"),
  
  subTotal: z.number(),
  concession: ConcessionSchema.nullable().default(null),
  totalAmount: z.number(),
  amountPaid: z.number().default(0), 
});

export const PaymentMethodEnum = z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']);
export const SessionStatusEnum = z.enum(['OPEN', 'CLOSED', 'RECONCILED']);

// The actual payment transaction
export const PaymentTransactionSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  studentId: z.string(),
  sessionId: z.string().uuid().nullable(), // Null if paid online directly by parent
  
  amount: z.number().min(1, "Payment amount must be greater than zero"),
  method: PaymentMethodEnum,
  
  // Auditing details
  paidBy: z.string(), // e.g., "Rajesh Sharma (Father)"
  bankReference: z.string().optional(), // e.g., UPI Transaction ID
  
  paymentDate: z.string(),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']).default('SUCCESS'),
});

export const CashSessionSchema = z.object({
  id: z.string().uuid(),
  openedByUserId: z.string(), // The Admin who opened the till
  openedAt: z.string(),
  closedAt: z.string().nullable().default(null),
  
  status: SessionStatusEnum.default('OPEN'),
  
  // The Reconciliation Math
  openingBalance: z.number().default(0),
  expectedCash: z.number().default(0), // Calculated by the system
  declaredCash: z.number().nullable().default(null), // Physically counted by the Admin
  variance: z.number().nullable().default(null), // Declared - Expected
});

export const PayrollStatusEnum = z.enum(['DRAFT', 'APPROVED', 'DISBURSED']);

// The rules for paying a specific designation or staff member
export const SalaryComponentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), // e.g., "Housing Allowance" or "Provident Fund"
  type: z.enum(['ALLOWANCE', 'DEDUCTION']),
  amount: z.number().min(0),
});

export const SalaryStructureSchema = z.object({
  id: z.string().uuid(),
  staffId: z.string(), // Links to the HR Faculty/Staff ID
  baseSalary: z.number().min(0),
  components: z.array(SalaryComponentSchema),
});

// The Immutable Monthly Salary Slip
export const PayrollRecordSchema = z.object({
  id: z.string().uuid(),
  staffId: z.string(),
  monthYear: z.string(), // e.g., "2026-05"
  
  // Snapshotted Financials
  baseSalary: z.number(),
  totalAllowances: z.number(),
  totalDeductions: z.number(),
  
  // Operational Link
  attendancePenalty: z.number().default(0), // Calculated from late/absent logs
  
  // Final Math
  netPayable: z.number(),
  
  status: PayrollStatusEnum.default('DRAFT'),
  generatedAt: z.string(),
  approvedAt: z.string().nullable().default(null),
});

export const ExpenseCategoryEnum = z.enum([
  'PAYROLL', 'UTILITIES', 'INFRASTRUCTURE', 'VENDOR', 'REFUND', 'MISC'
]);

export const ExpenseTransactionSchema = z.object({
  id: z.string().uuid(),
  category: ExpenseCategoryEnum,
  
  // Who are we paying?
  paidTo: z.string(), // e.g., "Ravi Verma" or "Jharkhand Electricity Board"
  referenceId: z.string().nullable(), // Links to PayrollRun ID or Vendor Invoice No.
  
  amount: z.number().min(1, "Expense must be greater than zero"),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI']),
  
  bankReference: z.string().optional(), // e.g., NEFT Txn ID
  expenseDate: z.string(),
  
  description: z.string(), // e.g., "May 2026 Salary" or "Generator Diesel"
  
  status: z.enum(['PENDING', 'CLEARED', 'REJECTED']).default('CLEARED'),
  recordedByUserId: z.string(), // Admin who logged it
});



export type ExpenseTransaction = z.infer<typeof ExpenseTransactionSchema>;
export type SalaryComponent = z.infer<typeof SalaryComponentSchema>;
export type SalaryStructure = z.infer<typeof SalaryStructureSchema>;
export type PayrollRecord = z.infer<typeof PayrollRecordSchema>;
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;
export type CashSession = z.infer<typeof CashSessionSchema>;
export type FeeComponent = z.infer<typeof FeeComponentSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type Concession = z.infer<typeof ConcessionSchema>;
export type FeeInvoice = z.infer<typeof FeeInvoiceSchema>;