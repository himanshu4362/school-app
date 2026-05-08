import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdmissionCampaignDTO, AcademicClassDTO } from '../../types/admission/config.schema';

// --- MOCK V1 DATA ---
const INITIAL_CAMPAIGNS: AdmissionCampaignDTO[] = [
  { id: 'CAMP-2026-DEFAULT', name: 'Main Intake 2026', academicYear: '2026-2027', startsAt: '2026-01-01T00:00:00Z', endsAt: '2026-06-30T23:59:59Z', isActive: true }
];

const INITIAL_CLASSES: AcademicClassDTO[] = [
  { id: 'CLASS-1', name: 'Class 1', section: 'A', academicYear: '2026-2027', totalSeats: 40, occupiedSeats: 12, admissionOpen: true },
  { id: 'CLASS-6', name: 'Class 6', academicYear: '2026-2027', totalSeats: 60, occupiedSeats: 58, admissionOpen: true },
  { id: 'CLASS-9', name: 'Class 9', section: 'Science', academicYear: '2026-2027', totalSeats: 30, occupiedSeats: 30, admissionOpen: false }, // Full class
  { id: 'CLASS-11', name: 'Class 11', section: 'Commerce', academicYear: '2026-2027', totalSeats: 40, occupiedSeats: 5, admissionOpen: true },
];

interface ConfigState {
  campaigns: any[];
  classes: any[];
  documentRules: RequiredDocumentRule[]; // <-- ADD THIS
}

const INITIAL_RULES: RequiredDocumentRule[] = [
  { id: 'R1', documentType: 'birth_certificate', displayName: 'Birth Certificate', admissionType: 'all', isMandatory: true },
  { id: 'R2', documentType: 'aadhaar', displayName: 'Aadhaar Card (Parent/Child)', admissionType: 'all', isMandatory: true },
  { id: 'R3', documentType: 'transfer_certificate', displayName: 'Transfer Certificate (TC)', admissionType: 'transfer', isMandatory: true },
  { id: 'R4', documentType: 'marksheet', displayName: 'Previous Marksheet', admissionType: 'transfer', isMandatory: false },
  { id: 'R5', documentType: 'medical_certificate', displayName: 'Medical/Fitness Certificate', admissionType: 'all', isMandatory: false },
];

// Update your initialState
const initialState: ConfigState = {
  campaigns: INITIAL_CAMPAIGNS, // from previous step
  classes: INITIAL_CLASSES,     // from previous step
  documentRules: INITIAL_RULES, // <-- ADD THIS
};


export interface RequiredDocumentRule {
  id: string;
  documentType: 'aadhaar' | 'birth_certificate' | 'transfer_certificate' | 'marksheet' | 'medical_certificate' | 'caste_certificate';
  displayName: string;
  admissionType: 'fresh' | 'transfer' | 'all';
  isMandatory: boolean;
}

// Update your ConfigState interface to include documentRules


export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    addClass: (state, action: PayloadAction<AcademicClassDTO>) => {
      state.classes.push(action.payload);
    },
    toggleAdmissionStatus: (state, action: PayloadAction<string>) => {
      const cls = state.classes.find(c => c.id === action.payload);
      if (cls) cls.admissionOpen = !cls.admissionOpen;
    },
    toggleDocumentRequirement: (state, action: PayloadAction<string>) => {
      const rule = state.documentRules.find(r => r.id === action.payload);
      if (rule) rule.isMandatory = !rule.isMandatory;
    }
  },
});

export const { addClass, toggleAdmissionStatus, toggleDocumentRequirement} = configSlice.actions;
export default configSlice.reducer;