import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './lib/auth';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import AIPage from './pages/AIPage';
import FaqsPage from './pages/FaqsPage';
import ContentPage from './pages/ContentPage';
import LeadsPage from './pages/LeadsPage';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-xs tracking-widest uppercase text-zinc-400">Loading…</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/faqs" element={<FaqsPage />} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="*" element={
          <div className="text-center py-20 text-zinc-400">Page not found.</div>
        } />
      </Route>
    </Routes>
  );
};

export default App;
