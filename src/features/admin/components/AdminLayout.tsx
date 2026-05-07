import React, {
  useMemo,
  useState,
} from 'react';

import {
  IonContent,
  IonPage,
} from '@ionic/react';

import {
  ChevronRight,
  Home,
} from 'lucide-react';

import {
  useHistory,
  useLocation,
} from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface Props {
  children: React.ReactNode;

  pageTitle?: string;

  pageDescription?: string;

  headerActions?: React.ReactNode;

  breadcrumbs?: Breadcrumb[];

  autoBreadcrumbs?: boolean;
}

const routeNameMap: Record<string, string> = {
  admin: 'Dashboard',
  syllabus: 'Syllabus',
  subjects: 'Subjects',
  chapters: 'Chapters',
  topics: 'Topics',
};

const AdminLayout: React.FC<Props> = ({
  children,
  pageTitle,
  pageDescription,
  headerActions,
  breadcrumbs,
  autoBreadcrumbs = false,
}) => {

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const history = useHistory();

  const location = useLocation();

  const generatedBreadcrumbs = useMemo(() => {

    if (!autoBreadcrumbs) return [];

    const pathnames =
      location.pathname
        .split('/')
        .filter(Boolean);

    return pathnames.map((segment, index) => ({
      label:
        routeNameMap[segment] ||
        segment.charAt(0).toUpperCase() +
        segment.slice(1),

      path:
        '/' +
        pathnames
          .slice(0, index + 1)
          .join('/'),
    }));

  }, [location.pathname, autoBreadcrumbs]);

  const finalBreadcrumbs =
    breadcrumbs?.length
      ? breadcrumbs
      : generatedBreadcrumbs;

  return (
    <IonPage>
      <IonContent>

        <div className="flex min-h-screen bg-slate-50">

          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />

          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

            <Header
              toggleSidebar={() =>
                setIsSidebarOpen(!isSidebarOpen)
              }
            />

            <main className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">

              {/* BREADCRUMB */}
              {finalBreadcrumbs.length > 0 && (
                <nav className="flex flex-wrap items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">

                  <button
                    onClick={() =>
                      history.push('/admin')
                    }
                    className="hover:text-blue-600 transition flex items-center gap-1"
                  >
                    <Home size={12} />
                    Home
                  </button>

                  {finalBreadcrumbs.map((crumb, i) => (
                    <React.Fragment key={i}>

                      <ChevronRight
                        size={10}
                        className="text-slate-300"
                      />

                      {crumb.path ? (
                        <button
                          onClick={() =>
                            history.push(crumb.path!)
                          }
                          className="hover:text-blue-600 transition"
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span className="text-slate-900">
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}

              {/* HEADER */}
              {(pageTitle || headerActions) && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">

                  <div>

                    {pageTitle && (
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {pageTitle}
                      </h1>
                    )}

                    {pageDescription && (
                      <p className="text-slate-500 text-sm mt-1">
                        {pageDescription}
                      </p>
                    )}
                  </div>

                  {headerActions && (
                    <div className="flex gap-3">
                      {headerActions}
                    </div>
                  )}
                </div>
              )}

              {children}

            </main>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminLayout;
