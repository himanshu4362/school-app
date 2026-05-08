import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. DYNAMIC TYPES FOR MARKS SYSTEM
export interface StudentMarkEntry {
  studentId: string;
  rollNo: number;
  name: string;
  avatar?: string;
  theoryMarks: number | null; // Out of 80
  internalMarks: number | null; // Out of 20
  total: number | null;
  grade: string | null;
  rank: number | null;
}

export interface SubjectAllocation {
  id: string;
  subjectName: string;
  teacherName: string;
  status: 'pending' | 'draft' | 'submitted';
  lastUpdated?: string;
}

export interface ExaminationState {
  // Navigation State (Drill-down path)
  activeExamId: string | null;
  selectedClassId: string | null;
  selectedSubjectId: string | null;
  selectedStudentForDrawer: string | null;
  
  // Data State
  exams: { id: string; name: string; status: 'upcoming' | 'ongoing' | 'completed' }[];
  classSubjectsData: SubjectAllocation[]; // Level 2 data
  currentEvaluationList: StudentMarkEntry[]; // Level 3 data
  isDrawerOpen: boolean;
}

// 2. MOCK DATA (Taaki UI banate waqt real feel aaye)
const MOCK_EXAMS = [
  { id: 'EXM-TERM1', name: 'Term 1 (Half Yearly)', status: 'ongoing' as const },
  { id: 'EXM-UNIT2', name: 'Unit Test 2', status: 'completed' as const },
];

const MOCK_SUBJECTS: SubjectAllocation[] = [
  { id: 'SUB-SCI', subjectName: 'Science', teacherName: 'Ravi Verma', status: 'draft', lastUpdated: '2 hours ago' },
  { id: 'SUB-MAT', subjectName: 'Mathematics', teacherName: 'Priya Sharma', status: 'submitted', lastUpdated: '1 day ago' },
  { id: 'SUB-ENG', subjectName: 'English', teacherName: 'Anjali Desai', status: 'pending' },
];

const MOCK_STUDENTS: StudentMarkEntry[] = [
  { studentId: 'STU-001', rollNo: 1, name: 'Rahul Sharma', theoryMarks: 72, internalMarks: 18, total: 90, grade: 'A1', rank: 1 },
  { studentId: 'STU-002', rollNo: 2, name: 'Aarti Singh', theoryMarks: null, internalMarks: null, total: null, grade: null, rank: null },
  { studentId: 'STU-003', rollNo: 3, name: 'Karan Patel', theoryMarks: 55, internalMarks: 15, total: 70, grade: 'B2', rank: 12 },
];

const initialState: ExaminationState = {
  activeExamId: 'EXM-TERM1', // Default open
  selectedClassId: null,
  selectedSubjectId: null,
  selectedStudentForDrawer: null,
  exams: MOCK_EXAMS,
  classSubjectsData: MOCK_SUBJECTS,
  currentEvaluationList: MOCK_STUDENTS,
  isDrawerOpen: false,
};

// 3. THE SLICE (Brain of the Operation)
export const examinationSlice = createSlice({
  name: 'examination',
  initialState,
  reducers: {
    // Navigation Actions
    selectExam: (state, action: PayloadAction<string>) => { state.activeExamId = action.payload; },
    selectClass: (state, action: PayloadAction<string>) => { state.selectedClassId = action.payload; },
    selectSubject: (state, action: PayloadAction<string | null>) => { state.selectedSubjectId = action.payload; },
    
    // Drawer Actions
    openStudentReport: (state, action: PayloadAction<string>) => {
      state.selectedStudentForDrawer = action.payload;
      state.isDrawerOpen = true;
    },
    closeStudentReport: (state) => {
      state.selectedStudentForDrawer = null;
      state.isDrawerOpen = false;
    },

    // Marks Entry Action (Dynamic Calculation)
    updateStudentMark: (state, action: PayloadAction<{ studentId: string; field: 'theoryMarks' | 'internalMarks'; value: number }>) => {
      const student = state.currentEvaluationList.find(s => s.studentId === action.payload.studentId);
      if (student) {
        student[action.payload.field] = action.payload.value;
        
        // Auto-calculate Total and Grade logic
        const theory = student.theoryMarks || 0;
        const internal = student.internalMarks || 0;
        
        if (student.theoryMarks !== null || student.internalMarks !== null) {
          student.total = theory + internal;
          
          // Simple Grade Calculation
          if (student.total >= 90) student.grade = 'A1';
          else if (student.total >= 80) student.grade = 'A2';
          else if (student.total >= 70) student.grade = 'B1';
          else if (student.total >= 60) student.grade = 'B2';
          else student.grade = 'C';
        } else {
          student.total = null;
          student.grade = null;
        }
      }
    },
  },
});

export const { 
  selectExam, selectClass, selectSubject, 
  openStudentReport, closeStudentReport, updateStudentMark 
} = examinationSlice.actions;

export default examinationSlice.reducer;