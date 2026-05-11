import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GatePassStage = 'GATEWAY' | 'SELECT_STUDENT' | 'FILL_DETAILS' | 'VIDEO_CONSENT' | 'SUCCESS';

interface GatePassFormData {
  reason: string;
  destination: string;
  transportMode: string;
  remarks: string;
}

interface GatePassState {
  currentStage: GatePassStage;
  activeClassId: string | null;
  activeSectionId: string | null;
  selectedStudentId: string | null;
  formData: GatePassFormData;
  videoConsentUrl: string | null;
  isSubmitting: boolean;
}

const initialFormData: GatePassFormData = { reason: '', destination: '', transportMode: '', remarks: '' };

const initialState: GatePassState = {
  currentStage: 'GATEWAY',
  activeClassId: null,
  activeSectionId: null,
  selectedStudentId: null,
  formData: initialFormData,
  videoConsentUrl: null,
  isSubmitting: false,
};

export const gatePassSlice = createSlice({
  name: 'gatePass',
  initialState,
  reducers: {
    // Navigation Routing
    navToGateway: (state) => {
      state.currentStage = 'GATEWAY';
      state.activeClassId = null;
      state.activeSectionId = null;
      state.selectedStudentId = null;
    },
    navToStudentSelection: (state, action: PayloadAction<{ classId: string; sectionId: string }>) => {
      state.activeClassId = action.payload.classId;
      state.activeSectionId = action.payload.sectionId;
      state.selectedStudentId = null;
      state.currentStage = 'SELECT_STUDENT';
    },
    navToDetailsForm: (state, action: PayloadAction<string>) => {
      state.selectedStudentId = action.payload;
      state.currentStage = 'FILL_DETAILS';
    },
    navToVideoConsent: (state, action: PayloadAction<GatePassFormData>) => {
      state.formData = action.payload;
      state.currentStage = 'VIDEO_CONSENT';
    },
    
    // API Actions
    setVideoUrl: (state, action: PayloadAction<string>) => {
      state.videoConsentUrl = action.payload;
    },
    submitGatePass: (state, action: PayloadAction<string>) => {
      state.isSubmitting = true;
      
      const payload = {
        teacherId: action.payload,
        studentId: state.selectedStudentId,
        exitTime: new Date().toISOString(),
        details: state.formData,
        videoConsentUrl: state.videoConsentUrl
      };

      console.log("[API REQUEST] POST /api/v1/attendance/gate-pass");
      console.log("PAYLOAD:", JSON.stringify(payload, null, 2));

      state.isSubmitting = false;
      state.currentStage = 'SUCCESS';
      
      // Clear sensitive form data after submission
      state.formData = initialFormData;
      state.videoConsentUrl = null;
    }
  }
});

export const { 
  navToGateway, navToStudentSelection, navToDetailsForm, navToVideoConsent, 
  setVideoUrl, submitGatePass 
} = gatePassSlice.actions;

export default gatePassSlice.reducer;