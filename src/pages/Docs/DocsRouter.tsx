import { Routes, Route, Navigate } from 'react-router-dom';
import { OverviewPage } from './pages/OverviewPage';
import { ComoFuncionaPage } from './pages/ComoFuncionaPage';
import { ClassificacaoLeadsPage } from './pages/ClassificacaoLeadsPage';
import { AutoEvolucaoPage } from './pages/AutoEvolucaoPage';
import { SincronizacaoPage } from './pages/SincronizacaoPage';
import { FontesDadosPage } from './pages/FontesDadosPage';
import { PaginasCanalPage } from './pages/PaginasCanalPage';
import { RegrasIdPage } from './pages/RegrasIdPage';
import { ExclusoesPage } from './pages/ExclusoesPage';
import { CidadesPage } from './pages/CidadesPage';
import { GoogleAdsPage } from './pages/GoogleAdsPage';

export function DocsRouter() {
  return (
    <Routes>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview"            element={<OverviewPage />} />
      <Route path="como-funciona"       element={<ComoFuncionaPage />} />
      <Route path="classificacao-leads" element={<ClassificacaoLeadsPage />} />
      <Route path="auto-evolucao"       element={<AutoEvolucaoPage />} />
      <Route path="sincronizacao"       element={<SincronizacaoPage />} />
      <Route path="fontes-dados"        element={<FontesDadosPage />} />
      <Route path="paginas-canal"       element={<PaginasCanalPage />} />
      <Route path="regras-id"           element={<RegrasIdPage />} />
      <Route path="exclusoes"           element={<ExclusoesPage />} />
      <Route path="cidades"             element={<CidadesPage />} />
      <Route path="google-ads"          element={<GoogleAdsPage />} />
      <Route path="*"                   element={<Navigate to="overview" replace />} />
    </Routes>
  );
}
