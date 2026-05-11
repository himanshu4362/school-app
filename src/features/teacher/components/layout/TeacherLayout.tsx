import React, { useState } from 'react';
import { IonPage } from '@ionic/react';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <IonPage>
      <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans">
        <TeacherSidebar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
        
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          <TeacherHeader setMobileOpen={setMobileOpen} />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 bg-slate-50">
            {children}
          </main>
        </div>
      </div>
    </IonPage>
  );
};

export default TeacherLayout;