import { z } from 'zod';

export const AdmissionCampaignSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Campaign name is required"), // e.g., "Winter Intake 2026"
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Must be in format YYYY-YYYY"),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().default(false),
});

export const AcademicClassSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Class name is required"), // e.g., "Class 6"
  section: z.string().optional(),
  academicYear: z.string(),
  
  // Seat Management
  totalSeats: z.number().int().min(1, "Must have at least 1 seat"),
  occupiedSeats: z.number().int().min(0).default(0),
  
  admissionOpen: z.boolean().default(true),
});

export type AdmissionCampaignDTO = z.infer<typeof AdmissionCampaignSchema>;
export type AcademicClassDTO = z.infer<typeof AcademicClassSchema>;