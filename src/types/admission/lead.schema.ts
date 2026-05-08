// src/types/admission/lead.schema.ts
import { z } from 'zod';

export const EnquirySourceSchema = z.enum(['walk_in', 'website', 'referral', 'social_media', 'campaign', 'other']);
export const LeadStatusSchema = z.enum(['new', 'contacted', 'follow_up', 'converted', 'closed']);

export const AdmissionLeadSchema = z.object({
  id: z.string().optional(),
  campaignId: z.string().min(1, "Campaign ID is required"), 
  parentName: z.string().min(2, "Parent name is required").max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit mobile number starting with 6-9"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  interestedClassId: z.string().min(1, "Please select a class").optional(),   
  source: EnquirySourceSchema,
  status: LeadStatusSchema,
  remarks: z.string().max(500, "Remarks too long").optional(),
  assignedToId: z.string().optional(),
});

export type AdmissionLeadDTO = z.infer<typeof AdmissionLeadSchema>;