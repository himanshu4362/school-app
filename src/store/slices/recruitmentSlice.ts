import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CandidateProfileDTO, JobPostingDTO } from '../../types/faculty/recruitment.schema';

interface RecruitmentState {
  // Settings for the Kanban UI
  activeJobId: string | null; 
  searchQuery: string;
  isCandidateDrawerOpen: boolean;
  selectedCandidateId: string | null;
  
  // Data Stores
  jobs: JobPostingDTO[];
  candidates: CandidateProfileDTO[];
}

interface FacultyDraftState {
  currentStep: number;
  identity: any | null;
  academic: any | null;
  employment: any | null;
  academicAllocation: any | null;
  payroll: any | null;
  // CHANGE THIS LINE: Remove the []
  documents: any | null; 
  accessConfig: any | null;
}

// --- MOCK V1 DATA FOR UI DEVELOPMENT ---
const INITIAL_JOBS: JobPostingDTO[] = [
  { id: 'JOB-001', requisitionId: 'REQ-101', targetRole: 'PGT Physics', status: 'open', budgetMin: 35000, budgetMax: 45000 },
  { id: 'JOB-002', requisitionId: 'REQ-102', targetRole: 'TGT Mathematics', status: 'open', budgetMin: 25000, budgetMax: 35000 }
];

const INITIAL_CANDIDATES: CandidateProfileDTO[] = [
  { id: 'CAN-001', jobId: 'JOB-001', firstName: 'Anita', lastName: 'Desai', email: 'anita@test.com', mobile: '9876543210', source: 'linkedin', pipelineState: 'applied', expectedSalary: 42000 },
  { id: 'CAN-002', jobId: 'JOB-001', firstName: 'Vikram', lastName: 'Singh', email: 'vikram@test.com', mobile: '8765432109', source: 'referral', pipelineState: 'demo_scheduled', expectedSalary: 40000 },
  { id: 'CAN-003', jobId: 'JOB-002', firstName: 'Pooja', lastName: 'Sharma', email: 'pooja@test.com', mobile: '7654321098', source: 'walk_in', pipelineState: 'offer_processing', offeredSalarySnapshot: 32000 },
];

const initialState: RecruitmentState = {
  activeJobId: 'JOB-001', // Default to viewing the first job's pipeline
  searchQuery: '',
  isCandidateDrawerOpen: false,
  selectedCandidateId: null,
  jobs: INITIAL_JOBS,
  candidates: INITIAL_CANDIDATES,
};

export const recruitmentSlice = createSlice({
  name: 'recruitment',
  initialState,
  reducers: {
    // UI Controls
    setActiveJob: (state, action: PayloadAction<string>) => { state.activeJobId = action.payload; },
    setSearchQuery: (state, action: PayloadAction<string>) => { state.searchQuery = action.payload; },
    openCandidateDrawer: (state, action: PayloadAction<string | null>) => {
      state.selectedCandidateId = action.payload;
      state.isCandidateDrawerOpen = true;
    },
    closeCandidateDrawer: (state) => {
      state.selectedCandidateId = null;
      state.isCandidateDrawerOpen = false;
    },

    // Data Mutations
    addCandidate: (state, action: PayloadAction<CandidateProfileDTO>) => {
      const newId = `CAN-00${state.candidates.length + 1}`;
      state.candidates.unshift({ ...action.payload, id: newId });
    },
    updateCandidate: (state, action: PayloadAction<CandidateProfileDTO>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = action.payload;
      }
    },
    moveCandidatePipeline: (state, action: PayloadAction<{ id: string; newState: CandidateProfileDTO['pipelineState'] }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.id);
      if (candidate) {
        candidate.pipelineState = action.payload.newState;
      }
    }
  },
});

export const { 
  setActiveJob, setSearchQuery, openCandidateDrawer, closeCandidateDrawer, 
  addCandidate, updateCandidate, moveCandidatePipeline 
} = recruitmentSlice.actions;

export default recruitmentSlice.reducer;