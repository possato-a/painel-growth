import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Layout } from '@/components/Layout';
import { MetaAdsPage } from '@/pages/MetaAds';
import { FunilPage } from '@/pages/MetaAds/FunilPage';
import { MeioFunilPage } from '@/pages/MetaAds/MeioFunilPage';
import { CriativosPage } from '@/pages/MetaAds/CriativosPage';
import { DocsPage } from '@/pages/Docs/DocsPage';
import { CRMPage } from '@/pages/CRM/CRMPage';
import { HistoricoPage } from '@/pages/CRM/HistoricoPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/meta-ads/geral" replace />} />
            <Route path="/meta-ads/geral" element={<MetaAdsPage />} />
            <Route path="/meta-ads/funil" element={<FunilPage />} />
            <Route path="/meta-ads/meio-funil" element={<MeioFunilPage />} />
            <Route path="/meta-ads/criativos" element={<CriativosPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/crm" element={<CRMPage />} />
            <Route path="/crm/historico" element={<HistoricoPage />} />
            <Route path="*" element={<Navigate to="/meta-ads/geral" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
