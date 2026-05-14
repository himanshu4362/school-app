import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// 1. Import your new API instance instead of standard axios
import api from "../../services/api"; // Adjust the relative path if needed

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  isLoading: boolean;
  error: string | null;
}

const storedToken = localStorage.getItem("accessToken");
const storedUser = localStorage.getItem("user");

const initialState: AuthState = {
  token: storedToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,
  isFirstLogin: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "/auth/loginUser",
  async (values: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await api.post("/api/auth/login", values);

      const payload = response.data.data;

      localStorage.setItem("accessToken", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));

      return payload;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed",
      );
    }
  },
);

export const setupNewPassword = createAsyncThunk(
  "/auth/setupPassword",
  async (newPassword: string, thunkAPI) => {
    try {
      const response = await api.post("/api/auth/setup-password", { newPassword });

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to setup password",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isFirstLogin = false;
    },
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
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
