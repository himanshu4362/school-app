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

// Seed some initial data so the directory isn't empty
const MOCK_SEED: Record<string, StudentProfile> = {
  "STU-001": {
    id: "STU-001",
    rollNumber: "101",
    admissionNumber: "ADM-2016-042",
    firstName: "Rahul",
    lastName: "Sharma",
    gender: "MALE",
    dateOfBirth: "2010-05-14",
    classId: "Class 10",
    sectionId: "A",
    academicYearId: "AY-2026-27",
    parentName: "Rajesh Sharma",
    parentPhone: "9876543210",
    status: "ACTIVE",
    joinDate: "2016-04-01",
  },
  "STU-002": {
    id: "STU-002",
    rollNumber: "205",
    admissionNumber: "ADM-2022-089",
    firstName: "Aarti",
    lastName: "Singh",
    gender: "FEMALE",
    dateOfBirth: "2008-11-22",
    classId: "Class 12",
    sectionId: "Science",
    academicYearId: "AY-2026-27",
    parentName: "Vikram Singh",
    parentPhone: "9876543211",
    status: "ACTIVE",
    joinDate: "2022-06-15",
  },
  "STU-003": {
    id: "STU-003",
    rollNumber: "042",
    admissionNumber: "ADM-2020-011",
    firstName: "Karan",
    lastName: "Patel",
    gender: "MALE",
    dateOfBirth: "2012-03-08",
    classId: "Class 8",
    sectionId: "B",
    academicYearId: "AY-2026-27",
    parentName: "Amit Patel",
    parentPhone: "9876543212",
    status: "ACTIVE",
    joinDate: "2020-04-01",
  },
  "STU-ALUM-01": {
    id: "STU-ALUM-01",
    rollNumber: "105",
    admissionNumber: "ADM-2014-001",
    firstName: "Priya",
    lastName: "Verma",
    gender: "FEMALE",
    dateOfBirth: "2007-01-10",
    classId: "Class 12",
    sectionId: "Commerce",
    academicYearId: "AY-2025-26",
    parentName: "Sanjay Verma",
    parentPhone: "9876543213",
    status: "ALUMNI",
    joinDate: "2014-04-01",
  },
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
