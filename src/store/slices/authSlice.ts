import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// 1. Import your new API instance instead of standard axios
import api from '../../services/api'; // Adjust the relative path if needed

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isFirstLogin: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: any, { rejectWithValue }) => {
    try {
      // 2. Use 'api.post' and drop the BASE_URL
      const response = await api.post('/api/auth/login', credentials);
      
      const responseData = response.data.data;
      localStorage.setItem('token', responseData.token);
      
      return responseData;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const setupNewPassword = createAsyncThunk(
  'auth/setupNewPassword',
  // 3. We no longer need 'getState' to manually fetch the token!
  async (newPassword: string, { rejectWithValue }) => {
    try {
      // 4. Look how clean this is now! The interceptor adds the token automatically.
      const response = await api.post('/api/auth/setup-password', { newPassword });
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Password setup failed';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isFirstLogin = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isFirstLogin = action.payload.isFirstLogin;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(setupNewPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setupNewPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isFirstLogin = false;
      })
      .addCase(setupNewPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;