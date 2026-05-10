import { z } from 'zod';

export const EnrollmentStatusEnum = z.enum(['ACTIVE', 'EXIT_PENDING', 'ALUMNI', 'ARCHIVED']);

export const StudentProfileSchema = z.object({
  id: z.string().uuid(),
  rollNumber: z.string(),
  admissionNumber: z.string(),
  
  // Demographics
  firstName: z.string(),
  lastName: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z.string(),
  
  // Academic Placement
  classId: z.string(),
  sectionId: z.string(),
  academicYearId: z.string(),
  
  // Contacts
  parentName: z.string(),
  parentPhone: z.string(),
  parentEmail: z.string().email().optional(),
  
  // Status Tracking
  status: EnrollmentStatusEnum.default('ACTIVE'),
  joinDate: z.string(),
});

export type EnrollmentStatus = z.infer<typeof EnrollmentStatusEnum>;
export type StudentProfile = z.infer<typeof StudentProfileSchema>;