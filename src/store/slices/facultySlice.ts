import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FacultyDraftState {
  currentStep: number;
  identity: any | null;
  academic: any | null;
  employment: any | null;
  academicAllocation: any | null;
  payroll: any | null;
  documents: any[] | null;
  accessConfig: any | null;
}

interface FacultyState {
  onboardingDraft: FacultyDraftState;
  directory: any[]; // List of all hired teachers
}

const initialDraftState: FacultyDraftState = {
  currentStep: 1,
  identity: null,
  academic: null,
  employment: null,
  academicAllocation: null,
  payroll: null,
  documents: null,
  accessConfig: null,
};

const initialState: FacultyState = {
  onboardingDraft: initialDraftState,
  directory: [], // Will hold completed profiles
};

export const facultySlice = createSlice({
  name: "faculty",
  initialState,
  reducers: {
    // Navigation
    nextFacultyStep: (state) => {
      state.onboardingDraft.currentStep = Math.max(
        1,
        state.onboardingDraft.currentStep + 1,
      );
    },
    prevFacultyStep: (state) => {
      state.onboardingDraft.currentStep = Math.max(
        1,
        state.onboardingDraft.currentStep - 1,
      );
    },
    setFacultyStep: (state, action: PayloadAction<number>) => {
      state.onboardingDraft.currentStep = action.payload;
    },

    // Save Step Data
    saveIdentity: (state, action: PayloadAction<any>) => {
      state.onboardingDraft.identity = action.payload;
    },
    saveAcademic: (state, action: PayloadAction<any>) => {
      state.onboardingDraft.academic = action.payload;
    },
    saveEmployment: (state, action: PayloadAction<any>) => {
      state.onboardingDraft.employment = action.payload;
    },
    saveAllocation: (state, action: PayloadAction<any>) => {
      state.onboardingDraft.academicAllocation = action.payload;
    },
    savePayroll: (state, action: PayloadAction<any>) => {
      state.onboardingDraft.payroll = action.payload;
    },
    resetOnboarding: (state) => {
      state.onboardingDraft = initialDraftState;
    },
    saveVault: (state, action: PayloadAction<any>) => { state.onboardingDraft.documents = action.payload; },
    
    // 1. Save the final step data
    saveAccess: (state, action: PayloadAction<any>) => { state.onboardingDraft.accessConfig = action.payload; },
    
    // 2. MASTER COMMIT: Move draft to the official directory
    completeOnboarding: (state) => {
      const newFacultyMember = {
        id: crypto.randomUUID(),
        ...state.onboardingDraft.identity,
        ...state.onboardingDraft.employment,
        ...state.onboardingDraft.academic,
        ...state.onboardingDraft.academicAllocation,
        ...state.onboardingDraft.payroll,
        documents: state.onboardingDraft.documents,
        access: state.onboardingDraft.accessConfig,
        hiredAt: new Date().toISOString(),
      };
      
      state.directory.push(newFacultyMember);
      state.onboardingDraft = initialDraftState; // Reset the wizard for the next hire
    },
  },
  
});

export const {
  nextFacultyStep,
  prevFacultyStep,
  setFacultyStep,
  saveIdentity,
  saveAcademic,
  saveEmployment,
  savePayroll,
  resetOnboarding,
  saveAllocation,
  saveVault,
  saveAccess,
  completeOnboarding
} = facultySlice.actions;

export default facultySlice.reducer;
