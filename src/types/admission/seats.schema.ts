// ==========================================
// SEAT MANAGEMENT & ADMISSION SCHEMAS
// ==========================================

// 1. Categories directly matching your MongoDB 'quotas' object
export type AdmissionCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'OTHER';

// 2. Individual Quota Status
export interface QuotaDetail {
  capacity: number;
  blockedSeats: number; // Seats locked during application processing
  consumedSeats: number; // Seats officially enrolled
}

// 3. Main Seat Policy (Matches Backend SeatInventory)
export interface GradeSeatPolicy {
  id: string;              // Mapped from MongoDB _id
  schoolId?: string;
  academicYearId: string;  
  gradeId: string;         
  totalCapacity: number;   
  allowSpillover: boolean;
  quotas: Record<AdmissionCategory, QuotaDetail>;
  createdAt?: string;
  updatedAt?: string;
}
export type ReservationState = 'locked' | 'consumed' | 'released' | 'expired';

export interface SeatReservation {
  id: string;
  applicationId: string;
  studentName?: string;
  gradeId: string;
  academicYearId: string;
  category: AdmissionCategory;
  state: ReservationState;
  
  lockedAt: string;
  expiresAt?: string;
  consumedAt?: string;
}