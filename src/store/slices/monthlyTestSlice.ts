import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. DYNAMIC TYPES FOR MONTHLY TESTS
export interface MonthlyTestConfig {
  id: string;
  title: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  date: string;
  maxMarks: number;     // Dynamic (e.g., 10, 20, 25, 50)
  passingMarks: number; // Dynamic
  status: 'draft' | 'completed';
}

export interface TestResult {
  studentId: string;
  rollNo: number;
  name: string;
  marksObtained: number | null;
  isAbsent: boolean;
}

export interface MonthlyTestState {
  tests: MonthlyTestConfig[];
  // Hum results ko dictionary/object format mein store karenge: { "testId": [studentResults...] }
  testResults: Record<string, TestResult[]>; 
  
  // Navigation & Filtering State
  selectedClassId: string | null;
  selectedSubjectId: string | null;
  activeTestId: string | null; // Jis test ke marks enter ho rahe hain
}

// 2. MOCK DATA (Testing ke liye)
const MOCK_TESTS: MonthlyTestConfig[] = [
  {
    id: 'MTEST-001',
    title: 'August Chapter 4 Quiz',
    classId: 'Class 10',
    subjectId: 'SUB-SCI',
    subjectName: 'Science',
    date: '2026-08-12',
    maxMarks: 25,
    passingMarks: 10,
    status: 'completed'
  },
  {
    id: 'MTEST-002',
    title: 'Unit 2 Surprise Test',
    classId: 'Class 10',
    subjectId: 'SUB-MAT',
    subjectName: 'Mathematics',
    date: '2026-08-20',
    maxMarks: 15,
    passingMarks: 6,
    status: 'draft'
  }
];

const MOCK_RESULTS: Record<string, TestResult[]> = {
  'MTEST-001': [
    { studentId: 'STU-001', rollNo: 1, name: 'Rahul Sharma', marksObtained: 22, isAbsent: false },
    { studentId: 'STU-002', rollNo: 2, name: 'Aarti Singh', marksObtained: 9, isAbsent: false }, // Failed
    { studentId: 'STU-003', rollNo: 3, name: 'Karan Patel', marksObtained: null, isAbsent: true }, // Absent
  ],
  'MTEST-002': [
    { studentId: 'STU-001', rollNo: 1, name: 'Rahul Sharma', marksObtained: null, isAbsent: false },
    { studentId: 'STU-002', rollNo: 2, name: 'Aarti Singh', marksObtained: null, isAbsent: false },
    { studentId: 'STU-003', rollNo: 3, name: 'Karan Patel', marksObtained: null, isAbsent: false },
  ]
};

const initialState: MonthlyTestState = {
  tests: MOCK_TESTS,
  testResults: MOCK_RESULTS,
  selectedClassId: 'Class 10',
  selectedSubjectId: null,
  activeTestId: null,
};

// 3. THE SLICE (Logic Engine)
export const monthlyTestSlice = createSlice({
  name: 'monthlyTest',
  initialState,
  reducers: {
    // Navigation Actions
    setTestFilter: (state, action: PayloadAction<{ classId: string; subjectId: string | null }>) => {
      state.selectedClassId = action.payload.classId;
      state.selectedSubjectId = action.payload.subjectId;
    },
    setActiveTest: (state, action: PayloadAction<string | null>) => {
      state.activeTestId = action.payload;
    },

    // Action to Create a New Test Dynamically
    createNewTest: (state, action: PayloadAction<{ config: MonthlyTestConfig; students: any[] }>) => {
      // 1. Save Test Config
      state.tests.unshift(action.payload.config);
      
      // 2. Generate Empty Result Sheet for that Class
      const emptyResults: TestResult[] = action.payload.students.map(student => ({
        studentId: student.id,
        rollNo: student.rollNo,
        name: student.name,
        marksObtained: null,
        isAbsent: false
      }));
      
      state.testResults[action.payload.config.id] = emptyResults;
    },

    // Action to enter marks with built-in protection
    updateTestMark: (state, action: PayloadAction<{ testId: string; studentId: string; marks: number | null }>) => {
      const { testId, studentId, marks } = action.payload;
      
      // Find the test to get Max Marks
      const testConfig = state.tests.find(t => t.id === testId);
      if (!testConfig) return;

      const studentList = state.testResults[testId];
      if (studentList) {
        const student = studentList.find(s => s.studentId === studentId);
        if (student) {
          // Dynamic Validation: Cannot enter more than Max Marks
          let validatedMarks = marks;
          if (marks !== null && marks > testConfig.maxMarks) {
            validatedMarks = testConfig.maxMarks;
          } else if (marks !== null && marks < 0) {
            validatedMarks = 0;
          }
          
          student.marksObtained = validatedMarks;
          student.isAbsent = false; // Agar marks daal diye toh automatically present maan lenge
        }
      }
    },

    // Action to mark student Absent
    toggleAbsent: (state, action: PayloadAction<{ testId: string; studentId: string }>) => {
      const { testId, studentId } = action.payload;
      const studentList = state.testResults[testId];
      
      if (studentList) {
        const student = studentList.find(s => s.studentId === studentId);
        if (student) {
          student.isAbsent = !student.isAbsent;
          // Agar absent mark kiya, toh marks null ho jayenge
          if (student.isAbsent) {
            student.marksObtained = null;
          }
        }
      }
    }
  },
});

export const { 
  setTestFilter, 
  setActiveTest, 
  createNewTest, 
  updateTestMark, 
  toggleAbsent 
} = monthlyTestSlice.actions;

export default monthlyTestSlice.reducer;