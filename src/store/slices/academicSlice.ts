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
// Seed data to make prototyping faster
const MOCK_SUBJECTS: Record<string, Subject> = {
  'SUB-MAT-101': { 
    id: 'SUB-MAT-101', 
    code: 'MAT-101', 
    name: 'Mathematics', 
    type: 'THEORY', 
    chapters: [
      {
        id: 'CHAP-ALG-01',
        title: 'Unit 1: Algebra',
        topics: [
          { id: 'TOPIC-ALG-1', title: 'Polynomials and their zeroes', estimatedPeriods: 4 },
          { id: 'TOPIC-ALG-2', title: 'Quadratic Equations', estimatedPeriods: 5 },
          { id: 'TOPIC-ALG-3', title: 'Arithmetic Progressions', estimatedPeriods: 3 }
        ]
      },
      {
        id: 'CHAP-GEO-02',
        title: 'Unit 2: Geometry',
        topics: [
          { id: 'TOPIC-GEO-1', title: 'Triangles & Proportionality', estimatedPeriods: 6 },
          { id: 'TOPIC-GEO-2', title: 'Circles and Tangents', estimatedPeriods: 4 }
        ]
      }
    ] 
  },
  'SUB-PHY-101': { 
    id: 'SUB-PHY-101', 
    code: 'PHY-101', 
    name: 'Physics', 
    type: 'THEORY',
    chapters: [
      {
        id: 'CHAP-KIN-01',
        title: 'Unit 1: Kinematics',
        topics: [
          { id: 'TOPIC-KIN-1', title: 'Distance, Displacement, and Speed', estimatedPeriods: 2 },
          { id: 'TOPIC-KIN-2', title: 'Velocity and Acceleration', estimatedPeriods: 3 }
        ]
      },
      {
        id: 'CHAP-DYN-02',
        title: 'Unit 2: Dynamics',
        topics: [
          { id: 'TOPIC-DYN-1', title: 'Newton\'s First & Second Laws', estimatedPeriods: 4 },
          { id: 'TOPIC-DYN-2', title: 'Momentum & Conservation', estimatedPeriods: 2 }
        ]
      }
    ]
  },
  'SUB-PHY-LAB': { 
    id: 'SUB-PHY-LAB', 
    code: 'PHY-LAB', 
    name: 'Physics Practical', 
    type: 'LAB', 
    chapters: [
      {
        id: 'CHAP-LAB-01',
        title: 'Mechanics Experiments',
        topics: [
          { id: 'TOPIC-LAB-1', title: 'Vernier Caliper & Micrometer', estimatedPeriods: 2 },
          { id: 'TOPIC-LAB-2', title: 'Simple Pendulum Gravity Exp.', estimatedPeriods: 2 }
        ]
      }
    ] 
  },
  'SUB-ENG-101': { 
    id: 'SUB-ENG-101', 
    code: 'ENG-101', 
    name: 'English Literature', 
    type: 'THEORY', 
    chapters: [
      {
        id: 'CHAP-POET-01',
        title: 'Unit 1: Poetry',
        topics: [
          { id: 'TOPIC-POET-1', title: 'The Road Not Taken', estimatedPeriods: 2 },
          { id: 'TOPIC-POET-2', title: 'Ozymandias', estimatedPeriods: 2 }
        ]
      },
      {
        id: 'CHAP-PROSE-02',
        title: 'Unit 2: Prose',
        topics: [
          { id: 'TOPIC-PROSE-1', title: 'A Letter to God', estimatedPeriods: 3 },
          { id: 'TOPIC-PROSE-2', title: 'Nelson Mandela: Long Walk to Freedom', estimatedPeriods: 4 }
        ]
      }
    ] 
  },
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