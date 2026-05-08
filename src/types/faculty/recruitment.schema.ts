import { z } from 'zod';

// --- ENUMS: The Strict State Machines ---
export const VacancyReasonSchema = z.enum(['replacement', 'new_section', 'expansion']);
export const UrgencySchema = z.enum(['low', 'medium', 'critical']);
export const JobStatusSchema = z.enum(['open', 'paused', 'filled', 'cancelled', 'on_hold']);
export const CandidateSourceSchema = z.enum(['referral', 'linkedin', 'walk_in', 'consultancy', 'website']);
export const VerificationStatusSchema = z.enum(['pending', 'verified', 'flagged', 'not_required']);

// 🚦 THE V1 CORE PIPELINE STATES 
export const PipelineStateSchema = z.enum([
  'applied', 
  'shortlisted', 
  'demo_scheduled', 
  'interviewing', 
  'offer_processing', 
  'hired_pending_conversion', 
  'talent_pool'
]);

// --- DOMAIN ENTITIES ---

// 1. Requisition: The Authorization to Hire
export const HiringRequisitionSchema = z.object({
  id: z.string().uuid().optional(),
  departmentId: z.string().uuid("Department is required"),
  requestedBy: z.string().uuid("Requestor ID required"), // e.g., HOD ID
  approvedBy: z.string().uuid().optional(), // Principal ID (Null until approved)
  vacancyReason: VacancyReasonSchema,
  urgency: UrgencySchema,
});

// 2. Job Posting: The Active Vacancy
export const JobPostingSchema = z.object({
  id: z.string().uuid().optional(),
  requisitionId: z.string().uuid(),
  status: JobStatusSchema.default('open'),
  targetRole: z.string().min(2, "Role title required"), // e.g., "PGT Physics"
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
});

// 3. Candidate Profile: The Core Applicant Record
export const CandidateProfileSchema = z.object({
  id: z.string().optional(),
  jobId: z.string().uuid("Must be linked to a Job Posting"),
  
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.string().email("Valid email required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
  
  source: CandidateSourceSchema,
  expectedSalary: z.number().min(0).optional(),
  offeredSalarySnapshot: z.number().min(0).optional(), // Immutable once offered
  resumeUrl: z.string().optional(),
  
  pipelineState: PipelineStateSchema.default('applied'),
});

// 4. Evaluation Round: For Demos and Interviews
export const EvaluationRoundSchema = z.object({
  id: z.string().uuid().optional(),
  candidateId: z.string(),
  roundType: z.enum(['hr_screen', 'demo_class', 'management_interview']),
  scheduledDate: z.string(), // ISO Date
  interviewerId: z.string().uuid("Interviewer assignment required"),
  feedbackScore: z.number().min(1).max(5).optional(),
  remarks: z.string().optional(),
});

// Infer TypeScript Types
export type HiringRequisitionDTO = z.infer<typeof HiringRequisitionSchema>;
export type JobPostingDTO = z.infer<typeof JobPostingSchema>;
export type CandidateProfileDTO = z.infer<typeof CandidateProfileSchema>;
export type EvaluationRoundDTO = z.infer<typeof EvaluationRoundSchema>;