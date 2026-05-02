import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Search, Filter, FileWarning, CheckCircle2, Clock, MoreHorizontal } from 'lucide-react';

// Data Model for Admissions
interface Applicant {
  id: string;
  name: string;
  gradeApplying: string;
  parentName: string;
  appliedDate: string;
  status: 'New' | 'Document Review' | 'Interview' | 'Approved';
  missingDocs: boolean;
}

const mockApplicants: Applicant[] = [
  { id: 'APP-101', name: 'Riya Singh', gradeApplying: '6', parentName: 'Arun Singh', appliedDate: '2 days ago', status: 'New', missingDocs: false },
  { id: 'APP-102', name: 'Ayaan Khan', gradeApplying: '9', parentName: 'Zoya Khan', appliedDate: '3 days ago', status: 'New', missingDocs: true },
  { id: 'APP-103', name: 'Kavya Sharma', gradeApplying: '11', parentName: 'Deepak Sharma', appliedDate: '1 week ago', status: 'Document Review', missingDocs: true },
  { id: 'APP-104', name: 'Samir Patel', gradeApplying: '1', parentName: 'Nisha Patel', appliedDate: '2 weeks ago', status: 'Interview', missingDocs: false },
  { id: 'APP-105', name: 'Ananya Verma', gradeApplying: '4', parentName: 'Ravi Verma', appliedDate: '3 weeks ago', status: 'Approved', missingDocs: false },
];

const AdmissionsPipeline: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Helper to group applicants by status
  const getApplicantsByStatus = (status: Applicant['status']) => 
    mockApplicants.filter(app => app.status === status);

  // Reusable Kanban Card Component
  const ApplicantCard = ({ applicant }: { applicant: Applicant }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative">
      <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreHorizontal size={18} />
      </button>
      
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm ring-1 ring-blue-600/20">
          {applicant.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{applicant.name}</h4>
          <p className="text-xs text-slate-500">Applying for Grade {applicant.gradeApplying}</p>
        </div>
      </div>
      
      <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Parent:</span>
          <span className="font-medium text-slate-700">{applicant.parentName}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1"><Clock size={12} /> Applied:</span>
          <span className="text-slate-700">{applicant.appliedDate}</span>
        </div>
      </div>

      {applicant.missingDocs ? (
        <div className="mt-3 bg-amber-50 text-amber-700 text-xs px-2 py-1.5 rounded-md flex items-center gap-1.5 border border-amber-200/50">
          <FileWarning size={14} /> Action: Docs Pending
        </div>
      ) : (
        <div className="mt-3 bg-emerald-50 text-emerald-700 text-xs px-2 py-1.5 rounded-md flex items-center gap-1.5 border border-emerald-200/50">
          <CheckCircle2 size={14} /> Docs Verified
        </div>
      )}
    </div>
  );

  return (
    <IonPage>
      <IonContent>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <main className="flex-1 p-6 overflow-x-auto custom-scrollbar">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 min-w-[800px]">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admissions Pipeline</h1>
                  <p className="text-slate-500 text-sm mt-1">Track and move applicants through the enrollment phases.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-blue-100">
                    <Search size={16} className="text-slate-400" />
                    <input type="text" placeholder="Search applicants..." className="bg-transparent border-none outline-none text-sm w-full ml-2 text-slate-700" />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm">
                    <Filter size={16} /> Filters
                  </button>
                </div>
              </div>

              {/* Kanban Board Layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[1000px] pb-6">
                
                {/* Lane 1: New */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-blue-500">
                    <h3 className="font-bold text-slate-800">1. New Applications</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{getApplicantsByStatus('New').length}</span>
                  </div>
                  {getApplicantsByStatus('New').map(app => <ApplicantCard key={app.id} applicant={app} />)}
                </div>

                {/* Lane 2: Document Review */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
                    <h3 className="font-bold text-slate-800">2. Document Review</h3>
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{getApplicantsByStatus('Document Review').length}</span>
                  </div>
                  {getApplicantsByStatus('Document Review').map(app => <ApplicantCard key={app.id} applicant={app} />)}
                </div>

                {/* Lane 3: Interview/Test */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-purple-500">
                    <h3 className="font-bold text-slate-800">3. Interview / Test</h3>
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">{getApplicantsByStatus('Interview').length}</span>
                  </div>
                  {getApplicantsByStatus('Interview').map(app => <ApplicantCard key={app.id} applicant={app} />)}
                </div>

                {/* Lane 4: Approved */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
                    <h3 className="font-bold text-slate-800">4. Ready to Enroll</h3>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{getApplicantsByStatus('Approved').length}</span>
                  </div>
                  {getApplicantsByStatus('Approved').map(app => <ApplicantCard key={app.id} applicant={app} />)}
                </div>

              </div>
            </main>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdmissionsPipeline;