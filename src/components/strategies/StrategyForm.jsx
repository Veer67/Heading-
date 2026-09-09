import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Save } from 'lucide-react';

export default function StrategyForm({ strategy, onSubmit, onCancel, isPending }) {
  const [form, setForm] = useState({
    name: strategy?.name || '',
    description: strategy?.description || '',
    type: strategy?.type || 'day_trading',
    risk_level: strategy?.risk_level || 'medium',
    rules: strategy?.rules || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-border rounded-xl bg-card/60 backdrop-blur-sm p-6 mb-6 neon-box-glow"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">{strategy ? 'Edit Strategy' : 'New Strategy'}</h3>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7 text-muted-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Strategy name"
              required
              className="bg-secondary/30 border-border/50 text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="bg-secondary/30 border-border/50 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="scalping">Scalping</SelectItem>
                <SelectItem value="day_trading">Day Trading</SelectItem>
                <SelectItem value="swing">Swing Trading</SelectItem>
                <SelectItem value="position">Position Trading</SelectItem>
                <SelectItem value="options">Options</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your strategy..."
            className="bg-secondary/30 border-border/50 text-foreground h-20"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Risk Level</Label>
            <Select value={form.risk_level} onValueChange={(v) => setForm({ ...form, risk_level: v })}>
              <SelectTrigger className="bg-secondary/30 border-border/50 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Rules & Conditions</Label>
          <Textarea
            value={form.rules}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
            placeholder="Enter your trading rules..."
            className="bg-secondary/30 border-border/50 text-foreground h-24"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="border-border/50 text-muted-foreground hover:text-foreground">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            {strategy ? 'Update' : 'Create'} Strategy
          </Button>
        </div>
      </form>
    </motion.div>
  );
}