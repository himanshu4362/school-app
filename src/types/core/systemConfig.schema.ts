import { z } from 'zod';

// SHARED LIFECYCLES (Fix 5: Semantic Clarity)
export const OperationalStatus = z.enum(['draft', 'active', 'inactive', 'archived']);
export const AcademicLifecycle = z.enum(['draft', 'active', 'sunsetting', 'closed', 'archived']);

// ==========================================
// 1. ACADEMIC YEAR
// ==========================================
export const AcademicYearSchema = z.object({
  id: z.string(), // REMOVED .uuid()
  name: z.string(), // 🟢 MUST BE 'name', NOT 'code'
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean()
});


// 2 & 3. ORGANIZATION (Dept & Designation)
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

// 4. INFRASTRUCTURE (Room Engine)
export const RoomSchema = z.object({
  id: z.string().uuid(),
  roomNumber: z.string(), 
  building: z.string(),
  capacity: z.number().min(1),
  roomType: z.enum(['classroom', 'laboratory', 'auditorium', 'staff_room', 'library', 'computer_lab']),
  status: OperationalStatus.default('draft'),
});

// 5 & 6. ACADEMIC HIERARCHY (Grade & Section)
export const GradeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), 
  level: z.number(),
  minAge: z.number(),
  maxAge: z.number(),
  admissionOpen: z.boolean(),
  status: OperationalStatus.default('draft'),
});

export const SectionSchema = z.object({
  id: z.string(),
  academicYearId: z.string(), 
  gradeId: z.string(),
  name: z.string(), 
  roomId: z.string().optional(),
  classTeacherId: z.string().optional(), 
  targetCapacity: z.number().min(1).default(40),
  status: z.enum(['draft', 'active', 'closed']).default('draft'), // Assuming AcademicLifecycle
});

// 7 & 8. THE SUBJECT MATRIX
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

export type AcademicYear = z.infer<typeof AcademicYearSchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type Designation = z.infer<typeof DesignationSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Grade = z.infer<typeof GradeSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type CurriculumSubject = z.infer<typeof CurriculumSubjectSchema>;