import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AcademicYear,
  Department,
  Designation,
  Room,
  Grade,
  Section,
  Subject,
  SeatInventory,
  CurriculumSubject,
} from "../../types/core/systemConfig.schema";

export interface ValidationError {
  field?: string;
  message: string;
  severity: "error" | "warning";
}

interface SystemConfigState {
  globalCurrentAcademicYearId: string | null;

  academicYears: Record<string, AcademicYear>;
  departments: Record<string, Department>;
  designations: Record<string, Designation>;
  rooms: Record<string, Room>;
  grades: Record<string, Grade>;
  sections: Record<string, Section>;
  subjects: Record<string, Subject>;
  seatInventories: Record<string, SeatInventory>;
  curriculum: Record<string, CurriculumSubject>;

  activeModule:
    | "academicYears"
    | "departments"
    | "designations"
    | "rooms"
    | "grades"
    | "sections"
    | "subjects";
  validationErrors: ValidationError[];
}

const initialState: SystemConfigState = {
  globalCurrentAcademicYearId: null,
  academicYears: {},
  departments: {},
  designations: {},
  rooms: {},
  grades: {},
  sections: {},
  subjects: {},
  seatInventories: {},
  curriculum: {},
  activeModule: "academicYears",
  validationErrors: [],
};

export const systemConfigSlice = createSlice({
  name: "systemConfig",
  initialState,
  reducers: {
    setModule: (
      state,
      action: PayloadAction<SystemConfigState["activeModule"]>,
    ) => {
      state.activeModule = action.payload;
      state.validationErrors = [];
    },

    setGlobalAcademicYear: (state, action: PayloadAction<string>) => {
      state.globalCurrentAcademicYearId = action.payload;
    },

    clearValidationErrors: (state) => {
      state.validationErrors = [];
    },

    // ==========================================
    // BULK SETTERS (from API hydration)
    // ==========================================
    setAcademicYears: (state, action: PayloadAction<any[]>) => {
      state.academicYears = {};
      action.payload.forEach((item) => {
        const id = item._id || item.id;
        state.academicYears[id] = { ...item, id };
        if (item.isActive) state.globalCurrentAcademicYearId = id;
      });
    },
    setGrades: (state, action: PayloadAction<any[]>) => {
      state.grades = {};
      action.payload.forEach((item) => {
        const id = item._id || item.id;
        state.grades[id] = { ...item, id };
      });
    },
    setRooms: (state, action: PayloadAction<any[]>) => {
      state.rooms = {};
      action.payload.forEach((item) => {
        const id = item._id || item.id;
        state.rooms[id] = { ...item, id };
      });
    },
    setSections: (state, action: PayloadAction<any[]>) => {
      state.sections = {};
      action.payload.forEach((item) => {
        const id = item._id || item.id;
        state.sections[id] = { ...item, id };
      });
    },
    setSeatInventories: (state, action: PayloadAction<any[]>) => {
      state.seatInventories = {};
      action.payload.forEach((item) => {
        const id = item._id || item.id;
        state.seatInventories[id] = { ...item, id };
      });
    },

    // ==========================================
    // UPSERT (single entity after create/update)
    // ==========================================
    upsertAcademicYear: (state, action: PayloadAction<AcademicYear>) => {
      const newYear = action.payload;
      state.academicYears[newYear.id] = newYear;
      // If this year is active, update global pointer
      if (newYear.isActive) {
        // Deactivate others in local state
        Object.keys(state.academicYears).forEach(id => {
          if (id !== newYear.id) state.academicYears[id].isActive = false;
        });
        state.globalCurrentAcademicYearId = newYear.id;
      }
    },

    upsertGrade: (state, action: PayloadAction<Grade>) => {
      state.grades[action.payload.id] = action.payload;
    },

    upsertRoom: (state, action: PayloadAction<Room>) => {
      state.rooms[action.payload.id] = action.payload;
    },

    upsertSection: (state, action: PayloadAction<Section>) => {
      state.sections[action.payload.id] = action.payload;
    },

    upsertSeatInventory: (state, action: PayloadAction<SeatInventory>) => {
      state.seatInventories[action.payload.id] = action.payload;
    },

    // Archive section — just update status, don't remove
    archiveSection: (state, action: PayloadAction<string>) => {
      const section = state.sections[action.payload];
      if (section) section.status = 'ARCHIVED';
    },

    // ==========================================
    // CLIENT-ONLY (no backend)
    // ==========================================
    upsertDepartment: (state, action: PayloadAction<Department>) => {
      state.departments[action.payload.id] = action.payload;
    },

    upsertDesignation: (state, action: PayloadAction<Designation>) => {
      state.designations[action.payload.id] = action.payload;
    },

    upsertSubject: (state, action: PayloadAction<Subject>) => {
      state.subjects[action.payload.id] = action.payload;
    },
  },
});

export const {
  setModule,
  setGlobalAcademicYear,
  setAcademicYears,
  setGrades,
  setRooms,
  setSections,
  setSeatInventories,
  clearValidationErrors,
  upsertGrade,
  upsertRoom,
  upsertSection,
  upsertAcademicYear,
  upsertSeatInventory,
  archiveSection,
  upsertDepartment,
  upsertSubject,
  upsertDesignation,
} = systemConfigSlice.actions;

export default systemConfigSlice.reducer;