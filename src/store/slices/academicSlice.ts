import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Subject, ClassSyllabus, FacultyAllocation, TimetablePeriod } from '../../types/academic/academic.schema';

interface AcademicState {
  subjects: Record<string, Subject>;
  classSyllabus: Record<string, ClassSyllabus>; // Keyed by classId
  allocations: FacultyAllocation[];
  timetable: TimetablePeriod[];
  validationErrors: { message: string, severity: 'error' }[];
}

// Seed data to make prototyping faster
const MOCK_SUBJECTS: Record<string, Subject> = {
  'SUB-MAT-101': { id: 'SUB-MAT-101', code: 'MAT-101', name: 'Mathematics', type: 'THEORY' },
  'SUB-PHY-101': { id: 'SUB-PHY-101', code: 'PHY-101', name: 'Physics', type: 'THEORY' },
  'SUB-PHY-LAB': { id: 'SUB-PHY-LAB', code: 'PHY-LAB', name: 'Physics Practical', type: 'LAB' },
  'SUB-ENG-101': { id: 'SUB-ENG-101', code: 'ENG-101', name: 'English Literature', type: 'THEORY' },
};

const initialState: AcademicState = {
  subjects: MOCK_SUBJECTS,
  classSyllabus: {},
  allocations: [],
  timetable: [],
  validationErrors: []
};

export const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: {
    clearAcademicErrors: (state) => { state.validationErrors = []; },

    // 1. SUBJECT MANAGEMENT
    addSubject: (state, action: PayloadAction<Subject>) => {
      state.subjects[action.payload.id] = action.payload;
    },

    // 2. CLASS SYLLABUS MAPPING
    updateClassSyllabus: (state, action: PayloadAction<{ classId: string, subjectIds: string[], academicYearId: string }>) => {
      const { classId, subjectIds, academicYearId } = action.payload;
      state.classSyllabus[classId] = {
        id: crypto.randomUUID(),
        classId,
        academicYearId,
        subjectIds
      };
    },

    // 3. FACULTY ALLOCATION (With Guardrails)
    allocateFaculty: (state, action: PayloadAction<Omit<FacultyAllocation, 'id'>>) => {
      const newAlloc = action.payload;

      // Guardrail 1: Is this exact teacher already teaching this exact subject to this exact section?
      const exists = state.allocations.find(a => 
        a.classId === newAlloc.classId && 
        a.sectionId === newAlloc.sectionId && 
        a.subjectId === newAlloc.subjectId
      );

      if (exists) {
        state.validationErrors.push({ message: `A teacher is already allocated to ${newAlloc.subjectId} for ${newAlloc.classId}-${newAlloc.sectionId}.`, severity: 'error' });
        return;
      }

      state.allocations.push({
        id: crypto.randomUUID(),
        ...newAlloc
      });
    },

    removeAllocation: (state, action: PayloadAction<string>) => {
      state.allocations = state.allocations.filter(a => a.id !== action.payload);
      // If we remove an allocation, we MUST strip it from the timetable to prevent ghost classes
      state.timetable = state.timetable.filter(t => t.allocationId !== action.payload);
    }
  }
});

export const { clearAcademicErrors, addSubject, updateClassSyllabus, allocateFaculty, removeAllocation } = academicSlice.actions;
export default academicSlice.reducer;