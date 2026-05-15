import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. Define the sub-types cleanly
export interface GuardianDraft {
  fullName: string;
  relation: string; // 🟢 FIXED: Relaxed to string to prevent TS errors
  mobile: string;
  email?: string;
  occupation?: string;
  isPrimaryContact?: boolean;
}

export interface StudentProfileDraft {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string; // 🟢 FIXED: Relaxed to string to prevent the "gender issue"
  bloodGroup?: string;
  hasDisability: boolean;
}

// 2. Define the main state interface (Merged)
export interface DraftApplicationState {
  currentStep: number;
  studentProfile: StudentProfileDraft | null;
  admissionType: string; // Dynamic string
  selectedClassId: string | null;
  guardians: GuardianDraft[]; // SAFE ARRAY
  currentAddress: AddressDraft | null;
  permanentAddress: AddressDraft | null;
  academicHistory: AcademicHistoryDraft | null;
  documents: DocumentDraft[]; // SAFE ARRAY
}

export interface DocumentDraft {
  documentType: string;
  displayName: string;
  status: string; // 🟢 FIXED: Relaxed to string
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
  hostelStatus: string; // 🟢 FIXED: Relaxed to string
  migrationReason?: string;
}

// 3. Set the initial state with correct values
const initialState: DraftApplicationState = {
  currentStep: 1,
  studentProfile: null,
  admissionType: "",
  selectedClassId: null,
  guardians: [], 
  currentAddress: null,
  permanentAddress: null,
  academicHistory: null,
  documents: [], 
};

// 4. Create the Slice
export const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    nextStep: (state) => {
      state.currentStep = Math.max(1, state.currentStep + 1);
    },
    prevStep: (state) => {
      state.currentStep = Math.max(1, state.currentStep - 1);
    },
    setAdmissionType: (state, action: PayloadAction<string>) => {
      state.admissionType = action.payload;
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    saveStudentProfile: (state, action: PayloadAction<StudentProfileDraft>) => {
      state.studentProfile = action.payload;
    },
    saveGuardians: (state, action: PayloadAction<GuardianDraft[]>) => {
      state.guardians = action.payload;
    },
    saveAddress: (
      state,
      action: PayloadAction<{ current: AddressDraft; permanent: AddressDraft }>,
    ) => {
      state.currentAddress = action.payload.current;
      state.permanentAddress = action.payload.permanent;
    },
    saveAcademics: (
      state,
      action: PayloadAction<AcademicHistoryDraft | null>,
    ) => {
      state.academicHistory = action.payload;
    },
    setSelectedClassId: (state, action: PayloadAction<string>) => {
      state.selectedClassId = action.payload;
    },
    saveDocuments: (state, action: PayloadAction<DocumentDraft[]>) => {
      state.documents = action.payload;
    },
    resetApplication: () => initialState,
    initializeFromLead: (
      state,
      action: PayloadAction<{
        classId: string;
        parentName: string;
        mobile: string;
      }>,
    ) => {
      state.currentStep = 1;
      state.selectedClassId = action.payload.classId;
      state.guardians = [
        {
          relation: "father",
          fullName: action.payload.parentName,
          mobile: action.payload.mobile,
          isPrimaryContact: true,
        },
      ];
    },
  },
});

export const {
  nextStep,
  prevStep,
  setStep,
  setAdmissionType,
  setSelectedClassId,
  saveStudentProfile,
  saveGuardians,
  saveAddress,
  saveAcademics,
  saveDocuments,
  resetApplication,
  initializeFromLead,
} = applicationSlice.actions;

export default applicationSlice.reducer;