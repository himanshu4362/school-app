import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdminAPI, DashboardStatsResponse } from '../data/mockApi';

// 1. Define the state shape
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

// 2. Create Async Thunk for fetching data
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AdminAPI.getDashboardStats();
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch dashboard stats');
    }
  }
);

// 3. Create the Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Synchronous actions go here (e.g., clearing state)
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