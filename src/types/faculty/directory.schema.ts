import { z } from 'zod';

// Status Enums as per Locked Design
export const EmployeeStatusSchema = z.enum(['active', 'on_leave', 'probation', 'suspended', 'terminated', 'inactive']);
export const WorkloadStatusSchema = z.enum(['balanced', 'high_load', 'critical', 'underutilized', 'unassigned']);

export const FacultyEmployeeSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().min(3),
  profilePhoto: z.string().url().optional(),
  fullName: z.string(),

  // Organizational
  departmentId: z.string(),
  designationId: z.string(),
  primarySubject: z.string(),

  // Lifecycle
  joiningDate: z.string(), // ISO Date
  employmentType: z.string(),
  status: EmployeeStatusSchema.default('active'),
  workloadStatus: WorkloadStatusSchema.default('unassigned'),

  // Contact
  mobile: z.string(),
  email: z.string().email(),

  // Academic Deployment (Derived from Step 4)
  activeClasses: z.array(z.string()), 
  assignedSubjects: z.array(z.string()),

  // Compliance (Snapshots)
  vaultStatus: z.enum(['verified', 'pending', 'alert']),
  
  createdAt: z.string(),
});

export type FacultyEmployee = z.infer<typeof FacultyEmployeeSchema>;