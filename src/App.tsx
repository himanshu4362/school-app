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

        <Route component={page404} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;