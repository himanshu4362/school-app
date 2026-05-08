// ============================================================================
// ENUMS & STRICT STATUSES
// ============================================================================
export type PipelineStage = 'lead' | 'assessment' | 'verification' | 'enrolled' | 'rejected';
export type DocumentTier = 'mandatory' | 'optional';
export type DocumentStatus = 'submitted' | 'pending' | 'refused' | 'not_applicable';
export type HostelStatus = 'hosteler' | 'day_scholar';

// ============================================================================
// COMPLIANCE DOCUMENT STRUCTURE (The Vault)
// ============================================================================
export interface AdmissionDocument {
  id: string;
  name: string; // e.g., "Aadhaar Card", "Transfer Certificate"
  tier: DocumentTier; // Mandatory docs cannot use "refused" status
  status: DocumentStatus;
  refusalReason?: string; // Captured if parent selects "Not want to share" (Tier 2 only)
  
  photoUrl?: string; // Image upload reference
  documentNumber?: string; // e.g., TC Number or Aadhaar Number
  
  isExpirable: boolean; // Tick button: "Is this document expirable?"
  expiryDate?: string; // Required if isExpirable is true (ISO String)
}

// ============================================================================
// MASTER STUDENT LEAD SCHEMA
// ============================================================================
export interface AdmissionLead {
  applicationId: string; // Unique ID (e.g., APP-2026-001)
  
  // --- PIPELINE METADATA ---
  stage: PipelineStage;
  dateAdded: string; // ISO String
  targetClass: string; // "in which class they come to got admission"

  // --- PHASE 1: CORE IDENTITY & CONTACT ---
  isFirstSchool: boolean; // "student of kinder garden or have not studied before"
  
  // Basic Details
  studentName: string;
  dob: string; // ISO String. (Note: Age is calculated dynamically on UI, NOT stored here)
  passportPhotoUrl?: string; // "passport size photo"
  hasDisability: boolean; // "option to check or uncheck the disability"
  
  // Parent/Guardian Details
  fatherName: string;
  motherName: string;
  guardianName?: string;
  parentOccupation: string;
  
  // Contact Information
  parentMobile: string; // Primary, strict validation
  parentEmail?: string;
  fullAddress: string;
  siblingsInfo?: string; // "ask about siblings"
  
  // Student Specific Contact (If they have it)
  studentMobile?: string; 
  studentEmail?: string;

  // --- PHASE 2: ACADEMIC HISTORY (Null if isFirstSchool === true) ---
  previousSchool?: string;
  previousState?: string;
  previousDistrict?: string;
  previousCity?: string;
  previousClass?: string;
  hostelStatus?: HostelStatus; // "was hostler or day schollar"
  migrationReason?: string; // "basic reason for migration from parent (casually ask)"

  // --- PHASE 3: ASSESSMENT & MERIT ---
  writtenTestPassed?: boolean;
  writtenTestMarks?: string; // "if yes then fill how much marks got"
  vivaPassed?: boolean;
  vivaMarks?: string; // "marks also"

  // --- PHASE 4: DOCUMENT VAULT ---
  documents: AdmissionDocument[];
}