import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "../features/admin/store/adminSlice";
import admissionReducer from "./slices/admissionSlice";
import configSlice from "./slices/configSlice";
import applicationSlice from "./slices/applicationSlice";
import examinationReducer from "./slices/examinationSlice";
import monthlyTestReducer from "./slices/monthlyTestSlice";
import facultySlice from "./slices/facultySlice";
import recruitmentSlice from "./slices/recruitmentSlice";
import facultyDirectoryReducer from "./slices/facultyDirectorySlice"; // Add this import
import attendanceSlice from "./slices/attendanceSlice";
import leaveSlice from "./slices/leaveSlice";
import systemConfigSlice from "./slices/systemConfigSlice";
import seatSlice from "./slices/seatSlice";
import financeReducer from "./slices/financeSlice";
import hrSlice from "./slices/hrSlice";
import studentExitReducer from "./slices/studentExitSlice";
import studentReducer from "./slices/studentSlice";
import libraryReducer from "./slices/librarySlice";
import academicReducer from "./slices/academicSlice";
import executionReducer from "./slices/executionSlice";
import studentAttendanceReducer from "./slices/studentAttendanceSlice";
import gatePassReducer from "./slices/gatePassSlice";
import evaluationReducer from "./slices/evaluationSlice"
import quizBuilderSlice from "./slices/quizBuilderSlice"

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    admission: admissionReducer,
    config: configSlice,
    application: applicationSlice,
    examination: examinationReducer,
    monthlyTest: monthlyTestReducer,
    faculty: facultySlice,
    recruitment: recruitmentSlice,
    facultyDirectory: facultyDirectoryReducer,
    attendance: attendanceSlice,
    leave: leaveSlice,
    systemConfig: systemConfigSlice,
    seats: seatSlice,
    finance: financeReducer,
    hr: hrSlice,
    studentExit: studentExitReducer,
    student: studentReducer,
    library: libraryReducer,
    academic: academicReducer,
    execution: executionReducer,
    studentAttendance: studentAttendanceReducer,
    gatePass: gatePassReducer,
    evaluation: evaluationReducer,
    quizBuilder: quizBuilderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
