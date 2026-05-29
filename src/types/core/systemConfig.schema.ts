import { z } from 'zod';

// ─── Shared Enums ────────────────────────────────────
export const OperationalStatus = z.enum(['draft', 'active', 'inactive', 'archived']);

// ─── Academic Year ───────────────────────────────────
export const AcademicYearSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
});

// ─── Grade ───────────────────────────────────────────
export const GradeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  level: z.number().min(0),
  admissionOpen: z.boolean(),
});

// ─── Room ────────────────────────────────────────────
// Matches backend enum exactly
export type RoomType =
  | 'STANDARD_CLASSROOM'
  | 'LABORATORY'
  | 'AUDITORIUM'
  | 'LIBRARY'
  | 'SMART_CLASS'
  | 'SPORTS_FACILITY'
  | 'OTHER';

export const RoomSchema = z.object({
  id: z.string(),
  roomNumber: z.string().min(1),
  building: z.string().optional(),
  capacity: z.number().min(1),
  roomType: z.string(),
});

// ─── Section ─────────────────────────────────────────
export const SectionSchema = z.object({
  id: z.string(),
  academicYearId: z.string(),
  gradeId: z.string(),
  name: z.string().min(1),
  roomId: z.string(),
  classTeacherId: z.string().optional(),
  targetCapacity: z.number().min(1).default(40),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

// ─── Seat Inventory ──────────────────────────────────
export const QuotaStatsSchema = z.object({
  capacity: z.number().min(0),
  blockedSeats: z.number().min(0).default(0),
  consumedSeats: z.number().min(0).default(0),
});

export const SeatInventorySchema = z.object({
  id: z.string(),
  academicYearId: z.string(),
  gradeId: z.string(),
  totalCapacity: z.number(),
  quotas: z.record(z.string(), QuotaStatsSchema),
  allowSpillover: z.boolean().default(true),
});

// ─── Department (client-only, no backend yet) ────────
export const DepartmentSchema = z.object({
  id: z.string(),
  code: z.string().min(2),
  name: z.string(),
  status: OperationalStatus.default('draft'),
});

// ─── Designation (client-only, no backend yet) ───────
export const DesignationSchema = z.object({
  id: z.string(),
  title: z.string(),
  departmentId: z.string().optional(),
  hierarchyLevel: z.number(),
  status: OperationalStatus.default('draft'),
});

// ─── Subject (client-only, no backend yet) ───────────
export const SubjectSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: OperationalStatus.default('draft'),
});

// ─── Curriculum Subject ──────────────────────────────
export const CurriculumSubjectSchema = z.object({
  id: z.string(),
  academicYearId: z.string(),
  subjectId: z.string(),
  gradeId: z.string(),
  departmentId: z.string(),
  type: z.enum(['core', 'elective', 'practical']),
  weeklyPeriods: z.number().min(1).default(5),
  status: OperationalStatus.default('draft'),
});

// ─── Inferred Types ──────────────────────────────────
export type AcademicYear = z.infer<typeof AcademicYearSchema>;
export type Grade = z.infer<typeof GradeSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type QuotaStats = z.infer<typeof QuotaStatsSchema>;
export type SeatInventory = z.infer<typeof SeatInventorySchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type Designation = z.infer<typeof DesignationSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type CurriculumSubject = z.infer<typeof CurriculumSubjectSchema>;