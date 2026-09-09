import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Shield, BarChart3, Target, TrendingUp, Edit2, Save, X, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSEO } from '@/lib/useSEO';

export default function Profile() {
  useSEO({
    title: 'Trader Profile',
    description: 'Manage your Trade AI Zotra trader profile, track your analysis history, strategies, and trading performance statistics.',
    keywords: 'trader profile, trading dashboard, performance stats, Trade AI Zotra account, trading history',
  });

  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [tradingStyle, setTradingStyle] = useState(user?.trading_style || '');
  const [saving, setSaving] = useState(false);

  const { data: analyses = [] } = useQuery({ queryKey: ['analyses'], queryFn: () => base44.entities.Analysis.list('-created_date', 100) });
  const { data: strategies = [] } = useQuery({ queryKey: ['strategies'], queryFn: () => base44.entities.Strategy.list('-created_date', 50) });

  const myAnalyses = analyses.filter(a => a.created_by_id === user?.id);
  const avgConf = myAnalyses.length > 0 ? Math.round(myAnalyses.reduce((s, a) => s + (a.confidence || 0), 0) / myAnalyses.length) : 0;
  const buySignals = myAnalyses.filter(a => a.signal === 'buy' || a.signal === 'call').length;
  const winRate = myAnalyses.length > 0 ? Math.round((buySignals / myAnalyses.length) * 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ bio, trading_style: tradingStyle });
    setSaving(false);
    setEditing(false);
  };

  const styles = ['Scalper', 'Day Trader', 'Swing Trader', 'Position Trader', 'Options Trader'];

  const stats = [
    { label: 'Total Analyses', value: myAnalyses.length, icon: BarChart3, color: 'blue' },
    { label: 'Strategies', value: strategies.length, icon: Target, color: 'purple' },
    { label: 'Avg Confidence', value: `${avgConf}%`, icon: TrendingUp, color: 'green' },
    { label: 'Bullish Signals', value: `${winRate}%`, icon: TrendingUp, color: 'amber' },
  ];

  const colorMap = {
    blue: { bg: 'hsl(217 100% 58% / 0.1)', border: 'hsl(217 100% 58% / 0.2)', text: 'text-blue-400' },
    purple: { bg: 'hsl(265 70% 58% / 0.1)', border: 'hsl(265 70% 58% / 0.2)', text: 'text-purple-400' },
    green: { bg: 'hsl(142 70% 45% / 0.1)', border: 'hsl(142 70% 45% / 0.2)', text: 'text-emerald-400' },
    amber: { bg: 'hsl(38 92% 55% / 0.1)', border: 'hsl(38 92% 55% / 0.2)', text: 'text-amber-400' },
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-7"
        style={{ background: 'hsl(222 55% 6%)', border: '1px solid hsl(217 100% 58% / 0.2)', boxShadow: '0 0 40px hsl(217 100% 58% / 0.07)' }}
      >
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(217 100% 58% / 0.1), transparent 70%)' }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
              style={{ background: 'linear-gradient(135deg, hsl(217 100% 25%), hsl(217 100% 15%))', border: '2px solid hsl(217 100% 40%)', boxShadow: '0 0 20px hsl(217 100% 58% / 0.3)' }}
            >
              {user?.full_name?.[0]?.toUpperCase() || <User className="w-8 h-8 text-blue-400" />}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-black text-foreground">{user?.full_name || 'Trader'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-mono">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-mono px-2 py-0.5 rounded-full capitalize"
                style={{ background: 'hsl(217 100% 58% / 0.1)', border: '1px solid hsl(217 100% 58% / 0.2)', color: 'hsl(217 80% 70%)' }}
              >{user?.role || 'user'}</span>
              {tradingStyle && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{ background: 'hsl(265 70% 58% / 0.1)', border: '1px solid hsl(265 70% 58% / 0.2)', color: 'hsl(265 70% 70%)' }}
                >{tradingStyle}</span>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}
            className={cn('gap-1.5 text-xs', editing ? 'text-destructive' : 'text-muted-foreground')}
          >
            {editing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {/* Edit Form */}
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 space-y-4 pt-5"
            style={{ borderTop: '1px solid hsl(217 75% 14%)' }}
          >
            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1.5 block uppercase tracking-wider">Trading Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map(s => (
                  <button key={s} onClick={() => setTradingStyle(s === tradingStyle ? '' : s)}
                    className={cn('text-xs px-3 py-1.5 rounded-lg font-mono transition-all border')}
                    style={tradingStyle === s
                      ? { background: 'hsl(217 100% 58% / 0.15)', border: '1px solid hsl(217 100% 58% / 0.4)', color: 'hsl(217 80% 70%)' }
                      : { background: 'hsl(222 45% 11%)', border: '1px solid hsl(217 75% 14%)', color: 'hsl(214 25% 45%)' }
                    }
                  >{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1.5 block uppercase tracking-wider">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                placeholder="Tell us about your trading experience..."
                className="w-full text-sm bg-transparent rounded-xl px-3 py-2.5 outline-none resize-none text-foreground placeholder:text-muted-foreground/40"
                style={{ background: 'hsl(222 45% 8%)', border: '1px solid hsl(217 75% 14%)' }}
              />
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2"
              style={{ background: 'linear-gradient(135deg, hsl(217 100% 52%), hsl(217 100% 42%))' }}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        )}

        {bio && !editing && (
          <p className="mt-4 text-sm text-muted-foreground pt-4" style={{ borderTop: '1px solid hsl(217 75% 12%)' }}>{bio}</p>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const c = colorMap[s.color];
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-5 text-center"
              style={{ background: 'hsl(222 55% 6%)', border: `1px solid ${c.border}` }}
            >
              <p className="text-2xl font-black mb-1">{s.value}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}