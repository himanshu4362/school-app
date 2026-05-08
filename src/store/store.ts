import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "../features/admin/store/adminSlice";
import admissionReducer from "./slices/admissionSlice";
import configSlice from "./slices/configSlice";
import applicationSlice from "./slices/applicationSlice";
import examinationReducer from "./slices/examinationSlice";
import monthlyTestReducer from './slices/monthlyTestSlice';
import facultySlice from './slices/facultySlice'
import recruitmentSlice from "./slices/recruitmentSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    admission: admissionReducer,
    config: configSlice,
    application: applicationSlice,
    examination: examinationReducer,
    monthlyTest: monthlyTestReducer,
    faculty: facultySlice,
    recruitment: recruitmentSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
