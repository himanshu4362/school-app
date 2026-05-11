import { z } from 'zod';

export const SubjectTypeEnum = z.enum(['THEORY', 'PRACTICAL', 'LAB', 'CO_SCHOLASTIC']);

export const SyllabusTopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  estimatedPeriods: z.number().int().positive().optional(),
});

export const SyllabusChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  topics: z.array(SyllabusTopicSchema),
});

export const SubjectSchema = z.object({
  id: z.string().uuid(),
  code: z.string(), // e.g., "PHY-101"
  name: z.string(), // e.g., "Physics"
  type: SubjectTypeEnum.default('THEORY'),
  chapters: z.array(SyllabusChapterSchema).default([]),
  description: z.string().optional(),
  // topics: z.array(z.object({
  //    id: z.string(),
  //    name: z.string()
  // })).default([])
});

export const ClassSyllabusSchema = z.object({
  id: z.string().uuid(),
  classId: z.string(),
  academicYearId: z.string(),
  subjectIds: z.array(z.string()), // Array of Subject IDs
});

// 2. FACULTY ALLOCATION DOMAIN
export const FacultyAllocationSchema = z.object({
  id: z.string().uuid(),
  facultyId: z.string(), // Links to HR Hub (Employee ID)
  subjectId: z.string(), // Links to Subject
  classId: z.string(),   // e.g., "Class 10"
  sectionId: z.string(), // e.g., "A"
  academicYearId: z.string(),
  periodsPerWeek: z.number().min(1).max(10),
});

export const DayOfWeekEnum = z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']);

export const TimetablePeriodSchema = z.object({
  id: z.string().uuid(),
  classId: z.string(),
  sectionId: z.string(),
  dayOfWeek: DayOfWeekEnum,
  periodNumber: z.number(),
  
  allocationId: z.string(),
  roomId: z.string().optional(),
});

export type Subject = z.infer<typeof SubjectSchema>;
export type ClassSyllabus = z.infer<typeof ClassSyllabusSchema>;
export type FacultyAllocation = z.infer<typeof FacultyAllocationSchema>;
export type TimetablePeriod = z.infer<typeof TimetablePeriodSchema>;
export type SyllabusChapter = z.infer<typeof SyllabusChapterSchema>;
export type SyllabusTopic = z.infer<typeof SyllabusTopicSchema>;