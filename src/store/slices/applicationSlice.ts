import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. Define the sub-types cleanly
export interface GuardianDraft {
  fullName: string;
  relation: 'father' | 'mother' | 'guardian' | 'other';
  mobile: string;
  email?: string;
  occupation?: string;
  isPrimaryContact?: boolean;
}

export interface StudentProfileDraft {
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  hasDisability: boolean;
}

// 2. Define the main state interface (Merged)
export interface DraftApplicationState {
  currentStep: number;
  studentProfile: StudentProfileDraft | null;
  admissionType: 'fresh' | 'transfer' | 're_admission' | null;
  selectedClassId: string | null;
  guardians: GuardianDraft[] | null;
  currentAddress: AddressDraft | null;
  permanentAddress: AddressDraft | null;
  academicHistory: AcademicHistoryDraft | null;
  documents: DocumentDraft[] | null;
}

export interface DocumentDraft {
  documentType: string;
  displayName: string;
  status: 'submitted' | 'pending' | 'not_applicable';
  documentNumber?: string;
  isMandatory: boolean;
}

export interface AddressDraft {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}
export interface AcademicHistoryDraft {
  schoolName: string;
  state: string;
  district: string;
  city: string;
  previousClass: string;
  hostelStatus: 'day_scholar' | 'hosteler';
  migrationReason?: string;
}

// 3. Set the initial state with correct values (No type syntax here)
const initialState: DraftApplicationState = {
  currentStep: 1,
  studentProfile: null,
  admissionType: null,
  selectedClassId: null,
  guardians: null,
  currentAddress: null,
  permanentAddress: null,
  academicHistory: null,
  documents: null,
};

// 4. Create the Slice
export const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    nextStep: (state) => { state.currentStep += 1; },
    prevStep: (state) => { state.currentStep -= 1; },
    setStep: (state, action: PayloadAction<number>) => { state.currentStep = action.payload; },
    
    // Save Step 1 Data
    saveStudentProfile: (state, action: PayloadAction<{
      profile: StudentProfileDraft;
      admissionType: 'fresh' | 'transfer' | 're_admission';
      selectedClassId: string;
    }>) => {
      state.studentProfile = action.payload.profile;
      state.admissionType = action.payload.admissionType;
      state.selectedClassId = action.payload.selectedClassId;
    },

    // Fixed: Moved saveGuardians INSIDE the reducers object
    saveGuardians: (state, action: PayloadAction<GuardianDraft[]>) => {
      state.guardians = action.payload;
    },
    saveAddress: (state, action: PayloadAction<{ current: AddressDraft; permanent: AddressDraft }>) => {
      state.currentAddress = action.payload.current;
      state.permanentAddress = action.payload.permanent;
    },
    saveAcademics: (state, action: PayloadAction<AcademicHistoryDraft | null>) => {
      state.academicHistory = action.payload;
    },
    saveDocuments: (state, action: PayloadAction<DocumentDraft[]>) => {
      state.documents = action.payload;
    },
    resetApplication: () => initialState,
  },
});

export const { 
  nextStep, 
  prevStep, 
  setStep, 
  saveStudentProfile, 
  saveGuardians, 
  resetApplication,
  saveAddress,
  saveDocuments,
  saveAcademics
} = applicationSlice.actions;

export default applicationSlice.reducer;