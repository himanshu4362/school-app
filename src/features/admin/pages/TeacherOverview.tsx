import React from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import { Users, UserCheck, UserX, MailWarning } from 'lucide-react';

const TeacherOverview: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Teacher Overview" 
      pageDescription="High-level metrics for your teaching staff."
    >
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Active" value="142" icon={<Users size={24} className="text-blue-600" />} colorClass="bg-blue-50" />
        {/* ... other stat cards ... */}
      </div>

      {/* 2. Pending Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Pending Onboarding Actions</h2>
        {/* ... action list ... */}
      </div>
    </AdminLayout>
  );
};

export default TeacherOverview;