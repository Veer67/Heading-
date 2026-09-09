import useMarketScanner from '@/hooks/useMarketScanner';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAlerts } from '@/lib/AlertContext';

// Also subscribe to real-time analysis entity events
function AnalysisSubscriber() {
  const { pushAlert } = useAlerts();

  useEffect(() => {
    const unsubscribe = base44.entities.Analysis.subscribe((event) => {
      if (event.type === 'create' && event.data?.signal) {
        pushAlert({
          type: 'analysis',
          id: event.id,
          signal: event.data.signal,
          confidence: event.data.confidence,
          summary: event.data.summary || 'New chart analysis completed',
          model: event.data.model,
        });
      }
    });
    return unsubscribe;
  }, [pushAlert]);

  return null;
}

export default function MarketScannerRunner() {
  useMarketScanner();
  return <AnalysisSubscriber />;
}