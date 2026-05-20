import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AcademicYear,
  Department,
  Designation,
  Room,
  Grade,
  Section,
  Subject,
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
      state.validationErrors = []; // Clear errors on switch
    },

    setGlobalAcademicYear: (state, action: PayloadAction<string>) => {
      state.globalCurrentAcademicYearId = action.payload;
    },

    clearValidationErrors: (state) => {
      state.validationErrors = [];
    },

    setAcademicYears: (state, action: PayloadAction<any[]>) => {
      state.academicYears = {};
      action.payload.forEach((item) => {
        const id = item._id || item.id;
        state.academicYears[id] = { ...item, id };
        if (item.isActive) state.globalCurrentAcademicYearId = id; // Auto-set active year
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

    // ==========================================
    // VALIDATED UPSERT ENGINES
    // ==========================================
    upsertSection: (state, action: PayloadAction<Section>) => {
      const newSection = action.payload;
      state.validationErrors = [];

      const isDuplicate = Object.values(state.sections).some(
        (sec) =>
          sec.id !== newSection.id &&
          sec.academicYearId === newSection.academicYearId &&
          sec.gradeId === newSection.gradeId &&
          sec.name.toLowerCase() === newSection.name.toLowerCase(),
      );
      if (isDuplicate) {
        state.validationErrors.push({
          field: "name",
          message: `A section named '${newSection.name}' already exists for this Grade and Academic Year.`,
          severity: "error",
        });
        return;
      }

      if (newSection.roomId) {
        const assignedRoom = state.rooms[newSection.roomId];
        //   CHANGED: maxCapacity -> targetCapacity
        if (assignedRoom && newSection.targetCapacity > assignedRoom.capacity) {
          state.validationErrors.push({
            field: 'targetCapacity',
            message: `Section target capacity (${newSection.targetCapacity}) exceeds room ${assignedRoom.roomNumber} capacity (${assignedRoom.capacity}).`,
            severity: 'error'
          });
          return; 
        }
      }

      state.sections[newSection.id] = newSection;
    },

    upsertDepartment: (state, action: PayloadAction<Department>) => {
      const newDept = action.payload;
      state.validationErrors = [];

      const isDuplicate = Object.values(state.departments).some(
        (dept) =>
          dept.id !== newDept.id &&
          dept.code.toUpperCase() === newDept.code.toUpperCase(),
      );
      if (isDuplicate) {
        state.validationErrors.push({
          field: "code",
          message: `Department code '${newDept.code}' is already in use.`,
          severity: "error",
        });
        return;
      }
      state.departments[newDept.id] = newDept;
    },

    attemptCloseSection: (
      state,
      action: PayloadAction<{ sectionId: string; activeStudentCount: number }>,
    ) => {
      const { sectionId, activeStudentCount } = action.payload;
      const section = state.sections[sectionId];
      if (!section) return;

      if (activeStudentCount > 0) {
        state.validationErrors.push({
          message: `Cannot close section: ${activeStudentCount} students are still enrolled.`,
          severity: "error",
        });
        return;
      }

      if (section.classTeacherId) {
        state.validationErrors.push({
          message: `Cannot close section: A class teacher is still assigned.`,
          severity: "error",
        });
        return;
      }

      section.status = "closed";
    },

    upsertRoom: (state, action: PayloadAction<Room>) => {
      const newRoom = action.payload;
      state.validationErrors = [];

      const isDuplicate = Object.values(state.rooms).some(
        (room) =>
          room.id !== newRoom.id &&
          room.roomNumber.toUpperCase() === newRoom.roomNumber.toUpperCase(),
      );
      if (isDuplicate) {
        state.validationErrors.push({
          field: "roomNumber",
          message: `Room Number '${newRoom.roomNumber}' already exists in the infrastructure database.`,
          severity: "error",
        });
        return;
      }
      state.rooms[newRoom.id] = newRoom;
    },

    upsertGrade: (state, action: PayloadAction<Grade>) => {
      const newGrade = action.payload;
      state.validationErrors = [];

      const isDuplicate = Object.values(state.grades).some(
        (grade) =>
          grade.id !== newGrade.id &&
          grade.name.toUpperCase() === newGrade.name.toUpperCase(),
      );
      if (isDuplicate) {
        state.validationErrors.push({
          field: "name",
          message: `Grade name '${newGrade.name}' is already configured.`,
          severity: "error",
        });
        return;
      }
      state.grades[newGrade.id] = newGrade;
    },

    upsertAcademicYear: (state, action: PayloadAction<AcademicYear>) => {
      const newYear = action.payload;
      state.validationErrors = [];

      //   Clean, strict duplicate check using 'name'
      const isDuplicate = Object.values(state.academicYears).some(
        (y) => y.id !== newYear.id && y.name.toUpperCase() === newYear.name.toUpperCase()
      );
      
      if (isDuplicate) {
        state.validationErrors.push({
          field: 'name',
          message: `Academic Year '${newYear.name}' is already in use.`,
          severity: 'error'
        });
        return;
      }

      if (new Date(newYear.endDate) <= new Date(newYear.startDate)) {
        state.validationErrors.push({
          field: 'dates',
          message: `The End Date must be strictly after the Start Date.`,
          severity: 'error'
        });
        return;
      }

      state.academicYears[newYear.id] = newYear;
    },

    upsertDesignation: (state, action: PayloadAction<Designation>) => {
      const newDesig = action.payload;
      state.validationErrors = [];

      const isDuplicate = Object.values(state.designations).some(
        (d) =>
          d.id !== newDesig.id &&
          d.title.toUpperCase() === newDesig.title.toUpperCase(),
      );
      if (isDuplicate) {
        state.validationErrors.push({
          field: "title",
          message: `Designation '${newDesig.title}' is already configured.`,
          severity: "error",
        });
        return;
      }
      state.designations[newDesig.id] = newDesig;
    },

    upsertSubject: (state, action: PayloadAction<Subject>) => {
      const newSubj = action.payload;
      state.validationErrors = [];

      const isDuplicate = Object.values(state.subjects).some(
        (s) =>
          s.id !== newSubj.id &&
          s.code.toUpperCase() === newSubj.code.toUpperCase(),
      );
      if (isDuplicate) {
        state.validationErrors.push({
          field: "code",
          message: `Subject code '${newSubj.code}' is already in use.`,
          severity: "error",
        });
        return;
      }
      state.subjects[newSubj.id] = newSubj;
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
  clearValidationErrors,
  upsertGrade,
  upsertRoom,
  upsertSection,
  upsertAcademicYear,
  upsertDepartment,
  upsertSubject,
  upsertDesignation,
  attemptCloseSection,
} = systemConfigSlice.actions;

export default systemConfigSlice.reducer;
