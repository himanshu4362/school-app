import { z } from 'zod';

// ==========================================
// 1. SEPARATION ENUMS & STATES
// ==========================================
export const SeparationReasonEnum = z.enum([
  'RESIGNATION', 'TERMINATION', 'ABSCONDED', 'CONTRACT_END', 'MEDICAL', 'MUTUAL'
]);

// The Locked Enterprise State Machine
export const SeparationStatusEnum = z.enum([
  'SEPARATION_INITIATED', 
  'NOTICE_PERIOD', 
  'CLEARANCE_PENDING', 
  'FNF_PENDING_APPROVAL', 
  'FNF_APPROVED', 
  'DISBURSED', 
  'SEPARATED', 
  'ARCHIVED'
]);

// Clearances are no longer simple checkboxes
export const ClearanceStatusEnum = z.enum(['PENDING', 'CLEARED', 'REJECTED', 'ESCALATED']);

// ==========================================
// 2. THE STATEFUL CLEARANCE MATRIX
// ==========================================
export const ClearanceItemSchema = z.object({
  department: z.enum(['IT', 'LIBRARY', 'ACADEMICS', 'FINANCE', 'HR']),
  status: ClearanceStatusEnum.default('PENDING'),
  clearedBy: z.string().nullable(), // Admin ID tracking
  clearedAt: z.string().nullable(),
  remarks: z.string().optional(), // Mandatory if Rejected or Escalated
});

// ==========================================
// 3. FULL & FINAL (FnF) SNAPSHOT
// ==========================================
export const FnFDeductionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().min(1),
  reason: z.string(), // e.g., "Unserved Notice Period", "Damaged Laptop"
  remarks: z.string(), // Mandatory audit trail for evidence
});

export const FnFDetailsSchema = z.object({
  proRataSalary: z.number(),
  leaveEncashment: z.number().default(0),
  deductions: z.array(FnFDeductionSchema).default([]),
  netPayable: z.number(),
  generatedAt: z.string(),
  approvedBy: z.string().nullable(), // Principal's signature
});

// ==========================================
// 4. THE MASTER SEPARATION RECORD
// ==========================================
export const SeparationRecordSchema = z.object({
  id: z.string().uuid(),
  staffId: z.string(),
  
  reason: SeparationReasonEnum,
  initiatedOn: z.string(),
  lastWorkingDay: z.string(),
  
  // Security Guardrail (Smart Access Matrix)
  accessRevokedAt: z.string().nullable(),
  
  // State Tracking
  status: SeparationStatusEnum.default('SEPARATION_INITIATED'),
  
  // Cross-Departmental Matrix
  clearanceMatrix: z.array(ClearanceItemSchema),
  
  // Financial Hook
  fnfDetails: FnFDetailsSchema.nullable().default(null),
  
  // Audit Trail
  initiatedBy: z.string(),
});

export type SeparationReason = z.infer<typeof SeparationReasonEnum>;
export type SeparationStatus = z.infer<typeof SeparationStatusEnum>;
export type ClearanceItem = z.infer<typeof ClearanceItemSchema>;
export type FnFDeduction = z.infer<typeof FnFDeductionSchema>;
export type SeparationRecord = z.infer<typeof SeparationRecordSchema>;