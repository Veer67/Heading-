import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, LineChart, Target, Newspaper, MessageSquare, User, Sun, Moon, LogOut, BarChart3, Activity, Info, Phone, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import AlertsPanel from '../alerts/AlertsPanel';

const navItems = [
  { path: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/Charts', label: 'Live Charts', icon: BarChart3 },
  { path: '/Analyze', label: 'Analyze', icon: LineChart },
  { path: '/Backtest', label: 'Backtest', icon: Activity },
  { path: '/Chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/Strategies', label: 'Strategies', icon: Target },
  { path: '/Learn', label: 'Learn', icon: GraduationCap },
  { path: '/MarketNews', label: 'Market News', icon: Newspaper },
  { path: '/About', label: 'About', icon: Info },
  { path: '/Contact', label: 'Contact', icon: Phone },
];

export default function Sidebar() {
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  const isLight = theme === 'light';

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col bg-sidebar"
      style={{ borderRight: '1px solid hsl(var(--sidebar-border))' }}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      {/* Logo */}
      <div className="p-5 pb-4" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        <Link to="/Dashboard" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(217 100% 20%), hsl(217 100% 12%))', border: '1px solid hsl(217 100% 30%)' }}
          >
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider shimmer-text">TRADE-AI-ZOTRA</h1>
            <p className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground">ZTRA · AI TRADING</p>
          </div>
        </Link>
      </div>

      {/* Nav label */}
      <div className="px-4 pt-4 pb-1.5">
        <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground/50">Navigation</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive ? 'text-blue-400' : 'text-muted-foreground hover:text-foreground'
              )}
              style={isActive ? {
                background: isLight ? 'hsl(217 100% 58% / 0.08)' : 'hsl(217 100% 58% / 0.1)',
                border: '1px solid hsl(217 100% 58% / 0.2)',
              } : { border: '1px solid transparent' }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-blue-400"
                  style={{ boxShadow: '0 0 8px hsl(217 100% 58%)' }} />
              )}
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                isActive ? 'bg-blue-500/15' : 'group-hover:bg-secondary'
              )}>
                <item.icon className="w-3.5 h-3.5" />
              </div>
              <span>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/50" />

      {/* Bottom section */}
      <div className="p-3 space-y-2">
        {/* Scanner status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'hsl(142 60% 20% / 0.12)', border: '1px solid hsl(142 60% 20% / 0.25)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-[9px] font-mono text-emerald-400 flex-1">Scanner active · 5m</span>
          <AlertsPanel />
        </div>

        {/* Theme toggle */}
        <button onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        {/* Profile link */}
        <Link to="/Profile"
          className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            location.pathname === '/Profile' ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-xs font-black text-blue-400 flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase() || <User className="w-3.5 h-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user?.full_name || 'My Profile'}</p>
            <p className="text-[9px] font-mono text-muted-foreground truncate">{user?.email}</p>
          </div>
        </Link>

        {/* Logout */}
        <button
          onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground/50 hover:text-destructive transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}