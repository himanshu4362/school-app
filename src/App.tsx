import { Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

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
import ManageTeachers from './features/admin/pages/ManageTeachers';
import TeacherOverview from './features/admin/pages/TeacherOverview';
import TeacherAttendance from './features/admin/pages/TeacherAttendance';
import TeacherPayroll from './features/admin/pages/TeacherPayroll';
import Dashboard from './features/admin/pages/Dashboard';
import StudentDirectory from './features/admin/pages/student/StudentDirectory';
import AdmissionsPipeline from './features/admin/pages/student/AdmissionsPipeline';
import Complaints from './features/admin/pages/Complaints';
import FeeCollection from './features/admin/pages/finance/FeeCollection';
import ExamManagement from './features/admin/pages/student/ExamManagement';
import MasterLedger from './features/admin/pages/finance/MasterLedger';
import SyllabusManager from './features/admin/pages/syllabus/SyllabusManager';
import Timetable from './features/admin/pages/academic/Timetable';
import LibraryManager from './features/admin/pages/academic/LibraryManager';
import TransportManagement from './features/admin/pages/transport/TransportManagement';
import Inventory from './features/admin/pages/Inventory';
import NoticeBoard from './features/admin/pages/NoticeBoard';
import TeacherVerification from './features/admin/pages/TeacherVerification';
import NoticeComposer from './features/admin/pages/NoticeComposer';
import MarksEntry from './features/admin/pages/academic/MarksEntry';
import NewTeacherAppointment from './features/admin/pages/NewTeacherAppointment';
import StudentAdmissionWizard from './features/admin/pages/student/StudentAdmissionWizard';
import ReportingCenter from './features/admin/pages/ReportingCenter';
import HolidayConfig from './features/admin/pages/config/HolidayConfig';
import SyllabusCompletionDetail from './features/admin/pages/syllabus/SyllabusCompletionDetail';
import ClassSyllabusManagement from './features/admin/pages/syllabus/ClassSyllabusManagement';
import SyllabusDefinition from './features/admin/pages/syllabus/SyllabusDefinition';
import SyllabusHistoryTracker from './features/admin/pages/syllabus/SyllabusHistoryTracker';

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


        {/* --- Admin Module --- */}
        <Route exact path="/admin" component={Dashboard} />
        <Route exact path="/admin/teachers" component={TeacherOverview} />
        <Route exact path="/admin/teachers/manage" component={ManageTeachers} />
        <Route exact path="/admin/teachers/verify" component={TeacherVerification} />
        <Route exact path="/admin/teachers/attendance" component={TeacherAttendance} />
        <Route exact path="/admin/teachers/payroll" component={TeacherPayroll} />
        <Route exact path="/admin/students" component={StudentDirectory} />
        <Route exact path="/admin/students/admissions" component={AdmissionsPipeline} />
        <Route exact path="/admin/students/exams" component={ExamManagement} />
        <Route exact path="/admin/finance/ledger" component={MasterLedger} />
        <Route exact path="/admin/finance/fees" component={FeeCollection} />
        <Route exact path="/admin/notices" component={NoticeBoard} />
        <Route exact path="/admin/complaints" component={Complaints} />
        <Route exact path="/admin/inventory" component={Inventory} />
        <Route exact path="/admin/transport" component={TransportManagement} />
        <Route exact path="/admin/academic/syllabus" component={SyllabusManager} />
        <Route exact path="/admin/academic/timetable" component={Timetable} />
        <Route exact path="/admin/academic/library" component={LibraryManager} />
        <Route exact path="/admin/notices/compose" component={NoticeComposer} />
        <Route exact path="/admin/academic/marks-entry" component={MarksEntry} />
        <Route exact path="/admin/teachers/new-appointment" component={NewTeacherAppointment} />
        <Route exact path="/admin/students/enroll" component={StudentAdmissionWizard} />
        <Route exact path="/admin/reports" component={ReportingCenter} />
        <Route exact path="/admin/config/holidays" component={HolidayConfig} />
        <Route exact path="/admin/academic/syllabus" component={SyllabusManager} />
        <Route exact path="/admin/academic/syllabus/detail" component={SyllabusCompletionDetail} />
        <Route exact path="/admin/academic/syllabus/manage/:classId" component={ClassSyllabusManagement} />
        <Route exact path="/admin/academic/syllabus/define/:classId/:subject" component={SyllabusDefinition} />
        <Route exact path="/admin/academic/syllabus/history/:logId" component={SyllabusHistoryTracker} />

        <Route component={page404} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;