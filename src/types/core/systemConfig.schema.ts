import { z } from 'zod';

// ==========================================
// SHARED LIFECYCLES (Fix 5: Semantic Clarity)
// ==========================================
export const OperationalStatus = z.enum(['draft', 'active', 'inactive', 'archived']);
export const AcademicLifecycle = z.enum(['draft', 'active', 'sunsetting', 'closed', 'archived']);

// ==========================================
// 1. ACADEMIC YEAR
// ==========================================
export const AcademicYearSchema = z.object({
  id: z.string().uuid(),
  code: z.string(), 
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  status: z.enum(['draft', 'active', 'closed', 'archived']), 
});

// ==========================================
// 2 & 3. ORGANIZATION (Dept & Designation)
// ==========================================
export const DepartmentSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2), // Unique Code
  name: z.string(),
  hodId: z.string().optional(), // Nullable to prevent circular dependency
  budget: z.number().default(0), // Restored for Payroll/Resource planning
  status: OperationalStatus.default('draft'),
});

export const DesignationSchema = z.object({
  id: z.string().uuid(),
  title: z.string(), 
  departmentId: z.string().optional(), 
  hierarchyLevel: z.number(), 
  status: OperationalStatus.default('draft'),
});

// ==========================================
// 4. INFRASTRUCTURE (Room Engine)
// ==========================================
export const RoomSchema = z.object({
  id: z.string().uuid(),
  roomNumber: z.string(), 
  buildingWing: z.string(),
  capacity: z.number().min(1),
  roomType: z.enum(['classroom', 'laboratory', 'auditorium', 'staff_room', 'library', 'computer_lab']),
  status: OperationalStatus.default('draft'),
});

// ==========================================
// 5 & 6. ACADEMIC HIERARCHY (Grade & Section)
// ==========================================
export const GradeSchema = z.object({
  id: z.string().uuid(),
  level: z.number(), // V1 assumption. V2 will use academicLevelType (Nursery vs High School)
  name: z.string(), 
  status: OperationalStatus.default('draft'),
});

export const SectionSchema = z.object({
  id: z.string().uuid(),
  academicYearId: z.string(), 
  gradeId: z.string(),
  name: z.string(), 
  roomId: z.string().optional(),
  classTeacherId: z.string().optional(), 
  maxCapacity: z.number().min(1).default(40),
  status: AcademicLifecycle.default('draft'),
});

// ==========================================
// 7 & 8. THE SUBJECT MATRIX
// ==========================================
export const SubjectSchema = z.object({
  id: z.string().uuid(),
  code: z.string(), // Unique Code
  name: z.string(),
  status: OperationalStatus.default('draft'),
});

export const CurriculumSubjectSchema = z.object({
  id: z.string().uuid(),
  academicYearId: z.string(), 
  subjectId: z.string(),
  gradeId: z.string(),
  departmentId: z.string(), 
  type: z.enum(['core', 'elective', 'practical']),
  weeklyPeriods: z.number().min(1).default(5), 
  status: OperationalStatus.default('draft'),
});

// Type Exports
export type AcademicYear = z.infer<typeof AcademicYearSchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type Designation = z.infer<typeof DesignationSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Grade = z.infer<typeof GradeSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type CurriculumSubject = z.infer<typeof CurriculumSubjectSchema>;