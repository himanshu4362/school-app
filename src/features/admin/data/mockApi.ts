// Define the shape of your API responses
export interface DashboardStatsResponse {
  totalStudents: number;
  totalTeachers: number;
  monthlyRevenue: number;
  pendingComplaints: number;
}

// Dummy Data Variables
const DASHBOARD_MOCK_RESPONSE: DashboardStatsResponse = {
  totalStudents: 2543,
  totalTeachers: 142,
  monthlyRevenue: 4520000,
  pendingComplaints: 12,
};

// Fake API Service
export const AdminAPI = {
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(DASHBOARD_MOCK_RESPONSE);
      }, 800); // 800ms delay to simulate network
    });
  },
  
  // You will add more mock endpoints here as we build new pages
  // getStudentsList: async () => { ... }
  // getSyllabusTree: async () => { ... }
};