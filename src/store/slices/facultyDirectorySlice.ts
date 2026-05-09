import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FacultyEmployee } from "../../types/faculty/directory.schema";

const MOCK_STAFF: FacultyEmployee[] = [
  {
    id: "1",
    employeeId: "TCH-2026-001",
    fullName: "Himanshu Raj",
    primarySubject: "Computer Science",
    departmentId: "dept-sci",
    designationId: "desg-pgt",
    email: "himanshu@school.edu",
    mobile: "9876543210",
    status: "active",
    workloadStatus: "balanced",
    joiningDate: "2026-01-10",
    employmentType: "full_time",
    activeClasses: ["10-A", "12-B"],
    assignedSubjects: ["React", "Node.js"],
    vaultStatus: "verified",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    employeeId: "TCH-2026-002",
    fullName: "Ananya Sharma",
    primarySubject: "Mathematics",
    departmentId: "dept-sci",
    designationId: "desg-tgt",
    email: "ananya@school.edu",
    mobile: "8765432109",
    status: "on_leave",
    workloadStatus: "high_load",
    joiningDate: "2026-02-15",
    employmentType: "full_time",
    activeClasses: ["8-C"],
    assignedSubjects: ["Calculus"],
    vaultStatus: "pending",
    createdAt: new Date().toISOString(),
  },
];

interface DirectoryState {
  staff: FacultyEmployee[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  selectedEmployeeId: string | null; // Controls the 360° Drawer
  searchQuery: string;
  filters: {
    department: string;
    status: string;
    workload: string;
  };
}

const initialState: DirectoryState = {
  staff: MOCK_STAFF,
  isLoading: false,
  viewMode: "grid",
  selectedEmployeeId: null,
  searchQuery: "",
  filters: { department: "", status: "", workload: "" },
};

export const facultyDirectorySlice = createSlice({
  name: "facultyDirectory",
  initialState,
  reducers: {
    setStaff: (state, action: PayloadAction<FacultyEmployee[]>) => {
      state.staff = action.payload;
    },
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === "grid" ? "list" : "grid";
    },
    openProfile: (state, action: PayloadAction<string>) => {
      state.selectedEmployeeId = action.payload;
    },
    closeProfile: (state) => {
      state.selectedEmployeeId = null;
    },
    updateSearch: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilter: (
      state,
      action: PayloadAction<{
        key: "department" | "status" | "workload";
        value: string;
      }>,
    ) => {
      const { key, value } = action.payload;
      state.filters[key] = value; // This now works because 'key' is strictly typed
    },
    addEmployee: (state, action: PayloadAction<FacultyEmployee>) => {
      state.staff.unshift(action.payload); // Adds the new hire to the top of the directory
    },
    updateEmployeeStatus: (state, action: PayloadAction<{ id: string; status: 'active' | 'on_leave' | 'suspended' | 'terminated' }>) => {
      const employee = state.staff.find(e => e.id === action.payload.id);
      if (employee) {
        employee.status = action.payload.status;
      }
    },
  },
});

export const {
  setStaff,
  toggleViewMode,
  openProfile,
  closeProfile,
  updateSearch,
  setFilter,
  updateEmployeeStatus,
  addEmployee
} = facultyDirectorySlice.actions;
export default facultyDirectorySlice.reducer;
