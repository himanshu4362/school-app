import { z } from 'zod';

// ==========================================
// 1. EXIT TAXONOMY & DURABLE STATES
// ==========================================
export const ExitTypeEnum = z.enum(['GRADUATION', 'TRANSFER_OUT', 'DROPOUT', 'EXPULSION']);

// Notice EXIT_COMPLETED is removed; it's a transient action now.
export const ExitStatusEnum = z.enum([
  'EXIT_INITIATED', 
  'EXIT_PENDING', 
  'CLEARANCE_PENDING', 
  'FINANCE_SETTLEMENT_PENDING', 
  'DOCUMENT_ISSUANCE_PENDING', 
  'ALUMNI',   // Durable State
  'ARCHIVED'  // Durable State
]);

export const ClearanceStatusEnum = z.enum(['PENDING', 'CLEARED', 'REJECTED', 'WAIVED']);

// ==========================================
// 2. STATEFUL CLEARANCE MATRIX
// ==========================================
export const ExitClearanceItemSchema = z.object({
  department: z.enum(['LIBRARY', 'SPORTS', 'LAB', 'TRANSPORT', 'HOSTEL', 'IT', 'FINANCE']),
  status: ClearanceStatusEnum.default('PENDING'),
  clearedBy: z.string().nullable(), // Admin/Principal ID
  clearedAt: z.string().datetime().nullable(),
  remarks: z.string().optional(), // Mandatory if WAIVED or REJECTED
});

// ==========================================
// 3. OUTBOUND DOCUMENT VAULT (Immutable & Versioned)
// ==========================================
export const OutboundDocumentSchema = z.object({
  id: z.string().uuid(),
  documentType: z.enum(['TRANSFER_CERTIFICATE', 'MIGRATION', 'CHARACTER_CERT', 'MARKSHEET', 'UPLOADED_PHYSICAL']),
  documentName: z.string(), // e.g., "Signed TC Scan", "Class 10 Original Marksheet"
  serialNumber: z.string(), 
  issuedAt: z.string(), 
  issuedBy: z.string(),
  
  version: z.number().default(1),
  isDuplicate: z.boolean().default(false),
  watermarkText: z.string().nullable(), 
  
  fileUrl: z.string().url(), // This will hold the uploaded photo URL
});

// ==========================================
// 4. FINANCIAL SETTLEMENT INTENT
// ==========================================
export const RefundIntentSchema = z.object({
  id: z.string().uuid(),
  cautionMoneyTotal: z.number(),
  damageDeductions: z.number().default(0),
  netRefundable: z.number(),
  status: z.enum(['PENDING', 'PROCESSED', 'FAILED', 'REVERSED']).default('PENDING'),
  remarks: z.string().optional(),
});

// ==========================================
// 5. THE MASTER EXIT RECORD
// ==========================================
export const StudentExitRecordSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string(),
  academicYearId: z.string(),
  
  exitType: ExitTypeEnum,
  initiatedOn: z.string().datetime(),
  effectiveExitDate: z.string(), // YYYY-MM-DD
  
  // Core State
  status: ExitStatusEnum.default('EXIT_INITIATED'),
  
  // Cross-Departmental Dependencies
  clearanceMatrix: z.array(ExitClearanceItemSchema),
  refundIntent: RefundIntentSchema.nullable().default(null),
  
  // Document Vault
  issuedDocuments: z.array(OutboundDocumentSchema).default([]),
  
  // Board/Exam Migration Locks (Future Expansion)
  boardRegistrationReleased: z.boolean().default(false),
  
  // Audit Trail
  initiatedBy: z.string(),
  parentRequestUrl: z.string().url().optional(), // Legal authorization
  expulsionLegalNotes: z.string().optional(), // Strict principal-only field
});

export type ExitType = z.infer<typeof ExitTypeEnum>;
export type ExitStatus = z.infer<typeof ExitStatusEnum>;
export type ExitClearanceItem = z.infer<typeof ExitClearanceItemSchema>;
export type OutboundDocument = z.infer<typeof OutboundDocumentSchema>;
export type StudentExitRecord = z.infer<typeof StudentExitRecordSchema>;