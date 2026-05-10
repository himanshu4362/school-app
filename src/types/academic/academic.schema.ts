import { z } from 'zod';

// ==========================================
// 1. SUBJECT DOMAIN
// ==========================================
export const SubjectTypeEnum = z.enum(['THEORY', 'PRACTICAL', 'LAB', 'CO_SCHOLASTIC']);

export const SubjectSchema = z.object({
  id: z.string().uuid(),
  code: z.string(), // e.g., "PHY-101"
  name: z.string(), // e.g., "Physics"
  type: SubjectTypeEnum.default('THEORY'),
  description: z.string().optional(),
});

// Maps which subjects belong to which Class (e.g., Class 10 has Physics, Chem, Math)
export const ClassSyllabusSchema = z.object({
  id: z.string().uuid(),
  classId: z.string(),
  academicYearId: z.string(),
  subjectIds: z.array(z.string()), // Array of Subject IDs
});

// ==========================================
// 2. FACULTY ALLOCATION DOMAIN
// ==========================================
export const FacultyAllocationSchema = z.object({
  id: z.string().uuid(),
  facultyId: z.string(), // Links to HR Hub (Employee ID)
  subjectId: z.string(), // Links to Subject
  classId: z.string(),   // e.g., "Class 10"
  sectionId: z.string(), // e.g., "A"
  academicYearId: z.string(),
  
  // Guardrail: How many periods per week is this teacher assigned for this specific class?
  periodsPerWeek: z.number().min(1).max(10),
});

// ==========================================
// 3. TIMETABLE DOMAIN (Preparation for Strike 3)
// ==========================================
export const DayOfWeekEnum = z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']);

export const TimetablePeriodSchema = z.object({
  id: z.string().uuid(),
  classId: z.string(),
  sectionId: z.string(),
  dayOfWeek: DayOfWeekEnum,
  periodNumber: z.number(), // 1 through 8
  
  allocationId: z.string(), // Maps directly to FacultyAllocation (tells us Teacher + Subject)
  roomId: z.string().optional(), // e.g., "Lab 3"
});

export type Subject = z.infer<typeof SubjectSchema>;
export type ClassSyllabus = z.infer<typeof ClassSyllabusSchema>;
export type FacultyAllocation = z.infer<typeof FacultyAllocationSchema>;
export type TimetablePeriod = z.infer<typeof TimetablePeriodSchema>;