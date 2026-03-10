export interface Insight {
  type: 'success' | 'warning' | 'alert' | 'info';
  title: string;
  body: string;
}

export interface StageData {
  label: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  cpc: number;
  reach: number;
  count: number;
}

export function generateFunnelInsights(
  topo: StageData,
  meio: StageData,
  fundo: StageData
): Insight[] {
  const insights: Insight[] = [];
  const total = topo.spend + meio.spend + fundo.spend;

  if (total === 0) return [];

  const topoPct = (topo.spend / total) * 100;
  const meioPct = (meio.spend / total) * 100;
  const fundoPct = (fundo.spend / total) * 100;

  // Budget balance
  if (topoPct > 60) {
    insights.push({
      type: 'warning',
      title: 'Concentração excessiva no Topo',
      body: `${topoPct.toFixed(0)}% do orçamento está em topo de funil. Uma distribuição saudável sugere 40-50% no topo, 30-40% no meio e 15-25% no fundo. Considere aumentar o investimento em conversão.`,
    });
  } else if (topoPct < 25) {
    insights.push({
      type: 'info',
      title: 'Baixo investimento em geração de demanda',
      body: `Apenas ${topoPct.toFixed(0)}% do budget está em topo de funil. Com pouca aquisição nova, o pipeline pode secar nas próximas semanas.`,
    });
  }

  if (fundoPct > 40) {
    insights.push({
      type: 'info',
      title: 'Alta concentração em Fundo de Funil',
      body: `${fundoPct.toFixed(0)}% do orçamento em fundo/retargeting. Isso indica uma estratégia agressiva de conversão — verifique se o volume de leads no topo está sustentando esse ritmo.`,
    });
  }

  if (meioPct > 0 && fundo.spend > 0) {
    const ratio = meio.spend / fundo.spend;
    if (ratio < 1) {
      insights.push({
        type: 'warning',
        title: 'Funil invertido detectado',
        body: `Você está gastando mais em fundo (R$ ${fundo.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) do que em meio (R$ ${meio.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Isso pode saturar a audiência quente sem reabastecimento suficiente.`,
      });
    }
  }

  // CTR analysis per stage
  if (topo.ctr > 0 && meio.ctr > 0) {
    if (topo.ctr > meio.ctr * 2) {
      insights.push({
        type: 'success',
        title: 'Excelente engajamento no Topo',
        body: `CTR no topo (${topo.ctr.toFixed(2)}%) está ${(topo.ctr / meio.ctr).toFixed(1)}x maior que no meio. Os criativos de awareness estão gerando interesse acima da média.`,
      });
    }
  }

  // CPM comparison
  if (fundo.cpm > 0 && topo.cpm > 0) {
    if (fundo.cpm > topo.cpm * 2) {
      insights.push({
        type: 'alert',
        title: 'CPM alto no Fundo de Funil',
        body: `Custo por mil impressões no fundo (R$ ${fundo.cpm.toFixed(2)}) está ${(fundo.cpm / topo.cpm).toFixed(1)}x mais caro que no topo. Audiências de retargeting saturadas custam mais — considere ampliar ou refrescar as listas.`,
      });
    }
  }

  return insights;
}

export function generateMidFunnelInsights(
  types: Record<string, StageData>
): Insight[] {
  const insights: Insight[] = [];
  const entries = Object.entries(types).filter(([, v]) => v.spend > 0);
  if (entries.length < 2) return [];

  const sorted = [...entries].sort((a, b) => b[1].ctr - a[1].ctr);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  if (best && worst && best[0] !== worst[0]) {
    insights.push({
      type: 'success',
      title: `${best[1].label} com melhor engajamento`,
      body: `CTR de ${best[1].ctr.toFixed(2)}% — ${(best[1].ctr / worst[1].ctr).toFixed(1)}x melhor que ${worst[1].label} (${worst[1].ctr.toFixed(2)}%). Avalie aumentar o budget no formato mais eficiente.`,
    });
  }

  const sortedByCpl = [...entries].sort((a, b) => a[1].cpc - b[1].cpc);

  if (sortedByCpl.length >= 2) {
    const cheapest = sortedByCpl[0];
    insights.push({
      type: 'info',
      title: `${cheapest[1].label} com menor custo por clique`,
      body: `CPC médio de R$ ${cheapest[1].cpc.toFixed(2)} — o mais eficiente entre os tipos de meio de funil. Bom candidato para escalar.`,
    });
  }

  return insights;
}

export function generateGeneralInsights(data: {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  avgCpm: number;
  avgCpc: number;
  dailyData: Array<{
    spend: number;
    impressions: number;
    clicks: number;
    date: string;
  }>;
}): Insight[] {
  const insights: Insight[] = [];

  // CTR benchmark
  if (data.avgCtr < 1.0) {
    insights.push({
      type: 'warning',
      title: 'CTR abaixo do benchmark de mercado',
      body: `CTR médio de ${data.avgCtr.toFixed(2)}% está abaixo dos 1-2% esperados para campanhas de performance. Revise os criativos — imagens e copys podem estar sem apelo para a audiência.`,
    });
  } else if (data.avgCtr > 3.0) {
    insights.push({
      type: 'success',
      title: 'CTR excepcional',
      body: `${data.avgCtr.toFixed(2)}% de CTR — muito acima do benchmark. Os criativos estão ressoando bem com a audiência.`,
    });
  }

  // CPM analysis
  if (data.avgCpm > 50) {
    insights.push({
      type: 'alert',
      title: 'CPM elevado',
      body: `R$ ${data.avgCpm.toFixed(2)} por mil impressões indica alto custo de leilão. Isso pode ser sinal de audiências muito concorridas ou saturadas. Tente expandir a segmentação ou testar novas audiências.`,
    });
  }

  // Spend trend
  if (data.dailyData.length >= 7) {
    const last7 = data.dailyData.slice(-7);
    const prev7 = data.dailyData.slice(-14, -7);
    if (prev7.length === 7) {
      const last7Spend = last7.reduce((a, b) => a + b.spend, 0);
      const prev7Spend = prev7.reduce((a, b) => a + b.spend, 0);
      if (prev7Spend > 0) {
        const changePct = ((last7Spend - prev7Spend) / prev7Spend) * 100;
        if (changePct > 30) {
          insights.push({
            type: 'info',
            title: 'Investimento acelerado na última semana',
            body: `Gasto aumentou ${changePct.toFixed(0)}% nos últimos 7 dias vs semana anterior (R$ ${last7Spend.toFixed(2)} vs R$ ${prev7Spend.toFixed(2)}). Verifique se é intencional e monitore a performance.`,
          });
        } else if (changePct < -30) {
          insights.push({
            type: 'warning',
            title: 'Queda significativa no investimento',
            body: `Gasto caiu ${Math.abs(changePct).toFixed(0)}% nos últimos 7 dias. Campanhas podem estar limitadas por orçamento, desaprovadas ou com problemas de entrega.`,
          });
        }
      }
    }
  }

  return insights;
}
