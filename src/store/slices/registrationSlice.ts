import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SchoolRegistrationState {
  registrationData: any | null;
  status: 'idle' | 'submitted' | 'failed';
}

const initialState: SchoolRegistrationState = {
  registrationData: null,
  status: 'idle',
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    submitSchoolRegistration: (state, action: PayloadAction<any>) => {
      state.registrationData = action.payload;
      state.status = 'submitted';
    },
    resetRegistration: (state) => {
      state.registrationData = null;
      state.status = 'idle';
    }
  }
});

export const { submitSchoolRegistration, resetRegistration } = registrationSlice.actions;
export default registrationSlice.reducer;