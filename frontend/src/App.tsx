import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { OverviewPage } from './pages/OverviewPage';
import { ForecastPage } from './pages/ForecastPage';
import { AccuracyPage } from './pages/AccuracyPage';
import { PublicationsPage } from './pages/PublicationsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { StatusPage } from './pages/StatusPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/accuracy" element={<AccuracyPage />} />
              <Route path="/publications" element={<PublicationsPage />} />
              <Route path="/methodology" element={<MethodologyPage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
