import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function RefreshControl() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = useCallback(async () => {
    setSpinning(true);
    await queryClient.invalidateQueries({ queryKey: ['meta'] });
    setLastUpdated(new Date());
    setTimeout(() => setSpinning(false), 600);
  }, [queryClient]);

  const timeStr = lastUpdated.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-notion-text-tertiary">
        Atualizado às {timeStr}
      </span>
      <button
        onClick={handleRefresh}
        title="Atualizar dados"
        className="flex items-center justify-center w-7 h-7 rounded hover:bg-notion-bg-tertiary text-notion-text-tertiary hover:text-notion-text-secondary transition-colors duration-[120ms]"
      >
        <RefreshCw
          size={13}
          className={spinning ? 'animate-spin' : ''}
        />
      </button>
    </div>
  );
}
