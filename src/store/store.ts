import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "../features/admin/store/adminSlice";
import admissionReducer from "./slices/admissionSlice";
import configSlice from "./slices/configSlice";
import applicationSlice from "./slices/applicationSlice";
import examinationReducer from "./slices/examinationSlice";
import monthlyTestReducer from './slices/monthlyTestSlice';
export const store = configureStore({
  reducer: {
    admin: adminReducer,
    admission: admissionReducer,
    config: configSlice,
    application: applicationSlice,
    examination: examinationReducer,
    monthlyTest: monthlyTestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
