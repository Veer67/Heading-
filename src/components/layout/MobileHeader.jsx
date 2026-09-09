import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, TrendingUp, Sun, Moon, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard, LineChart, Target, Newspaper, MessageSquare,
  BarChart3, Activity, FlaskConical, Info, Phone, GraduationCap
} from 'lucide-react';

const navItems = [
  { path: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/Charts', label: 'Live Charts', icon: BarChart3 },
  { path: '/Analyze', label: 'Analyze', icon: LineChart },
  { path: '/Backtest', label: 'Backtest', icon: Activity },
  { path: '/Chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/Strategies', label: 'Strategies', icon: Target },
  { path: '/PaperTrading', label: 'Paper Trading', icon: FlaskConical },
  { path: '/Learn', label: 'Learn', icon: GraduationCap },
  { path: '/MarketNews', label: 'Market News', icon: Newspaper },
  { path: '/About', label: 'About', icon: Info },
  { path: '/Contact', label: 'Contact', icon: Phone },
];

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const isLight = theme === 'light';

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-sidebar"
        style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
      >
        <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/Dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(217 100% 20%), hsl(217 100% 12%))', border: '1px solid hsl(217 100% 30%)' }}
          >
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <h1 className="text-xs font-black tracking-wider shimmer-text">TRADE-AI-ZOTRA</h1>
        </Link>

        <button onClick={toggle} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
          {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </header>

      {/* Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 max-w-[80vw] bg-sidebar flex flex-col"
            style={{ borderRight: '1px solid hsl(var(--sidebar-border))' }}
          >
            <div className="h-14 flex items-center justify-between px-4"
              style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
            >
              <span className="text-sm font-black tracking-wider shimmer-text">TRADE-AI-ZOTRA</span>
              <button onClick={() => setOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
                    className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 space-y-1" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
              <Link to="/Profile" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-xs font-black text-blue-400">
                  {user?.full_name?.[0]?.toUpperCase() || <User className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{user?.full_name || 'My Profile'}</p>
                  <p className="text-[9px] font-mono text-muted-foreground truncate">{user?.email}</p>
                </div>
              </Link>
              <button onClick={() => base44.auth.logout()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground/60 hover:text-destructive hover:bg-secondary"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}