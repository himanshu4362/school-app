import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdmissionLeadDTO } from '../../types/admission/lead.schema';

interface AdmissionState {
  viewMode: 'kanban' | 'table';
  searchQuery: string;
  classFilter: string | 'ALL';
  selectedLeadId: string | null;
  isDrawerOpen: boolean;
  leads: AdmissionLeadDTO[]; // Holding mock data for frontend V1
}

// --- MOCK V1 DATA ---
const INITIAL_LEADS: AdmissionLeadDTO[] = [
  { id: 'LEAD-001', campaignId: 'CAMP-2026', parentName: 'Rajesh Sharma', mobile: '9876543210', interestedClassId: 'Class 1', source: 'website', status: 'new', remarks: 'Looking for early admission' },
  { id: 'LEAD-002', campaignId: 'CAMP-2026', parentName: 'Priya Patel', mobile: '8765432109', interestedClassId: 'Class 6', source: 'walk_in', status: 'contacted', remarks: 'Visited campus on Tuesday' },
  { id: 'LEAD-003', campaignId: 'CAMP-2026', parentName: 'Amit Verma', mobile: '7654321098', interestedClassId: 'Class 9', source: 'social_media', status: 'follow_up', remarks: 'Asked to call back next week' },
  { id: 'LEAD-004', campaignId: 'CAMP-2026', parentName: 'Neha Singh', mobile: '6543210987', interestedClassId: 'Class 1', source: 'referral', status: 'new' },
];

const initialState: AdmissionState = {
  viewMode: 'kanban',
  searchQuery: '',
  classFilter: 'ALL',
  selectedLeadId: null,
  isDrawerOpen: false,
  leads: INITIAL_LEADS,
};

export const admissionSlice = createSlice({
  name: 'admission',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<'kanban' | 'table'>) => {
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
    // Action to move a lead across the Kanban board
    updateLeadStatus: (state, action: PayloadAction<{ id: string; status: AdmissionLeadDTO['status'] }>) => {
      const lead = state.leads.find(l => l.id === action.payload.id);
      if (lead) lead.status = action.payload.status;
    }
  },
});

export const { 
  setViewMode, setSearchQuery, setClassFilter, 
  openLeadDrawer, closeLeadDrawer, updateLeadStatus 
} = admissionSlice.actions;

export default admissionSlice.reducer;