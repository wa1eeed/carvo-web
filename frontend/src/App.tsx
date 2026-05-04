import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import HomePage from './pages/HomePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import PartnersPage from './pages/PartnersPage';
import { useI18n } from './context/I18nContext';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const { dir } = useI18n();

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 antialiased" dir={dir}>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          {/* Root — redirect to /ar by default */}
          <Route path="/" element={<Navigate to="/ar" replace />} />

          {/* Arabic routes */}
          <Route path="/ar" element={<HomePage />} />
          <Route path="/ar/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/ar/partners" element={<PartnersPage />} />

          {/* English routes */}
          <Route path="/en" element={<HomePage />} />
          <Route path="/en/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/en/partners" element={<PartnersPage />} />

          {/* Legacy routes — redirect to /ar */}
          <Route path="/services/:slug" element={<Navigate to="/ar" replace />} />
          <Route path="/partners" element={<Navigate to="/ar/partners" replace />} />

          <Route path="*" element={
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
              <div className="font-display text-6xl mb-3">404</div>
              <p className="text-zinc-500">Page not found.</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
};

export default App;
