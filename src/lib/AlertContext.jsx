import { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);

  const pushAlert = useCallback((alert) => {
    setAlerts(prev => [{ ...alert, id: alert.id || `${Date.now()}-${Math.random()}`, timestamp: new Date(), read: false }, ...prev].slice(0, 30));
    setUnread(prev => prev + 1);
  }, []);

  const dismiss = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), []);

  const clearAll = useCallback(() => { setAlerts([]); setUnread(0); }, []);

  const markAllRead = useCallback(() => setUnread(0), []);

  return (
    <AlertContext.Provider value={{ alerts, unread, pushAlert, dismiss, clearAll, markAllRead }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider');
  return ctx;
}