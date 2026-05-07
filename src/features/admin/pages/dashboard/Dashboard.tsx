import React, { useEffect } from 'react';
import { IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/react';
import { Users, GraduationCap, IndianRupee, MessageSquareWarning } from 'lucide-react';

import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/shared/StatCard';

// Redux hooks
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchDashboardStats } from '../../store/adminSlice';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboardStats, isLoading, error } = useAppSelector((state) => state.admin);

  // Fetch data when the component mounts
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout 
      pageTitle="System Overview" 
      pageDescription="Real-time operational health of NEXUS ERP."
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      {/* Loading State using Ionic Spinner */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 text-blue-600">
          <IonSpinner name="crescent" className="w-10 h-10 mb-4" />
          <p className="text-sm font-bold text-slate-500 animate-pulse">Syncing data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 font-bold text-sm">
          Error: {error}
        </div>
      )}

      {/* Data Loaded State using Ionic Grid */}
      {!isLoading && dashboardStats && (
        <IonGrid className="p-0 m-0">
          <IonRow className="mx-[-8px]"> {/* Negative margin to offset Ionic column padding */}
            
            <IonCol size="12" sizeMd="6" sizeLg="3" className="px-2 mb-4">
              <StatCard 
                title="Total Students" 
                value={dashboardStats.totalStudents.toLocaleString('en-IN')} 
                icon={<Users size={24} />} 
                colorClass="bg-blue-50 text-blue-600"
                trend={{ value: '12% this year', isPositive: true }}
              />
            </IonCol>

            <IonCol size="12" sizeMd="6" sizeLg="3" className="px-2 mb-4">
              <StatCard 
                title="Active Teachers" 
                value={dashboardStats.totalTeachers} 
                icon={<GraduationCap size={24} />} 
                colorClass="bg-purple-50 text-purple-600"
                trend={{ value: '3 new', isPositive: true }}
              />
            </IonCol>

            <IonCol size="12" sizeMd="6" sizeLg="3" className="px-2 mb-4">
              <StatCard 
                title="Monthly Revenue" 
                value={formatCurrency(dashboardStats.monthlyRevenue)} 
                icon={<IndianRupee size={24} />} 
                colorClass="bg-emerald-50 text-emerald-600"
              />
            </IonCol>

            <IonCol size="12" sizeMd="6" sizeLg="3" className="px-2 mb-4">
              <StatCard 
                title="Pending Complaints" 
                value={dashboardStats.pendingComplaints} 
                icon={<MessageSquareWarning size={24} />} 
                colorClass="bg-amber-50 text-amber-600"
                trend={{ value: 'Needs action', isPositive: false }}
              />
            </IonCol>

          </IonRow>
        </IonGrid>
      )}
    </AdminLayout>
  );
};

export default Dashboard;