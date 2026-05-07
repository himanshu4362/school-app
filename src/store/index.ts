import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '../features/admin/store/adminSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    // auth: authReducer, <-- Add other feature reducers here later
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;