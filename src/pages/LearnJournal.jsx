import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { NotebookPen, Plus, X, Trash2, TrendingUp, Percent, Scale, Award, Upload, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSEO } from '@/lib/useSEO';
import { useToast } from '@/components/ui/use-toast';

const EMPTY = {
  symbol: '', direction: 'long', trade_date: new Date().toISOString().slice(0, 10),
  entry_price: '', exit_price: '', stop_loss: '', take_profit: '',
  position_size: '', risk_percent: '', result: 'open', pnl: '',
  setup: '', strategy: '', notes: '', emotions: '', mistakes: '', screenshot_url: '',
};

function calcAnalytics(entries) {
  const closed = entries.filter((e) => e.result === 'win' || e.result === 'loss');
  const wins = closed.filter((e) => e.result === 'win');
  const losses = closed.filter((e) => e.result === 'loss');
  const winRate = closed.length ? Math.round((wins.length / closed.length) * 100) : 0;
  const avgWin = wins.length ? wins.reduce((s, e) => s + (e.pnl || 0), 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, e) => s + (e.pnl || 0), 0) / losses.length : 0;
  const rr = avgLoss !== 0 ? Math.abs(avgWin / avgLoss).toFixed(2) : '—';
  // best/worst setup by win rate
  const setups = {};
  closed.forEach((e) => {
    const k = e.setup || '—';
    if (!setups[k]) setups[k] = { wins: 0, total: 0 };
    setups[k].total++;
    if (e.result === 'win') setups[k].wins++;
  });
  const setupArr = Object.entries(setups).map(([k, v]) => ({ setup: k, wr: v.total ? Math.round((v.wins / v.total) * 100) : 0, total: v.total }));
  const best = setupArr.length ? [...setupArr].sort((a, b) => b.wr - a.wr)[0] : null;
  const worst = setupArr.length ? [...setupArr].sort((a, b) => a.wr - b.wr)[0] : null;
  return { total: entries.length, closed: closed.length, winRate, avgWin, avgLoss, rr, best, worst };
}

export default function LearnJournal() {
  useSEO({ title: 'Trading Journal — Learn' });
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: entries = [] } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 200),
  });
  const a = calcAnalytics(entries);

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data };
      ['entry_price', 'exit_price', 'stop_loss', 'take_profit', 'position_size', 'risk_percent', 'pnl'].forEach((k) => {
        payload[k] = payload[k] === '' ? null : Number(payload[k]);
      });
      await base44.entities.JournalEntry.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal-entries'] });
      setForm(EMPTY);
      setShowForm(false);
      toast({ title: '✅ Entry added' });
    },
    onError: (e) => toast({ title: 'Failed to add', description: e.message, variant: 'destructive' }),
  });

  const delMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal-entries'] }),
  });

  const onUpload = async (file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, screenshot_url: file_url }));
      toast({ title: 'Screenshot uploaded' });
    } catch (e) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    }
  };

  const submit = (e) => { e.preventDefault(); addMutation.mutate(form); };

  const Stat = ({ label, value, icon: Icon, color }) => (
    <div className="rounded-xl p-4 bg-card border border-border/50">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-xl font-black text-foreground">{value}</p>
    </div>
  );

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <NotebookPen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Trading Journal</h1>
            <p className="text-[11px] font-mono text-muted-foreground">Record · Review · Improve</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Trades" value={a.total} icon={NotebookPen} color="text-blue-400" />
        <Stat label="Win Rate" value={`${a.winRate}%`} icon={Percent} color="text-emerald-400" />
        <Stat label="Avg Win" value={`$${a.avgWin.toFixed(0)}`} icon={TrendingUp} color="text-emerald-400" />
        <Stat label="Avg Loss" value={`$${a.avgLoss.toFixed(0)}`} icon={TrendingUp} color="text-red-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Risk/Reward" value={a.rr} icon={Scale} color="text-purple-400" />
        <Stat label="Best Setup" value={a.best ? `${a.best.setup} (${a.best.wr}%)` : '—'} icon={Award} color="text-amber-400" />
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-card p-10 text-center">
          <NotebookPen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No journal entries yet.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">Start recording your trades to learn from them.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${e.direction === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{(e.direction || '').toUpperCase()}</span>
                  <span className="text-sm font-bold text-foreground">{e.symbol}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{e.trade_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${e.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' : e.result === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-secondary text-muted-foreground'}`}>{(e.result || 'open').toUpperCase()}</span>
                  {e.pnl != null && <span className={`text-xs font-mono font-bold ${(e.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(e.pnl || 0) >= 0 ? '+' : ''}${(e.pnl || 0).toFixed(2)}</span>}
                  <button onClick={() => delMutation.mutate(e.id)} className="text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 text-[10px] font-mono text-muted-foreground">
                <span>Entry: {e.entry_price ?? '—'}</span>
                <span>Exit: {e.exit_price ?? '—'}</span>
                <span>SL: {e.stop_loss ?? '—'}</span>
                <span>TP: {e.take_profit ?? '—'}</span>
                {e.setup && <span>Setup: {e.setup}</span>}
                {e.risk_percent != null && <span>Risk: {e.risk_percent}%</span>}
              </div>
              {e.notes && <p className="mt-2 text-xs text-foreground/70">{e.notes}</p>}
              {e.mistakes && <p className="mt-1 text-[11px] text-red-400/80">⚠️ {e.mistakes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-foreground">New Journal Entry</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Symbol *"><input required value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="AAPL" className={inp} /></Field>
                  <Field label="Direction">
                    <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} className={inp}>
                      <option value="long">Long</option><option value="short">Short</option>
                    </select>
                  </Field>
                  <Field label="Date *"><input required type="date" value={form.trade_date} onChange={(e) => setForm({ ...form, trade_date: e.target.value })} className={inp} /></Field>
                  <Field label="Result">
                    <select value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} className={inp}>
                      <option value="open">Open</option><option value="win">Win</option><option value="loss">Loss</option><option value="breakeven">Breakeven</option>
                    </select>
                  </Field>
                  <Field label="Entry"><input type="number" step="any" value={form.entry_price} onChange={(e) => setForm({ ...form, entry_price: e.target.value })} className={inp} /></Field>
                  <Field label="Exit"><input type="number" step="any" value={form.exit_price} onChange={(e) => setForm({ ...form, exit_price: e.target.value })} className={inp} /></Field>
                  <Field label="Stop Loss"><input type="number" step="any" value={form.stop_loss} onChange={(e) => setForm({ ...form, stop_loss: e.target.value })} className={inp} /></Field>
                  <Field label="Take Profit"><input type="number" step="any" value={form.take_profit} onChange={(e) => setForm({ ...form, take_profit: e.target.value })} className={inp} /></Field>
                  <Field label="Position Size"><input type="number" step="any" value={form.position_size} onChange={(e) => setForm({ ...form, position_size: e.target.value })} className={inp} /></Field>
                  <Field label="Risk %"><input type="number" step="any" value={form.risk_percent} onChange={(e) => setForm({ ...form, risk_percent: e.target.value })} className={inp} /></Field>
                  <Field label="P&L"><input type="number" step="any" value={form.pnl} onChange={(e) => setForm({ ...form, pnl: e.target.value })} className={inp} /></Field>
                  <Field label="Setup"><input value={form.setup} onChange={(e) => setForm({ ...form, setup: e.target.value })} placeholder="Breakout retest" className={inp} /></Field>
                </div>
                <Field label="Strategy"><input value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} placeholder="Trend following" className={inp} /></Field>
                <Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inp} /></Field>
                <Field label="Emotions"><input value={form.emotions} onChange={(e) => setForm({ ...form, emotions: e.target.value })} placeholder="Calm / FOMO / Revenge" className={inp} /></Field>
                <Field label="Mistakes"><input value={form.mistakes} onChange={(e) => setForm({ ...form, mistakes: e.target.value })} placeholder="Entered before confirmation" className={inp} /></Field>
                {/* Screenshot */}
                <Field label="Screenshot">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/50 bg-secondary/30 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} />
                    </label>
                    {form.screenshot_url && <span className="text-[10px] text-emerald-400 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> attached</span>}
                  </div>
                </Field>
                <button type="submit" disabled={addMutation.isPending} className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                  {addMutation.isPending ? 'Saving…' : 'Save Entry'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inp = 'w-full bg-secondary/30 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50';
const Field = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
    {children}
  </div>
);