import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectAllRecordsById = (state: RootState) => state.attendance.recordsById;
const selectRecordsByEmployee = (state: RootState) => state.attendance.recordsByEmployee;

export const selectEmployeeAttendanceHistory = (employeeId: string) => createSelector(
  [selectAllRecordsById, selectRecordsByEmployee],
  (recordsById, byEmployeeIndex) => {
    const recordIds = byEmployeeIndex[employeeId] || [];
    // Memoization prevents re-sorting on every call unless the array changes
    return recordIds.map(id => recordsById[id]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
);

export const selectEmployeeAttendanceAnalytics = (employeeId: string) => createSelector(
  [selectEmployeeAttendanceHistory(employeeId)],
  (history) => {
    if (history.length === 0) return { presentCount: 0, absentCount: 0, lateCount: 0, halfDayCount: 0, attendancePercentage: 0 };

    let presentWeight = 0;
    let absent = 0;
    let late = 0;
    let halfDays = 0;

    history.forEach(record => {
      if (record.status === 'present') {
        if (record.modifiers.isHalfDay) {
           presentWeight += 0.5;
           halfDays++;
        } else {
           presentWeight += 1;
        }
      }
      if (record.status === 'absent') absent++;
      if (record.modifiers.isLate) late++;
    });

    // Policy: Exclude 'leave' from denominator for now.
    const totalOperationalDays = presentWeight + absent; 
    const attendancePercentage = totalOperationalDays === 0 ? 0 : Math.round((presentWeight / totalOperationalDays) * 100);

    return {
      presentCount: presentWeight, // Displays 10.5 days etc.
      absentCount: absent,
      lateCount: late,
      halfDayCount: halfDays,
      attendancePercentage
    };
  }
);