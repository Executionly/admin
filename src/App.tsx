import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage       from './components/pages/Login';
import DashboardPage   from './components/pages/dashboard/DashboardPage';
import UsersPage       from './components/pages/users/UsersPage';
import RevenuePage     from './components/pages/revenue/RevenuePage';
import AnalyticsPage   from './components/pages/analytics/AnalyticsPage';
import SupportPage     from './components/pages/support/SupportPage';
import ChatPage        from './components/pages/chat/ChatPage';
import AffiliatesPage  from './components/pages/affiliates/AffiliatesPage';
import AdminsPage      from './components/pages/admins/AdminsPage';
import LogsPage        from './components/pages/logs/LogsPage';
import SettingsPage    from './components/pages/settings/SettingsPage';
import PlansPage from './components/pages/plans/PlansPage';
import ErrorLogsPage from './components/pages/error-logs/ErrorLogs';
import ChangePasswordPage from './components/pages/change-password/ChangePassword';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1C1C28', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', fontSize: '13px' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"  element={<ProtectedRoute permission="VIEW_DASHBOARD">  <DashboardPage />  </ProtectedRoute>} />
            <Route path="analytics"  element={<ProtectedRoute permission="VIEW_ANALYTICS">  <AnalyticsPage />  </ProtectedRoute>} />
            <Route path="users"      element={<ProtectedRoute permission="VIEW_USERS">       <UsersPage />      </ProtectedRoute>} />
            <Route path="revenue"    element={<ProtectedRoute permission="VIEW_REVENUE">     <RevenuePage />    </ProtectedRoute>} />
            <Route path="support"    element={<ProtectedRoute permission="VIEW_SUPPORT">     <SupportPage />    </ProtectedRoute>} />
            <Route path="chat"       element={<ProtectedRoute permission="VIEW_CHAT">        <ChatPage />       </ProtectedRoute>} />
            <Route path="affiliates" element={<ProtectedRoute permission="VIEW_AFFILIATES">  <AffiliatesPage /> </ProtectedRoute>} />
            <Route path="admins"     element={<ProtectedRoute permission="VIEW_ADMINS">      <AdminsPage />     </ProtectedRoute>} />
            <Route path="logs"       element={<ProtectedRoute permission="VIEW_LOGS">        <LogsPage />       </ProtectedRoute>} />
            <Route path="settings"   element={<ProtectedRoute permission="VIEW_SETTINGS">    <SettingsPage />   </ProtectedRoute>} />
            <Route path="plans"   element={<ProtectedRoute permission="VIEW_PLANS">    <PlansPage />   </ProtectedRoute>} />
            <Route path="error-logs" element={
              <ProtectedRoute permission="VIEW_ERROR_LOGS"><ErrorLogsPage /></ProtectedRoute>
            } />
            <Route path="change-password" element={
              <ProtectedRoute permission="CHANGE_PASSWORD"><ChangePasswordPage /></ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
