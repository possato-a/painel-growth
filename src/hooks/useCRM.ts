import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CRMLead {
  rowId: string;
  leadId: string;
  conversionNum: number;
  data: string;
  hora: string;
  nome: string;
  email: string;
  celular: string;
  cidade: string;
  estado: string;
  disponibilidade: string;
  mqStatus: string;
  page: string;
  source: string;
  campaign: string;
  conjunto: string;
  criativo: string;
  focoCaptacao: string;
  canalTipo: string;
  estagio: string;
  statusPipeline: string;
  motivoPerda: string;
  valor: string;
}

export interface CRMStore {
  lastSync: string | null;
  totalLeads: number;
  uniqueLeads: number;
  leads: CRMLead[];
}

export interface HistoryLead {
  data: string;
  hora: string;
  nome: string;
  email: string;
  celular: string;
  cidade: string;
  estado: string;
  disponibilidade: string;
  mqStatus: string;
  page: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
}

export interface HistoryStore {
  lastSync: string | null;
  totalLeads: number;
  leads: HistoryLead[];
}

async function fetchCRM(): Promise<CRMStore> {
  const res = await fetch('/api/crm/leads');
  if (!res.ok) throw new Error('Erro ao carregar CRM');
  return res.json();
}

export function useCRM() {
  return useQuery({
    queryKey: ['crm'],
    queryFn: fetchCRM,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatchLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      rowId,
      fields,
    }: {
      rowId: string;
      fields: Partial<Pick<CRMLead, 'estagio' | 'statusPipeline' | 'motivoPerda' | 'valor'>>;
    }) => {
      const res = await fetch(`/api/crm/leads/${encodeURIComponent(rowId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm'] });
    },
  });
}

async function fetchHistory(): Promise<HistoryStore> {
  const res = await fetch('/api/crm/history');
  if (!res.ok) throw new Error('Erro ao carregar histórico');
  return res.json();
}

export function useLeadsHistory() {
  return useQuery({
    queryKey: ['crm-history'],
    queryFn: fetchHistory,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSyncCRM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/crm/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao sincronizar');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm'] });
    },
  });
}
