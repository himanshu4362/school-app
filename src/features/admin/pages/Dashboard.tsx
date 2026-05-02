import React from 'react';
import AdminLayout from '../components/AdminLayout';
import DashboardStats from '../components/DashboardStats';
import AttendanceChart from '../components/AttendanceChart';
import FinanceChart from '../components/FinanceChart';
import DailyAlerts from '../components/DailyAlerts';
import RecentActivity from '../components/RecentActivity';

const Dashboard: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="System Overview" 
      pageDescription="Real-time operational health of Delhi Public School."
    >
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AttendanceChart />
        <FinanceChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1"><DailyAlerts /></div>
        <div className="lg:col-span-2"><RecentActivity /></div>
      </div>
    </AdminLayout>
  );
};
export default Dashboard;