import { z } from 'zod';

// ==========================================
// 1. UNIVERSAL IDENTITY ENGINE
// ==========================================
export const BorrowerTypeEnum = z.enum(['STUDENT', 'FACULTY', 'STAFF', 'GUEST', 'AUDITOR']);
export const BorrowingStatusEnum = z.enum(['ACTIVE', 'SUSPENDED', 'BLACKLISTED']);

export const BorrowerProfileSchema = z.object({
  id: z.string().uuid(),
  borrowerType: BorrowerTypeEnum,
  linkedEntityId: z.string(), // Links to Student ID, Staff ID, etc.
  status: BorrowingStatusEnum.default('ACTIVE'),
  maxBooksAllowed: z.number(),
  maxDaysAllowed: z.number(),
  finePerDay: z.number(),
  totalPendingFines: z.number().default(0),
});

// ==========================================
// 2. THE CATALOG DOMAIN (Metadata Only)
// ==========================================
export const ResourceTypeEnum = z.enum(['PHYSICAL_BOOK', 'EBOOK', 'JOURNAL', 'PDF', 'QUESTION_BANK']);

export const MasterTitleSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  thumbnailUrl: z.string().url().optional(),
  author: z.string(),
  publisher: z.string().optional(),
  publicationYear: z.number().optional(),
  edition: z.string().optional(),
  isbn: z.string().optional(),
  
  resourceType: ResourceTypeEnum.default('PHYSICAL_BOOK'),
  category: z.string(), // e.g., "Physics", "Fiction"
  tags: z.array(z.string()).default([]), // For OPAC Search Indexing
});

// ==========================================
// 3. THE CIRCULATION DOMAIN (Physical Inventory)
// ==========================================
export const CopyStatusEnum = z.enum([
  'AVAILABLE', 
  'RESERVED', 
  'ISSUED', 
  'LOST', 
  'WITHDRAWN',      // Soft Delete: Torn/Destroyed
  'DECOMMISSIONED'  // Soft Delete: Sold/Donated
]);

export const PhysicalCopySchema = z.object({
  id: z.string().uuid(),
  titleId: z.string().uuid(), // Links to MasterTitle
  libraryId: z.string(),      // Multi-Branch Future-Proofing
  
  accessionNumber: z.string(), // The Barcode (e.g., ACC-5001)
  status: CopyStatusEnum.default('AVAILABLE'),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']).default('GOOD'),
  
  procurementInvoiceId: z.string().optional(), // Hooks to Finance Hub
});

// ==========================================
// 4. THE FIFO RESERVATION QUEUE
// ==========================================
export const ReservationItemSchema = z.object({
  id: z.string().uuid(),
  titleId: z.string().uuid(),
  borrowerId: z.string().uuid(),
  requestedAt: z.string().datetime(),
  
  // Expiry Engine (Populated only when a copy becomes available for them)
  assignedCopyId: z.string().uuid().nullable().default(null),
  expiresAt: z.string().datetime().nullable().default(null),
});

// ==========================================
// 5. THE IMMUTABLE TRANSACTION LEDGER
// ==========================================
export const TransactionTypeEnum = z.enum([
  'ISSUE', 'RETURN', 'RENEW', 'LOST_DECLARED', 'FINE_APPLIED', 'FINE_WAIVED', 'RESERVED', 'RESERVATION_CANCELLED'
]);

export const LibraryTransactionSchema = z.object({
  id: z.string().uuid(),
  copyId: z.string().uuid().nullable(), // Nullable for title-level reservations
  borrowerId: z.string().uuid(),
  type: TransactionTypeEnum,
  timestamp: z.string().datetime(),
  
  // 🔴 THE SNAPSHOT LAW (Immutable Policy Freeze)
  dueDateSnapshot: z.string().datetime().nullable().default(null),
  finePolicySnapshot: z.number().nullable().default(null),
  
  operatorId: z.string(), // Librarian/Admin who processed it
  remarks: z.string().optional(),
});

// Types Export
export type BorrowerProfile = z.infer<typeof BorrowerProfileSchema>;
export type MasterTitle = z.infer<typeof MasterTitleSchema>;
export type PhysicalCopy = z.infer<typeof PhysicalCopySchema>;
export type ReservationItem = z.infer<typeof ReservationItemSchema>;
export type LibraryTransaction = z.infer<typeof LibraryTransactionSchema>;