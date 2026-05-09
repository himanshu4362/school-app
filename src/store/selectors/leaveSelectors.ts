import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectAllLeaves = (state: RootState) => state.leave.requests;
const selectLeaveFilter = (state: RootState) => state.leave.filterStatus;
const selectAllStaff = (state: RootState) => state.facultyDirectory.staff;

export const selectFilteredLeaveInbox = createSelector(
  [selectAllLeaves, selectLeaveFilter, selectAllStaff],
  (requests, filter, staff) => {
    // 1. Convert to Array and Sort by Newest First
    const requestArray = Object.values(requests).sort((a, b) => 
      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );

    // 2. Filter by Status
    const filtered = filter === 'all' 
      ? requestArray 
      : requestArray.filter(req => req.status === filter);

    // 3. Hydrate with Employee Names for the UI
    return filtered.map(req => {
      const employee = staff.find(s => s.id === req.employeeId);
      return {
        ...req,
        employeeName: employee?.fullName || 'Unknown Employee',
        employeeCode: employee?.employeeId || 'Unknown ID',
        employeePhoto: employee?.profilePhoto || null,
        department: employee?.departmentId || 'Unknown Dept'
      };
    });
  }
);