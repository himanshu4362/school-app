import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import DailyAttendanceGrid from '../../components/faculty/attendance/DailyAttendanceGrid';

const StaffAttendancePage: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Daily Attendance Ledger" 
      pageDescription="Manage, verify, and override daily workforce attendance records."
      breadcrumbs={[{ label: 'Workforce' }, { label: 'Attendance Ledger' }]}
    >
      {/* We drop our Grid Component right into the layout */}
      <DailyAttendanceGrid />
    </AdminLayout>
  );
};

export default StaffAttendancePage;