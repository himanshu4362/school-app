import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface DashboardStatsResponse {
  totalStudents: number;
  totalTeachers: number;
  monthlyRevenue: number;
  pendingComplaints: number;
}

interface AdminState {
  dashboardStats: DashboardStatsResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  dashboardStats: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/dashboard/stats');
      return response.data.data as DashboardStatsResponse;
    } catch (error) {
      console.log("Error :", error)
      return rejectWithValue('Failed to fetch dashboard stats');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminData: (state) => {
      state.dashboardStats = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStatsResponse>) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;