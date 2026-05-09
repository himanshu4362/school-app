import { z } from 'zod';
import { OperationalStatus } from '../core/systemConfig.schema';

// ==========================================
// 1. THE QUOTA & POLICY ENGINE
// ==========================================
export const SeatQuotaSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), // e.g., "RTE", "General", "Staff"
  reservedSeats: z.number().min(0),
  isSpilloverAllowed: z.boolean().default(false), // E.g., Unused staff seats become General
});

export const GradeSeatPolicySchema = z.object({
  id: z.string().uuid(),
  academicYearId: z.string(),
  gradeId: z.string(),
  
  // FIX 2: Quotas are now a dynamic array, not hardcoded keys
  quotas: z.array(SeatQuotaSchema).default([]),
  
  // FIX 1: totalCapacity is intentionally absent here. It will be derived.
  status: OperationalStatus.default('draft'),
});

// ==========================================
// 2. THE ESCROW & RESERVATION ENGINE
// ==========================================
// FIX 5: Added 'waitlisted' state
export const ReservationState = z.enum([
  'reserved',   // Soft-lock pending payment
  'expired',    // Lock window passed, seat returned to pool
  'consumed',   // Payment cleared, student officially admitted
  'released',   // Manually cancelled by Admin/Parent
  'waitlisted'  // No seats available currently
]);

export const SeatReservationSchema = z.object({
  id: z.string().uuid(),
  studentApplicationId: z.string(), // Links to the Admissions Application
  
  academicYearId: z.string(),
  gradeId: z.string(),
  quotaId: z.string().optional(), // Nullable if they applied General and we have no quotas
  
  state: ReservationState.default('reserved'),
  
  // FIX 4: Expiry Engine for Ghost Reservations
  reservedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(), // Nullable if waitlisted/consumed
  consumedAt: z.string().datetime().optional(), 
});

export type SeatQuota = z.infer<typeof SeatQuotaSchema>;
export type GradeSeatPolicy = z.infer<typeof GradeSeatPolicySchema>;
export type SeatReservation = z.infer<typeof SeatReservationSchema>;