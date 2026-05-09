import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { FacultyEmployee } from '../../types/faculty/directory.schema';

const selectStaff = (state: RootState) => state.facultyDirectory.staff;
const selectSearchQuery = (state: RootState) =>
  state.facultyDirectory.searchQuery.toLowerCase();
const selectFilters = (state: RootState) => state.facultyDirectory.filters;

export const selectFilteredStaff = createSelector(
  [selectStaff, selectSearchQuery, selectFilters],
  (staff, query, filters) => {
    return staff.filter((employee: FacultyEmployee) =>{
      const matchesSearch =
        employee.fullName.toLowerCase().includes(query) ||
        employee.employeeId.toLowerCase().includes(query);

      const matchesDept =
        !filters.department || employee.departmentId === filters.department;
      const matchesStatus =
        !filters.status || employee.status === filters.status;
      const matchesWorkload =
        !filters.workload || employee.workloadStatus === filters.workload;

      return matchesSearch && matchesDept && matchesStatus && matchesWorkload;
    });
  },
);
