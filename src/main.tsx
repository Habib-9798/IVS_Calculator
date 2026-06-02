import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import App from './App';
import LoginPage from './LoginPage';
import CSRDashboard from './components/CSRDashboard';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function AppRoutes() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7a1f2b]/20 border-t-[#7a1f2b] rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (profile.role === 'admin') {
    return (
      <Routes>
        <Route path="/calculator" element={<App />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/calculator" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/calculator" element={<App />} />
      <Route path="/my-history" element={<CSRDashboard />} />
      <Route path="*" element={<Navigate to="/calculator" replace />} />
    </Routes>
  );
}

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);
