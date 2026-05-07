import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { ChevronRight, Home } from 'lucide-react';
import { useHistory } from 'react-router-dom';

// We will assume you have a clean Sidebar and Header component ready
import Sidebar from './Sidebar';
import Header from './Header';

export interface Breadcrumb {
  label: string;
  path?: string; // If no path, it's the current active page
}

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  headerActions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  pageTitle,
  pageDescription,
  headerActions,
  breadcrumbs = [],
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const history = useHistory();

  return (
    <IonPage>
      <IonContent>
        <div className="flex min-h-screen bg-slate-50">
          {/* Main Navigation */}
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            {/* Top Bar */}
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Scrollable Content Area */}
            <main className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
              
              {/* Breadcrumb Navigation (The deep navigation) */}
              {breadcrumbs.length > 0 && (
                <nav className="flex flex-wrap items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <button 
                    onClick={() => history.push('/admin')} 
                    className="hover:text-blue-600 transition flex items-center gap-1"
                  >
                    <Home size={12} /> Home
                  </button>
                  
                  {breadcrumbs.map((crumb, i) => (
                    <React.Fragment key={i}>
                      <ChevronRight size={10} className="text-slate-300" />
                      {crumb.path ? (
                        <button 
                          onClick={() => history.push(crumb.path!)} 
                          className="hover:text-blue-600 transition"
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span className="text-slate-900">{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}

              {/* Page Header (Title, Description, and Action Buttons) */}
              {(pageTitle || headerActions) && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    {pageTitle && <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{pageTitle}</h1>}
                    {pageDescription && <p className="text-slate-500 text-sm mt-1">{pageDescription}</p>}
                  </div>
                  {headerActions && <div className="flex gap-3 w-full sm:w-auto">{headerActions}</div>}
                </div>
              )}

              {/* The Actual Page Content */}
              {children}
            </main>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminLayout;