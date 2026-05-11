import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  StudentProfile,
  EnrollmentStatus,
} from "../../types/student/directory.schema";

interface StudentDirectoryState {
  records: Record<string, StudentProfile>; // Keyed by student ID

  // View & Filter State
  activeTab: "ACTIVE" | "ALUMNI" | "ARCHIVED";
  searchQuery: string;
  filterClass: string;
  filterSection: string;

  // Bulk Action State
  selectedIds: string[];
}

// Seed some initial data perfectly formatted for the Attendance Hub
const MOCK_SEED: Record<string, StudentProfile> = {
  // === CLASS 10-A (Homeroom) ===
  "STU-10A-001": { id: "STU-10A-001", rollNumber: "1", admissionNumber: "ADM-2016-042", firstName: "Rahul", lastName: "Sharma", gender: "MALE", dateOfBirth: "2010-05-14", classId: "10", sectionId: "A", academicYearId: "AY-2026-27", parentName: "Rajesh Sharma", parentPhone: "9876543210", status: "ACTIVE", joinDate: "2016-04-01" },
  "STU-10A-002": { id: "STU-10A-002", rollNumber: "2", admissionNumber: "ADM-2022-089", firstName: "Aarti", lastName: "Singh", gender: "FEMALE", dateOfBirth: "2010-11-22", classId: "10", sectionId: "A", academicYearId: "AY-2026-27", parentName: "Vikram Singh", parentPhone: "9876543211", status: "ACTIVE", joinDate: "2022-06-15" },
  "STU-10A-003": { id: "STU-10A-003", rollNumber: "3", admissionNumber: "ADM-2018-112", firstName: "Kavya", lastName: "Mehta", gender: "FEMALE", dateOfBirth: "2010-02-18", classId: "10", sectionId: "A", academicYearId: "AY-2026-27", parentName: "Sanjay Mehta", parentPhone: "9876543212", status: "ACTIVE", joinDate: "2018-04-01" },
  "STU-10A-004": { id: "STU-10A-004", rollNumber: "4", admissionNumber: "ADM-2017-033", firstName: "Aryan", lastName: "Kapoor", gender: "MALE", dateOfBirth: "2010-08-30", classId: "10", sectionId: "A", academicYearId: "AY-2026-27", parentName: "Anil Kapoor", parentPhone: "9876543213", status: "ACTIVE", joinDate: "2017-04-01" },
  "STU-10A-005": { id: "STU-10A-005", rollNumber: "5", admissionNumber: "ADM-2019-077", firstName: "Sneha", lastName: "Reddy", gender: "FEMALE", dateOfBirth: "2010-12-05", classId: "10", sectionId: "A", academicYearId: "AY-2026-27", parentName: "Vijay Reddy", parentPhone: "9876543214", status: "ACTIVE", joinDate: "2019-04-01" },

  // === CLASS 10-B (Proxy) ===
  "STU-10B-001": { id: "STU-10B-001", rollNumber: "1", admissionNumber: "ADM-2020-011", firstName: "Karan", lastName: "Patel", gender: "MALE", dateOfBirth: "2010-03-08", classId: "10", sectionId: "B", academicYearId: "AY-2026-27", parentName: "Amit Patel", parentPhone: "9876543215", status: "ACTIVE", joinDate: "2020-04-01" },
  "STU-10B-002": { id: "STU-10B-002", rollNumber: "2", admissionNumber: "ADM-2021-044", firstName: "Anjali", lastName: "Desai", gender: "FEMALE", dateOfBirth: "2010-07-19", classId: "10", sectionId: "B", academicYearId: "AY-2026-27", parentName: "Ramesh Desai", parentPhone: "9876543216", status: "ACTIVE", joinDate: "2021-04-01" },
  "STU-10B-003": { id: "STU-10B-003", rollNumber: "3", admissionNumber: "ADM-2016-099", firstName: "Vikram", lastName: "Malhotra", gender: "MALE", dateOfBirth: "2009-11-01", classId: "10", sectionId: "B", academicYearId: "AY-2026-27", parentName: "Suresh Malhotra", parentPhone: "9876543217", status: "ACTIVE", joinDate: "2016-04-01" },
  "STU-10B-004": { id: "STU-10B-004", rollNumber: "4", admissionNumber: "ADM-2018-022", firstName: "Pooja", lastName: "Bhatia", gender: "FEMALE", dateOfBirth: "2010-01-14", classId: "10", sectionId: "B", academicYearId: "AY-2026-27", parentName: "Deepak Bhatia", parentPhone: "9876543218", status: "ACTIVE", joinDate: "2018-04-01" },

  // === CLASS 9-A (Proxy) ===
  "STU-09A-001": { id: "STU-09A-001", rollNumber: "1", admissionNumber: "ADM-2023-005", firstName: "Rohan", lastName: "Iyer", gender: "MALE", dateOfBirth: "2011-04-20", classId: "9", sectionId: "A", academicYearId: "AY-2026-27", parentName: "Karthik Iyer", parentPhone: "9876543219", status: "ACTIVE", joinDate: "2023-04-01" },
  "STU-09A-002": { id: "STU-09A-002", rollNumber: "2", admissionNumber: "ADM-2022-065", firstName: "Meera", lastName: "Nair", gender: "FEMALE", dateOfBirth: "2011-09-12", classId: "9", sectionId: "A", academicYearId: "AY-2026-27", parentName: "Prakash Nair", parentPhone: "9876543220", status: "ACTIVE", joinDate: "2022-04-01" },
  "STU-09A-003": { id: "STU-09A-003", rollNumber: "3", admissionNumber: "ADM-2024-012", firstName: "Dev", lastName: "Joshi", gender: "MALE", dateOfBirth: "2011-12-01", classId: "9", sectionId: "A", academicYearId: "AY-2026-27", parentName: "Manish Joshi", parentPhone: "9876543221", status: "ACTIVE", joinDate: "2024-04-01" },
};

const initialState: StudentDirectoryState = {
  records: MOCK_SEED,
  activeTab: "ACTIVE",
  searchQuery: "",
  filterClass: "",
  filterSection: "",
  selectedIds: [],
};

export const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setDirectoryTab: (
      state,
      action: PayloadAction<"ACTIVE" | "ALUMNI" | "ARCHIVED">,
    ) => {
      state.activeTab = action.payload;
      state.selectedIds = []; // Clear selections when switching tabs
    },
    setFilters: (
      state,
      action: PayloadAction<{
        search: string;
        classId: string;
        sectionId: string;
      }>,
    ) => {
      state.searchQuery = action.payload.search;
      state.filterClass = action.payload.classId;
      state.filterSection = action.payload.sectionId;
    },
    toggleSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((i) => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAll: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
  },
});

export const {
  setDirectoryTab,
  setFilters,
  toggleSelection,
  selectAll,
  clearSelection,
} = studentSlice.actions;
export default studentSlice.reducer;
