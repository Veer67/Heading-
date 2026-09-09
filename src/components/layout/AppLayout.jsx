import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileSidebar from './MobileSidebar';
import MarketScannerRunner from './MarketScannerRunner';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Corner decorations */}
      <div className="fixed top-3 left-3 w-8 h-8 border-l border-t border-primary/20 pointer-events-none z-50" />
      <div className="fixed top-3 right-3 w-8 h-8 border-r border-t border-primary/20 pointer-events-none z-50" />
      <div className="fixed bottom-3 left-3 w-8 h-8 border-l border-b border-primary/20 pointer-events-none z-50" />
      <div className="fixed bottom-3 right-3 w-8 h-8 border-r border-b border-primary/20 pointer-events-none z-50" />

      {/* Background glow */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <MarketScannerRunner />
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileHeader />
      <MobileSidebar />

      <main className="md:ml-64 min-h-screen pt-14 md:pt-0 pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}