import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:   (email: string, password: string) => api.post('/admin/auth/login', { email, password }),
  me:      () => api.get('/admin/auth/me'),
  logout:  () => api.post('/admin/auth/logout'),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  getStats:     () => api.get('/admin/dashboard/stats'),
  getChartData: (period: string) => api.get(`/admin/dashboard/chart?period=${period}`),
};

// ── Users ─────────────────────────────────────────────────────
export const usersApi = {
  getAll:       (params: any) => api.get('/admin/users', { params }),
  getOne:       (id: string)  => api.get(`/admin/users/${id}`),
  updatePlan:   (id: string, plan: string, billing_period: string) => api.patch(`/admin/users/${id}/plan`, { plan, billing_period }),
  resetUsage:   (id: string)  => api.post(`/admin/users/${id}/reset-usage`),
  toggleActive: (id: string)  => api.patch(`/admin/users/${id}/toggle-active`),
  deleteUser:   (id: string)  => api.delete(`/admin/users/${id}`),
};

// ── Revenue ───────────────────────────────────────────────────
export const revenueApi = {
  getStats:         () => api.get('/admin/revenue/stats'),
  getSubscriptions: (params: any) => api.get('/admin/revenue/subscriptions', { params }),
  getTransactions:  (params: any) => api.get('/admin/revenue/transactions', { params }),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsApi = {
  getVisitors:  (period: string) => api.get(`/admin/analytics/visitors?period=${period}`),
  getVisitorsChart:  (period: string) => api.get(`/admin/analytics/visitors/chart?period=${period}`),
  getEvents:    (params: any)    => api.get('/admin/analytics/events', { params }),
  getTopPages:  () => api.get('/admin/analytics/top-pages'),
};

// ── Support ───────────────────────────────────────────────────
export const supportApi = {
  getTickets:   (params: any)   => api.get('/admin/support/tickets', { params }),
  getTicket:    (id: string)    => api.get(`/admin/support/tickets/${id}`),
  updateTicket: (id: string, data: any) => api.patch(`/admin/support/tickets/${id}`, data),
  replyTicket:  (id: string, message: string) => api.post(`/admin/support/tickets/${id}/reply`, { message }),
};

// ── Chat ──────────────────────────────────────────────────────
export const chatApi = {
  getMessages: (page: number) => api.get(`/admin/chat/messages?page=${page}`),
  sendMessage: (message: string) => api.post('/admin/chat/messages', { message }),
};

// ── Affiliates ────────────────────────────────────────────────
export const affiliatesApi = {
  getAll:    (params: any) => api.get('/admin/affiliates', { params }),
  getAllWithdrawals:    (params: any) => api.get('/admin/affiliates/withdrawals', { params }),
  getOne:    (id: string)  => api.get(`/admin/affiliates/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/admin/affiliates/${id}/status`, { status }),
  payout:    (id: string, action: 'approve' | 'reject')    => api.post(`/admin/affiliates/${id}/payout`, { status }),
};

// ── Admins ────────────────────────────────────────────────────
export const adminsApi = {
  getAll:   (params: any) => api.get('/admin/admins', { params }),
  create:   (data: any)   => api.post('/admin/admins', data),
  update:   (id: string, data: any) => api.patch(`/admin/admins/${id}`, data),
  delete:   (id: string)  => api.delete(`/admin/admins/${id}`),
  toggleActive: (id: string) => api.patch(`/admin/admins/${id}/toggle-active`),
};

// ── Logs ──────────────────────────────────────────────────────
export const logsApi = {
  getAll: (params: any) => api.get('/admin/logs', { params }),
};
