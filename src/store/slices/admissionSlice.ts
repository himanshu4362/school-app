import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdmissionState {
  viewMode: "kanban" | "table";
  searchQuery: string;
  classFilter: string | "ALL";
  selectedLeadId: string | null;
  isDrawerOpen: boolean;
  leads: any[];

  // Application Desk State
  applications: any[];
  selectedApplicationId: string | null;
  isReviewDrawerOpen: boolean;
}

const initialState: AdmissionState = {
  viewMode: "kanban",
  searchQuery: "",
  classFilter: "ALL",
  selectedLeadId: null,
  isDrawerOpen: false,
  leads: [],

  applications: [],
  selectedApplicationId: null,
  isReviewDrawerOpen: false,
};

export const admissionSlice = createSlice({
  name: "admission",
  initialState,
  reducers: {
    // Lead Reducers
    setLeads: (state, action: PayloadAction<any[]>) => {
      state.leads = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"kanban" | "table">) => {
      state.viewMode = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setClassFilter: (state, action: PayloadAction<string>) => {
      state.classFilter = action.payload;
    },
    openLeadDrawer: (state, action: PayloadAction<string>) => {
      state.selectedLeadId = action.payload;
      state.isDrawerOpen = true;
    },
    closeLeadDrawer: (state) => {
      state.selectedLeadId = null;
      state.isDrawerOpen = false;
    },
    updateLeadStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const lead = state.leads.find((l) => l.id === action.payload.id || l._id === action.payload.id);
      if (lead) lead.status = action.payload.status;
    },
    addLead: (state, action: PayloadAction<any>) => {
      state.leads.unshift(action.payload);
    },
    updateLead: (state, action: PayloadAction<any>) => {
      const index = state.leads.findIndex((l) => l.id === action.payload.id || l._id === action.payload.id);
      if (index !== -1) state.leads[index] = action.payload;
    },

    // Application Reducers
    setApplications: (state, action: PayloadAction<any[]>) => {
      state.applications = action.payload;
    },
    openReviewDrawer: (state, action: PayloadAction<string>) => {
      state.selectedApplicationId = action.payload;
      state.isReviewDrawerOpen = true;
    },
    closeReviewDrawer: (state) => {
      state.selectedApplicationId = null;
      state.isReviewDrawerOpen = false;
    },
    updateApplicationState: (state, action: PayloadAction<{ id: string; updates: any }>) => {
      const index = state.applications.findIndex((a) => a._id === action.payload.id);
      if (index !== -1) {
        state.applications[index] = { ...state.applications[index], ...action.payload.updates };
      }
    },
  },
});

export const {
  setLeads,
  setViewMode,
  setSearchQuery,
  setClassFilter,
  openLeadDrawer,
  closeLeadDrawer,
  updateLeadStatus,
  addLead,
  updateLead,
  setApplications,
  openReviewDrawer,
  closeReviewDrawer,
  updateApplicationState,
} = admissionSlice.actions;

export default admissionSlice.reducer;