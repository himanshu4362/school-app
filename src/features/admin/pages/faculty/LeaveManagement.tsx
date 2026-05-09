import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import LeaveInbox from '../../components/faculty/leave/LeaveInbox';
import LeaveReviewModal from '../../components/faculty/leave/LeaveReviewModal'; // <-- IMPORT THIS

const LeaveManagementPage: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Leave Requests Inbox" 
      pageDescription="Review and approve faculty leave requests to update daily attendance automatically."
      breadcrumbs={[{ label: 'Workforce' }, { label: 'Leave Management' }]}
    >
      <LeaveInbox />
      
      {/* Drop the modal here. It is invisible until an item is selected. */}
      <LeaveReviewModal /> 
    </AdminLayout>
  );
};

export default LeaveManagementPage;