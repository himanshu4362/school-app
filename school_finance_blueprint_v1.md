Backend Strategy: Use the "Database Entities" section to design your SQL tables or NoSQL collections. The relationships defined there ensure you won't have data corruption when students withdraw or fees change mid-year.

API Contract: The "Financial Events" section defines the logic your backend controllers must follow. Instead of just "saving a payment," your backend must "emit an event" that updates the ledger.

Frontend State: The "Redux Architecture" section mirrors what we will build next in your React code.

Summary of the "Hard Potential" we are building:
Immutable Truth: Once a fee receipt is generated or a payroll month is "Locked," the data is frozen. Any changes (refunds/arrears) happen as new transactions, preserving the audit trail.

Anti-Fraud Logic: The Cash Session logic ensures that the physical cash in the drawer must match the digital records, or the system flags it immediately.

Automated Governance: The Invoice Engine removes the need for manual data entry. On the 1st of every month, the system "bills" the students based on their assigned plans.

We are ready to start the implementation. Shall we begin by building the Fee Structure Engine (defining components and billing cycles) in the frontend?

Ledger Entities
TypeScript
interface JournalEntry {
  id: string;
  transactionId: string;
  accountId: string; // Linked to COA (Chart of Accounts)
  amount: number;
  direction: 'DEBIT' | 'CREDIT';
  timestamp: string;
}

interface FeeInvoice {
  id: string;
  studentId: string;
  academicYearId: string;
  dueDate: string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'VOID';
  items: {
    componentId: string;
    amount: number;
    concessionId?: string;
  }[];
}
4. Operational Workflows
I. Student Fee Collection (Front Office)
Search: Admin identifies student.

Ledger Lookup: System displays all FeeInvoices with UNPAID or PARTIAL status.

Allocation: If a parent pays a lump sum, the Allocation Engine applies the money to the oldest dues first (or based on priority: Fine > Tuition > Transport).

Finalization: * Ledger: DR Cash / CR Student Receivable.

Receipt: Branded PDF generated with unique UID.

II. Attendance-Linked Payroll
Event Scan: Payroll engine scans StaffAttendance logs.

Policy Application: Penalty rules (e.g., "3 Lates = 0.5 Day Pay-Cut") are calculated.

Freeze: The Payroll Run is created as a snapshot.

Correction: If attendance is corrected after the freeze, the difference is applied as Arrears in the next billing cycle.

5. Implementation Roadmap
Phase 1: The Master Data
Build the UI for defining Fee Components and Billing Cycles.

Set up the Chart of Accounts (The fundamental ledger categories).

Phase 2: Student Financial Identity
Link students to Fee Plans.

Develop the Invoice Generator to create monthly/termly dues.

Phase 3: The Collection Desk
Build the Cash Session UI.

Integrate Receipt Generation (PDF) and the Payment Allocation logic.

Phase 4: Payroll & Outflows
Connect Staff Attendance to the Payroll Run generator.

Build the Expense Tracker for infrastructure and vendor payouts.

6. Technical Integrity Guards
Concurrency: All seat/fee locks must happen server-side via transactions.

Authoritative Webhooks: Online payment success is only confirmed via Gateway Webhooks, never by the frontend UI.

Audit Trail: Every change to a transaction (void, edit) must be logged with userId and reason.