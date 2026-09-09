import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LineChart, Target, Newspaper, MessageSquare, User, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/Dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/Charts', label: 'Charts', icon: BarChart3 },
  { path: '/Analyze', label: 'Analyze', icon: LineChart },
  { path: '/Backtest', label: 'Test', icon: Activity },
  { path: '/Profile', label: 'Profile', icon: User },
];

export default function MobileSidebar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ background: 'hsl(var(--sidebar-background))', borderTop: '1px solid hsl(var(--sidebar-border))' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={cn('flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all',
                isActive ? 'text-blue-400' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-mono">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}