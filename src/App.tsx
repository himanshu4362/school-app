import { Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './theme/variables.css';

/* --- YOUR PAGE IMPORTS (Layouts Removed) --- */
import Home from './features/home/pages/Home';
import AuthLanding from './features/auth/pages/AuthLanding';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import VerifyOtp from './features/auth/pages/VerifyOtp';
import ResetPassword from './features/auth/pages/ResetPassword';
import page404 from './features/page404/page404';
import SyllabusOverview from './features/admin/pages/syllabus/SyllabusOverview';
import Dashboard from './features/admin/pages/dashboard/Dashboard';
import ClassSyllabusManage from './features/admin/pages/syllabus/ClassSyllabusManage';
import AllSyllabusAnalytics from './features/admin/pages/syllabus/AllSyllabusAnalytics';
import ClassSyllabusAnalytics from './features/admin/pages/syllabus/ClassSyllabusAnalytics';
import SubjectDashboard from './features/admin/pages/syllabus/SubjectDashboard';
import SyllabusEditorSandbox from './features/admin/pages/syllabus/SyllabusEditorSandbox';
import TimetableOverview from './features/admin/pages/academic/TimetableOverview';
import ClassTimetableDashboard from './features/admin/pages/academic/ClassTimetableDashboard';
import TimetableEditor from './features/admin/pages/academic/TimetableEditor';
import HolidayCalendarDashboard from './features/admin/pages/config/HolidayCalendarDashboard';
import LeadManagement from './features/admin/pages/admissions/LeadManagement';
import AdmissionWizard from './features/admin/components/admissions/AdmissionWizard';
import MarksEntryHub from './features/admin/pages/examination/MarksEntryHub';
import EvaluationTable from './features/admin/pages/examination/EvaluationTable';
import MonthlyTestHub from './features/admin/pages/examination/MonthlyTestHub';
import MonthlyTestEntry from './features/admin/pages/examination/MonthlyTestEntry';
import RecruitmentPipeline from './features/admin/pages/faculty/RecruitmentPipeline';
import FacultyBulkImporter from './features/admin/pages/faculty/FacultyBulkImporter';
import FacultyOnboardingWizard from './features/admin/pages/faculty/FacultyOnboardingWizard';
import StaffDirectory from './features/admin/pages/faculty/StaffDirectory';
import StaffAttendancePage from './features/admin/pages/faculty/StaffAttendance';
import LeaveManagementPage from './features/admin/pages/faculty/LeaveManagement';
import SystemConfigHub from './features/admin/pages/system/SystemConfigHub';
import SeatManagementHub from './features/admin/pages/system/SeatManagementHub';
import FeeMasterHub from './features/admin/pages/finance/FeeMasterHub';
import StudentLedgerHub from './features/admin/pages/finance/StudentLedgerHub';
import CashDeskHub from './features/admin/pages/finance/CashDeskHub';
import RevenuePassbookHub from './features/admin/pages/finance/RevenuePassbookHub';
import PayrollHub from './features/admin/pages/finance/PayrollHub';
import ExpensePassbookHub from './features/admin/pages/finance/ExpensePassbookHub';
import ExecutiveDashboardHub from './features/admin/pages/finance/ExecutiveDashboardHub';
import SeparationHub from './features/admin/pages/hr/SeparationHub';
import StudentExitHub from './features/admin/pages/student/StudentExitHub';
import StudentDirectoryHub from './features/admin/pages/student/StudentDirectoryHub';
import LibraryAdminHub from './features/admin/pages/library/LibraryAdminHub';
import CirculationDeskHub from './features/admin/pages/library/CirculationDeskHub';
import OpacHub from './features/admin/pages/library/OpacHub';
import LibraryAnalyticsHub from './features/admin/pages/library/LibraryAnalyticsHub';
import AcademicAdminHub from './features/admin/pages/academic/AcademicAdminHub';
import TeacherDashboardHub from './features/teacher/pages/dashboard/TeacherDashboardHub';
import TeacherTimetableHub from './features/teacher/pages/schedule/TeacherTimetableHub';
import ClassroomExecutionHub from './features/teacher/pages/execution/ClassroomExecutionHub';
import TeacherMarksEntryHub from './features/teacher/pages/examination/TeacherMarksEntryHub';
import TeacherAttendanceHub from './features/teacher/pages/attendance/TeacherAttendanceHub';
import StudentDailyAttendanceHub from './features/teacher/pages/attendance/StudentDailyAttendanceHub';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Public & Auth Routes ... */}

        <Route exact path="/" component={Home} />
        <Route exact path="/auth" component={AuthLanding} />
        <Route exact path="/auth/login" component={Login} />
        <Route exact path="/auth/register" component={Register} />
        <Route exact path="/auth/forgot-password" component={ResetPassword} />
        <Route exact path="/auth/verify-otp" component={VerifyOtp} />

        <Route exact path="/admin" render={() => <Redirect to="/admin/dashboard" />} />
        <Route exact path="/admin/dashboard" component={Dashboard} />
        <Route exact path="/admin/academic/syllabus" component={SyllabusOverview} />
        <Route exact path="/admin/academic/syllabus/manage/:classId" component={ClassSyllabusManage} />
        <Route exact path="/admin/academic/syllabus/analytics" component={AllSyllabusAnalytics} />
        <Route exact path="/admin/academic/syllabus/analytics/:classId" component={ClassSyllabusAnalytics} />
        <Route exact path="/admin/academic/syllabus/manage/:classId/:subjectId" component={SubjectDashboard} />
        <Route exact path="/admin/academic/syllabus/editor/:classId/:subjectId" component={SyllabusEditorSandbox} />
        <Route exact path="/admin/academic/timetable" component={TimetableOverview} />
        <Route exact path="/admin/academic/timetable/manage/:classId" component={ClassTimetableDashboard} />
        <Route exact path="/admin/academic/timetable/editor/:classId" component={TimetableEditor} />
        <Route exact path="/admin/config/holidays" component={HolidayCalendarDashboard} />
        <Route exact path="/admin/admissions" component={LeadManagement} />
        <Route exact path="/admin/admissions/wizard" component={AdmissionWizard} />
        <Route exact path="/admin/examination/marks-hub" component={MarksEntryHub} />
        <Route exact path="/admin/examination/evaluate" component={EvaluationTable} />
        <Route exact path="/admin/examination/monthly-tests" component={MonthlyTestHub} />
        <Route exact path="/admin/examination/monthly/entry" component={MonthlyTestEntry} />
        <Route exact path="/admin/faculty/recruitment" component={RecruitmentPipeline} />
        <Route exact path="/admin/faculty/migration" component={FacultyBulkImporter} />
        <Route exact path="/admin/faculty/onboarding" component={FacultyOnboardingWizard} />
        <Route exact path="/admin/faculty/directory" component={StaffDirectory} />
        <Route exact path="/admin/faculty/attendance" component={StaffAttendancePage} />
        <Route exact path="/admin/faculty/leave" component={LeaveManagementPage} />
        <Route exact path="/admin/config/master-data" component={SystemConfigHub} />
        <Route exact path="/admin/config/seats" component={SeatManagementHub} />
        <Route exact path="/admin/finance/fee-master" component={FeeMasterHub} />
        <Route exact path="/admin/finance/ledger" component={StudentLedgerHub} />
        <Route exact path="/admin/finance/pos" component={CashDeskHub} />
        <Route exact path="/admin/finance/passbook" component={RevenuePassbookHub} />
        <Route exact path="/admin/finance/payroll" component={PayrollHub} />
        <Route exact path="/admin/finance/expenses" component={ExpensePassbookHub} />
        <Route exact path="/admin/finance/executive-dashboard" component={ExecutiveDashboardHub} />
        <Route exact path="/admin/hr/separations" component={SeparationHub} />
        <Route exact path="/admin/student/exits" component={StudentExitHub} />
        <Route exact path="/admin/students" component={StudentDirectoryHub} />
        <Route exact path="/admin/library/procurement" component={LibraryAdminHub} />
        <Route exact path="/admin/library/circulation" component={CirculationDeskHub} />
        <Route exact path="/admin/library/opac" component={OpacHub} />
        <Route exact path="/admin/library/analytics" component={LibraryAnalyticsHub} />
        <Route exact path="/admin/academic/subjects" component={AcademicAdminHub} />

        <Route exact path="/teacher" component={TeacherDashboardHub} />
        <Route exact path="/teacher/schedule" component={TeacherTimetableHub} />        
        <Route exact path="/teacher/execution/cockpit/:sessionId" component={ClassroomExecutionHub} />
        <Route exact path="/teacher/examinations" component={TeacherMarksEntryHub} />
        <Route exact path="/teacher/attendance" component={TeacherAttendanceHub} />
        <Route exact path="/teacher/attendance/homeroom" component={StudentDailyAttendanceHub} />

        <Route component={page404} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;