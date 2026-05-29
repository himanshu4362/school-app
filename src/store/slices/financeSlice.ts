import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FeeComponent,
  FeeInvoice,
  PaymentTransaction,
  SalaryStructure,
  PayrollRecord,
  ExpenseTransaction,
  CashSession,
} from "../../types/finance/finance.schema";

export interface FinanceValidationError {
  field?: string;
  message: string;
  severity: "error" | "warning";
}

interface FinanceState {
  feeComponents: Record<string, FeeComponent>;
  invoices: Record<string, FeeInvoice>;
  transactions: Record<string, PaymentTransaction>;
  sessions: Record<string, CashSession>;
  salaryStructures: Record<string, SalaryStructure>;
  expenses: Record<string, ExpenseTransaction>;
  payrollRuns: Record<string, PayrollRecord>;
  activeSessionId: string | null;
  validationErrors: FinanceValidationError[];
}
const initialState: FinanceState = {
  feeComponents: {},
  invoices: {},
  transactions: {},
  sessions: {},

  salaryStructures: {},
  payrollRuns: {},

  expenses: {},

  activeSessionId: null,
  validationErrors: [],
};
export const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    clearFinanceErrors: (state) => {
      state.validationErrors = [];
    },
    // 1. FEE COMPONENT UPSERT ENGINE
    upsertFeeComponent: (state, action: PayloadAction<FeeComponent>) => {
      const newComponent = action.payload;
      state.validationErrors = [];
      const isDuplicate = Object.values(state.feeComponents).some(
        (comp) =>
          comp.id !== newComponent.id &&
          comp.name.toUpperCase() === newComponent.name.toUpperCase() &&
          comp.status === "active",
      );
      if (isDuplicate) {
        state.validationErrors.push({
          field: "name",
          message: `A Fee Component named '${newComponent.name}' already exists.`,
          severity: "error",
        });
        return;
      }
      state.feeComponents[newComponent.id] = newComponent;
    },

    archiveFeeComponent: (state, action: PayloadAction<string>) => {
      const componentId = action.payload;
      const component = state.feeComponents[componentId];
      if (component) component.status = "archived";
    },

    generateStudentInvoice: (state, action: PayloadAction<FeeInvoice>) => {
      const newInvoice = action.payload;
      const calculatedTotal = newInvoice.items.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const secureInvoice: FeeInvoice = {
        ...newInvoice,
        subTotal: calculatedTotal,
        totalAmount: calculatedTotal,
        amountPaid: 0,
        status: "UNPAID",
      };

      state.invoices[secureInvoice.id] = secureInvoice;
    },

    extendInvoiceDueDate: (
      state,
      action: PayloadAction<{ invoiceId: string; newDueDate: string }>,
    ) => {
      const { invoiceId, newDueDate } = action.payload;

      // Find the invoice in the ledger
      const invoice = Object.values(state.invoices).find(
        (inv) => inv.id === invoiceId || inv.invoiceNumber === invoiceId,
      );

      // Only allow extensions on unpaid or partial invoices
      if (
        invoice &&
        (invoice.status === "UNPAID" || invoice.status === "PARTIAL")
      ) {
        invoice.dueDate = newDueDate;
      }
    },

    openCashSession: (
      state,
      action: PayloadAction<{ adminId: string; openingBalance: number }>,
    ) => {
      if (state.activeSessionId) {
        state.validationErrors.push({
          message: "A cash session is already open at this desk.",
          severity: "error",
        });
        return;
      }

      const newSession: CashSession = {
        id: crypto.randomUUID(),
        openedByUserId: action.payload.adminId,
        openedAt: new Date().toISOString(),
        closedAt: null,
        status: "OPEN",
        openingBalance: action.payload.openingBalance,
        expectedCash: action.payload.openingBalance,
        declaredCash: null,
        variance: null,
      };

      state.sessions[newSession.id] = newSession;
      state.activeSessionId = newSession.id;
    },

    closeCashSession: (
      state,
      action: PayloadAction<{ declaredCash: number }>,
    ) => {
      if (!state.activeSessionId) return;

      const session = state.sessions[state.activeSessionId];
      session.closedAt = new Date().toISOString();
      session.declaredCash = action.payload.declaredCash;
      session.variance = session.declaredCash - session.expectedCash;
      session.status = "CLOSED";

      state.activeSessionId = null; // Desk is now locked
    },

    recordPayment: (state, action: PayloadAction<PaymentTransaction>) => {
      const payment = action.payload;
      const invoice = state.invoices[payment.invoiceId];

      if (!invoice) return;

      // 1. Record the Transaction in the ledger
      state.transactions[payment.id] = payment;

      // 2. Allocate funds to the Invoice
      invoice.amountPaid += payment.amount;

      // 3. Update Invoice Status dynamically
      if (invoice.amountPaid >= invoice.totalAmount) {
        invoice.status = "PAID";
        invoice.amountPaid = invoice.totalAmount; // Prevent over-crediting in UI
      } else {
        invoice.status = "PARTIAL";
      }

      // 4. The Anti-Fraud Link: If paid in CASH, update the active session's expected total
      if (
        payment.method === "CASH" &&
        state.activeSessionId &&
        payment.sessionId === state.activeSessionId
      ) {
        state.sessions[state.activeSessionId].expectedCash += payment.amount;
      }
    },
    upsertSalaryStructure: (state, action: PayloadAction<SalaryStructure>) => {
      state.salaryStructures[action.payload.staffId] = action.payload; // One structure per staff
    },

    generateDraftPayroll: (
      state,
      action: PayloadAction<{
        staffId: string;
        monthYear: string;
        finalAllowances: number;
        finalDeductions: number;
        finalPenalty: number;
      }>,
    ) => {
      const {
        staffId,
        monthYear,
        finalAllowances,
        finalDeductions,
        finalPenalty,
      } = action.payload;
      const structure = state.salaryStructures[staffId];

      if (!structure) {
        state.validationErrors.push({
          message: `No Salary Structure found for Staff ID: ${staffId}`,
          severity: "error",
        });
        return;
      }

      // Net Pay = (Base + Allowances) - (Standard Deductions + Late/Absent Penalties)
      const netPayable =
        structure.baseSalary +
        finalAllowances -
        (finalDeductions + finalPenalty);

      const newPayrollRun: PayrollRecord = {
        id: crypto.randomUUID(),
        staffId,
        monthYear,
        baseSalary: structure.baseSalary,
        totalAllowances: finalAllowances,
        totalDeductions: finalDeductions,
        attendancePenalty: finalPenalty,
        netPayable,
        status: "DRAFT",
        generatedAt: new Date().toISOString(),
        approvedAt: null,
      };

      state.payrollRuns[`${staffId}_${monthYear}`] = newPayrollRun;
    },

    approvePayrollRun: (state, action: PayloadAction<string>) => {
      const recordId = action.payload;
      const record = Object.values(state.payrollRuns).find(
        (r) => r.id === recordId,
      );
      if (record && record.status === "DRAFT") {
        record.status = "APPROVED";
        record.approvedAt = new Date().toISOString();
      }
    },
    recordExpense: (state, action: PayloadAction<ExpenseTransaction>) => {
      const expense = action.payload;
      state.expenses[expense.id] = expense;

      // ANTI-FRAUD: If cash is used from the Front Desk for an expense, deduct it from the active session.
      if (expense.method === "CASH" && state.activeSessionId) {
        state.sessions[state.activeSessionId].expectedCash -= expense.amount;
      }
    },
    disbursePayrollRun: (
      state,
      action: PayloadAction<{
        payrollRunId: string;
        bankReference: string;
        adminId: string;
        staffName: string;
      }>,
    ) => {
      const { payrollRunId, bankReference, adminId, staffName } =
        action.payload;

      const payrollRun = Object.values(state.payrollRuns).find(
        (r) => r.id === payrollRunId,
      );

      // We can only pay out APPROVED payrolls that haven't been disbursed yet.
      if (payrollRun && payrollRun.status === "APPROVED") {
        // 1. Generate the official Expense Transaction
        const newExpense: ExpenseTransaction = {
          id: `EXP-PAY-${Date.now()}`,
          category: "PAYROLL",
          paidTo: staffName,
          referenceId: payrollRun.id,
          amount: payrollRun.netPayable,
          method: "BANK_TRANSFER",
          bankReference: bankReference,
          expenseDate: new Date().toISOString(),
          description: `Salary Payout: ${payrollRun.monthYear}`,
          status: "CLEARED",
          recordedByUserId: adminId,
        };

        // 2. Save it to the Outflow Ledger
        state.expenses[newExpense.id] = newExpense;

        // 3. Update the Payroll status to fully disbursed
        payrollRun.status = "DISBURSED";
      }
    },
    // ==========================================
    // 🔴 NEW: CONCESSION & SCHOLARSHIP ENGINE
    // ==========================================
    applyInvoiceConcession: (state, action: PayloadAction<{ invoiceId: string; amount: number; reason: string; adminId: string }>) => {
      const { invoiceId, amount, reason, adminId } = action.payload;
      
      const invoice = Object.values(state.invoices).find(inv => inv.id === invoiceId || inv.invoiceNumber === invoiceId);
      
      if (!invoice) return;

      // SECURITY GUARD 1: Cannot apply concession if already paid
      if (invoice.status === 'PAID') {
        state.validationErrors.push({ message: "Cannot apply a concession to an already settled invoice.", severity: 'error' });
        return;
      }

      // SECURITY GUARD 2: Concession cannot be greater than the subtotal
      if (amount > invoice.subTotal) {
        state.validationErrors.push({ message: "Concession amount cannot exceed the invoice subtotal.", severity: 'error' });
        return;
      }

      // Apply the Credit Note
      invoice.concession = {
        amount,
        reason,
        approvedBy: adminId,
        appliedAt: new Date().toISOString()
      };

      // Recalculate the Final Payable Amount
      invoice.totalAmount = invoice.subTotal - amount;

      // Automatically fix the status if the concession makes the bill ₹0
      if (invoice.totalAmount === 0) {
        invoice.status = 'PAID';
      } else if (invoice.amountPaid > 0 && invoice.amountPaid >= invoice.totalAmount) {
        invoice.status = 'PAID';
      }
    },
  },
});

export const {
  clearFinanceErrors,
  upsertFeeComponent,
  archiveFeeComponent,
  generateStudentInvoice,
  extendInvoiceDueDate,
  applyInvoiceConcession,
  openCashSession,
  closeCashSession,
  recordPayment,
  recordExpense,
  disbursePayrollRun,
  upsertSalaryStructure,
  generateDraftPayroll,
  approvePayrollRun,
} = financeSlice.actions;
export default financeSlice.reducer;
