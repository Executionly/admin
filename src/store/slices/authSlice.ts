import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdminUser } from '../../types';
import { authApi } from '../../services/api';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user:    localStorage.getItem('admin_user') ? JSON.parse(localStorage.getItem('admin_user')!) : null,
  token:   localStorage.getItem('admin_token') || null,
  loading: false,
  error:   null,
};

export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const res = await authApi.login(email, password);
    return res.data;
  } catch (err: any) {
    console.log("err", err.response?.data?.message)
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const fetchMeThunk = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.me();
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token   = action.payload.access_token;
        state.user    = action.payload.admin;
        localStorage.setItem('admin_token', action.payload.access_token);
        localStorage.setItem('admin_user', JSON.stringify(action.payload.admin));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('admin_user', JSON.stringify(action.payload));
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
