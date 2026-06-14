import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { Assessment } from './pages/Assessment';
import { Analysis } from './pages/Analysis';
import { Results } from './pages/Results';
import { ImpactReport } from './pages/ImpactReport';
import { ActionCenter } from './pages/ActionCenter';
import { ImpactLedger } from './pages/ImpactLedger';
import { About } from './pages/About';

// Scroll to top of page on route change helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-dark-bg text-white selection:bg-brand-orange/30 selection:text-white">
        
        {/* Navigation bar */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/results" element={<Results />} />
            <Route path="/impact" element={<ImpactReport />} />
            <Route path="/action-center" element={<ActionCenter />} />
            <Route path="/impact-ledger" element={<ImpactLedger />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* Footer block */}
        <Footer />

      </div>
    </Router>
  );
};

export default App;
