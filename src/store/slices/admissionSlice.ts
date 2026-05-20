import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ==========================================
// 1. SIMPLE & SAFE TYPES (No Strict Enums)
// ==========================================

export interface LeadDraft {
  id?: string;
  _id?: string;
  parentName: string;
  studentName?: string;
  mobile: string;
  email?: string;
  interestedClassId?: string | { _id: string; name: string };
  source: string;
  status: string;
  notes?: string;
}

export interface GuardianDraft {
  fullName: string;
  relation: string;
  mobile: string;
  email?: string;
  occupation?: string;
  isPrimaryContact?: boolean;
}

export interface DocumentDraft {
  documentType: string;
  displayName: string;
  status: string;
  documentNumber?: string;
  isMandatory: boolean;
  fileKey?: string;
}

export interface ApplicationDraft {
  currentStep: number;

  // Step 1: Identity
  admissionType: string;
  selectedClassId: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  hasDisability: boolean;
  profilePhotoKey: string;
  category: string;
  nationality: string;
  religion: string;
  allergies: string;
  medicalSeverity: string;
  disabilityType: string;
  chronicConditions: string;
  medication: string;
  emergencyAction: string;

  guardians: GuardianDraft[];

  currentAddressLine1: string;
  currentAddressCity: string;
  currentAddressDistrict: string
  currentAddressState: string;
  currentAddressPincode: string;
  nationalId: string;
  permanentAddressLine1: string;
  permanentAddressCity: string;
  permanentAddressDistrict: string;
  permanentAddressState: string;
  permanentAddressPincode: string;
  isSameAsCurrent: boolean;

  previousSchoolName: string;
  previousClass: string;
  hostelStatus: string;
  migrationReason: string;
  previousSchoolBoard: string;
  previousSchoolTcNumber: string;
  previousSchoolAddressLine1: string;
  previousSchoolCity: string;
  previousSchoolDistrict: string;
  previousSchoolState: string;
  previousSchoolPincode: string;

  documents: DocumentDraft[];
}

// ==========================================
// 2. MAIN STATE INTERFACE
// ==========================================

export interface AdmissionState {
  statusFilter: string | "ALL";
  leads: LeadDraft[];
  searchQuery: string;
  classFilter: string | "ALL";
  selectedLeadId: string | null;
  isLeadDrawerOpen: boolean;
  applications: any[];
  selectedApplicationId: string | null;
  wizardDraft: ApplicationDraft;
}

// ==========================================
// 3. SAFE INITIAL STATE (No Null Arrays)
// ==========================================

const emptyWizardDraft: ApplicationDraft = {
  currentStep: 1,
  admissionType: "",
  selectedClassId: "",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  profilePhotoKey: "",
  category: "GENERAL",
  nationality: "Indian",
  religion: "",
  allergies: "",
  disabilityType: "",
  chronicConditions: "",
  medication: "",
  emergencyAction: "",
  medicalSeverity: "LOW",
  bloodGroup: "",
  hasDisability: false,
  guardians: [],
  currentAddressLine1: "",
  currentAddressCity: "",
  nationalId: "",
  currentAddressDistrict: "",
  permanentAddressDistrict: "",
  currentAddressState: "",
  currentAddressPincode: "",
  permanentAddressLine1: "",
  permanentAddressCity: "",
  permanentAddressState: "",
  permanentAddressPincode: "",
  isSameAsCurrent: true,
  
  previousSchoolName: "",
  previousClass: "",
  previousSchoolBoard: "",
  previousSchoolTcNumber: "",
  previousSchoolAddressLine1: "",
  previousSchoolCity: "",
  previousSchoolDistrict: "",
  previousSchoolState: "",
  previousSchoolPincode: "",
  hostelStatus: "day_scholar",

  migrationReason: "",
  documents: [],
};

const initialState: AdmissionState = {
  leads: [],
  searchQuery: "",
  statusFilter: "ALL",
  classFilter: "ALL",
  selectedLeadId: null,
  isLeadDrawerOpen: false,

  applications: [],
  selectedApplicationId: null,

  wizardDraft: emptyWizardDraft,
};

// ==========================================
// 4. THE SLICE (The Engine)
// ==========================================

export const admissionSlice = createSlice({
  name: "admission",
  initialState,
  reducers: {
    // --- LEAD ACTIONS ---
    setLeads: (state, action: PayloadAction<LeadDraft[]>) => {
      state.leads = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setClassFilter: (state, action: PayloadAction<string>) => {
      state.classFilter = action.payload;
    },
    openLeadDrawer: (state, action: PayloadAction<string | null>) => {
      state.selectedLeadId = action.payload;
      state.isLeadDrawerOpen = true;
    },
    closeLeadDrawer: (state) => {
      state.selectedLeadId = null;
      state.isLeadDrawerOpen = false;
    },
    addLead: (state, action: PayloadAction<LeadDraft>) => {
      state.leads.unshift(action.payload);
    },
    updateLeadInStore: (state, action: PayloadAction<LeadDraft>) => {
      const index = state.leads.findIndex(
        (l) => (l.id || l._id) === (action.payload.id || action.payload._id),
      );
      if (index !== -1) {
        state.leads[index] = action.payload;
      }
    },

    // --- APPLICATION DESK ACTIONS ---
    setApplications: (state, action: PayloadAction<any[]>) => {
      state.applications = action.payload;
    },
    updateApplicationStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>,
    ) => {
      const index = state.applications.findIndex(
        (a) => a._id === action.payload.id,
      );
      if (index !== -1) {
        state.applications[index].status = action.payload.status;
      }
    },

    // --- WIZARD ACTIONS (Flattened & Bulletproof) ---
    nextWizardStep: (state) => {
      state.wizardDraft.currentStep = Math.max(
        1,
        state.wizardDraft.currentStep + 1,
      );

      //   THE MAGIC SKIP: If step 4 (Academics) and admission is fresh, skip to 5
      if (
        state.wizardDraft.currentStep === 4 &&
        state.wizardDraft.admissionType === "fresh"
      ) {
        state.wizardDraft.currentStep = 5;
      }
    },
    prevWizardStep: (state) => {
      state.wizardDraft.currentStep = Math.max(
        1,
        state.wizardDraft.currentStep - 1,
      );

      //   THE MAGIC SKIP (Backwards): If going back lands on 4 and it's fresh, jump back to 3
      if (
        state.wizardDraft.currentStep === 4 &&
        state.wizardDraft.admissionType === "fresh"
      ) {
        state.wizardDraft.currentStep = 3;
      }
    },
    setWizardStep: (state, action: PayloadAction<number>) => {
      state.wizardDraft.currentStep = action.payload;
    },

    // Instead of making 5 different reducers, we make one smart updater for the wizard
    updateWizardDraft: (
      state,
      action: PayloadAction<Partial<ApplicationDraft>>,
    ) => {
      state.wizardDraft = { ...state.wizardDraft, ...action.payload };
    },

    resetWizard: (state) => {
      state.wizardDraft = emptyWizardDraft;
    },

    // When clicking "Start Application" from a Lead
    initializeWizardFromLead: (
      state,
      action: PayloadAction<{
        classId: string;
        parentName: string;
        mobile: string;
      }>,
    ) => {
      state.wizardDraft = {
        ...emptyWizardDraft,
        currentStep: 1,
        selectedClassId: action.payload.classId,
        guardians: [
          {
            relation: "father",
            fullName: action.payload.parentName,
            mobile: action.payload.mobile,
            isPrimaryContact: true,
          },
        ],
      };
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
  },
});

export const {
  setLeads,
  setSearchQuery,
  setClassFilter,
  openLeadDrawer,
  setStatusFilter,
  closeLeadDrawer,
  addLead,
  updateLeadInStore,
  setApplications,
  updateApplicationStatus,
  nextWizardStep,
  prevWizardStep,
  setWizardStep,
  updateWizardDraft,
  resetWizard,
  initializeWizardFromLead,
} = admissionSlice.actions;

export default admissionSlice.reducer;
