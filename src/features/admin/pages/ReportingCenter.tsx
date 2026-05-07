// admin/pages/ReportingCenter.tsx

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { UserCheck, CreditCard, FileText, Printer, Download, Search } from 'lucide-react';

const ReportingCenter: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialTab = query.get('cat') as 'HR' | 'Finance' | 'Academic' || 'HR';
  
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state if URL changes while component is mounted
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const HRDocs = [
    { id: 'LTR-902', name: 'Dr. Arvind Sharma', type: 'Appointment Letter', date: 'May 02, 2026' },
    { id: 'EXP-104', name: 'Meera Reddy', type: 'Experience Certificate', date: 'Apr 28, 2026' },
  ];

  return (
    <AdminLayout 
      pageTitle="Document & Reporting Hub" 
      pageDescription="Central repository for all system-generated official documents."
    >
      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {(['HR', 'Finance', 'Academic'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab} Records
          </button>
        ))}
      </div>

      {/* Document List Implementation ... */}
    </AdminLayout>
  );
};