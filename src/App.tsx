import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Layout } from '@/components/Layout';
import { MetaAdsPage } from '@/pages/MetaAds';
import { FunilPage } from '@/pages/MetaAds/FunilPage';
import { MeioFunilPage } from '@/pages/MetaAds/MeioFunilPage';
import { CriativosPage } from '@/pages/MetaAds/CriativosPage';
import { CRMPage } from '@/pages/CRM/CRMPage';
import { HistoricoPage } from '@/pages/CRM/HistoricoPage';
import { GoogleAdsPage } from '@/pages/GoogleAds';
import { ConversoesPage } from '@/pages/Conversoes';
import { DocsLayout } from '@/pages/Docs/DocsLayout';
import { DocsRouter } from '@/pages/Docs/DocsRouter';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* App routes — wrapped in Layout (sidebar + main) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/meta-ads/geral" replace />} />
            <Route path="/meta-ads/geral"     element={<MetaAdsPage />} />
            <Route path="/meta-ads/funil"     element={<FunilPage />} />
            <Route path="/meta-ads/meio-funil" element={<MeioFunilPage />} />
            <Route path="/meta-ads/criativos" element={<CriativosPage />} />
            <Route path="/google-ads/geral"   element={<GoogleAdsPage />} />
            <Route path="/meta-ads/conversoes" element={<ConversoesPage />} />
            <Route path="/crm"               element={<CRMPage />} />
            <Route path="/crm/historico"     element={<HistoricoPage />} />
          </Route>

          {/* Docs routes — wrapped in DocsLayout (own topbar + sidebar) */}
          <Route path="/docs" element={<DocsLayout />}>
            <Route path="*" element={<DocsRouter />} />
          </Route>

          <Route path="*" element={<Navigate to="/meta-ads/geral" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
