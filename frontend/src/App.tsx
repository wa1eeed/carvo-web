import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import HomePage from './pages/HomePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import PartnersPage from './pages/PartnersPage';
import { useI18n } from './context/I18nContext';

const App: React.FC = () => {
  const { dir } = useI18n();
  // Reset page title when on homepage
  React.useEffect(() => {
    if (window.location.pathname === '/') {
      document.title = 'CARVO | خدمات لوجستية متكاملة للمركبات';
    }
  });
  return (
    <div className="relative min-h-screen bg-white text-zinc-900 antialiased" dir={dir}>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/partners" element={<PartnersPage />} />
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
