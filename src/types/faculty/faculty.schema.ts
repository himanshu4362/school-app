import { z } from "zod";

// --- ENUMS (Normalized Entities) ---
export const EmploymentTypeSchema = z.enum([
  "full_time",
  "part_time",
  "contract",
  "probation",
]);
export const MaritalStatusSchema = z.enum([
  "single",
  "married",
  "divorced",
  "widowed",
]);
export const FacultyRoleSchema = z.enum([
  "teacher",
  "hod",
  "coordinator",
  "principal",
  "librarian",
]);
export const DocumentStatusSchema = z.enum([
  "pending",
  "verified",
  "rejected",
  "expired",
]);

// --- STEP-BY-STEP SCHEMAS ---

// Step 1: Identity & KYC
export const FacultyIdentitySchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  dob: z.string(), // ISO Date
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().optional(),
  maritalStatus: MaritalStatusSchema,
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
  email: z.string().email("Valid email required"),
  emergencyContactName: z.string().min(2, "Emergency contact name required"),
  emergencyContactMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
  address: z.string().min(5, "Full address required"),
});

// Step 2: Academic & Professional
export const FacultyAcademicSchema = z.object({
  highestQualification: z.string().min(2, "Highest qualification required"),
  certifications: z.string().optional(),
  yearsOfExperience: z.number().min(0),
  previousInstitution: z.string().optional(),
  subjectExpertise: z
    .array(z.string())
    .min(1, "At least one subject expertise is required"),
  languagesKnown: z.array(z.string()).optional(),
});

// Step 3: Employment Profile
export const FacultyEmploymentSchema = z.object({
  employeeId: z.string().min(3, "Employee ID required"),
  departmentId: z.string().min(1, "Department selection required"),
  designationId: z.string().min(1, "Designation selection required"),
  employmentType: EmploymentTypeSchema,
  joiningDate: z.string(),
  probationEndDate: z.string().optional(),
  reportingManagerId: z.string().optional(),
  workShift: z.enum(["morning", "general", "evening"]),
});

// Step 5: Payroll & Banking (Skipping Step 4 Academic Alloc for later specific mapping)
export const FacultyPayrollSchema = z.object({
  baseSalary: z.number().min(1, "Base salary required"),
  bankName: z.string().min(2, "Bank name required"),
  accountNumber: z.string().min(5, "Account number required"),
  ifscCode: z.string().min(5, "IFSC required"),
  panNumber: z.string().optional(), // Standardized tax ID
  uanNumber: z.string().optional(), // Provident Fund ID
});
export const FacultyAllocationSchema = z.object({
  isClassTeacher: z.boolean().default(false),
  classTeacherSectionId: z.string().optional(), // e.g., "Class 10-A"

  // Array of subjects they are assigned to teach
  teachingAssignments: z
    .array(
      z.object({
        classId: z.string().min(1, "Class selection required"),
        subject: z.string().min(1, "Subject selection required"),
      }),
    )
    .min(1, "You must assign at least one teaching class/subject"),
});

export const FacultyVaultSchema = z.object({
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Must be a valid 12-digit Aadhaar number"),
  isAadhaarVerified: z.boolean().default(false),

  hasProfilePhotoUploaded: z
    .boolean()
    .refine((val) => val === true, "Profile photo is mandatory"),
  hasDegreeUploaded: z
    .boolean()
    .refine((val) => val === true, "Highest Degree Certificate is mandatory"),
  hasExperienceLetterUploaded: z.boolean().optional(),
  hasResumeUploaded: z
    .boolean()
    .refine((val) => val === true, "Resume is mandatory"),
  additionalDocuments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(2, "Document name is required"),
        isUploaded: z.boolean(),
        isPhysicallyVerified: z.boolean(),
      }),
    )
    .default([]),
});

// Step 7: System Access & RBAC
export const FacultyAccessSchema = z.object({
  username: z.string().min(4, "Username must be at least 4 characters"),
  password: z.string().min(8, "Temporary password must be at least 8 characters"),
  systemRole: z.enum(['teacher', 'hod', 'coordinator', 'principal', 'hr_admin']),
  isAccountActive: z.boolean().default(true),
  sendWelcomeEmail: z.boolean().default(true),
});

export type FacultyAccessDTO = z.infer<typeof FacultyAccessSchema>;
export type FacultyAllocationDTO = z.infer<typeof FacultyAllocationSchema>;
export type FacultyIdentityDTO = z.infer<typeof FacultyIdentitySchema>;
export type FacultyAcademicDTO = z.infer<typeof FacultyAcademicSchema>;
export type FacultyEmploymentDTO = z.infer<typeof FacultyEmploymentSchema>;
export type FacultyPayrollDTO = z.infer<typeof FacultyPayrollSchema>;
export type FacultyVaultDTO = z.infer<typeof FacultyVaultSchema>;
