import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from '../../../components/Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  headerActions?: React.ReactNode; // For things like "Export" or "Add New" buttons
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  pageTitle, 
  pageDescription,
  headerActions
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <IonPage>
      <IonContent>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
              
              {/* Dynamic Page Header */}
              {(pageTitle || headerActions) && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    {pageTitle && <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>}
                    {pageDescription && <p className="text-slate-500 text-sm mt-1">{pageDescription}</p>}
                  </div>
                  {headerActions && (
                    <div className="flex w-full sm:w-auto gap-3">
                      {headerActions}
                    </div>
                  )}
                </div>
              )}

              {/* Page Content */}
              {children}

            </main>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminLayout;