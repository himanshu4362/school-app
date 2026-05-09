import { z } from 'zod';

export const LeaveTypeSchema = z.enum([
  'casual_leave',  // CL
  'sick_leave',    // SL
  'earned_leave',  // EL
  'maternity',     // ML
  'lwp'            // Leave Without Pay (Impacts Payroll)
]);

export const LeaveStatusSchema = z.enum(['pending', 'approved', 'rejected', 'cancelled']);

export const LeaveRequestSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string(),
  
  // Leave Parameters
  leaveType: LeaveTypeSchema,
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(),   // YYYY-MM-DD
  totalDays: z.number().min(0.5),
  reason: z.string().min(10, "A detailed reason is required for HR approval."),
  attachmentUrl: z.string().optional(), // E.g., Medical certificate for Sick Leave
  
  // Lifecycle
  status: LeaveStatusSchema.default('pending'),
  appliedAt: z.string().datetime(),
  
  // Audit Trail
  reviewedBy: z.string().optional(), // Admin ID
  reviewedAt: z.string().datetime().optional(),
  reviewerNote: z.string().optional(),
});

export type LeaveType = z.infer<typeof LeaveTypeSchema>;
export type LeaveStatus = z.infer<typeof LeaveStatusSchema>;
export type LeaveRequest = z.infer<typeof LeaveRequestSchema>;