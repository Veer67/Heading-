import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSEO } from '@/lib/useSEO';
import StrategyCard from '../components/strategies/StrategyCard';
import StrategyForm from '../components/strategies/StrategyForm';

export default function Strategies() {
  useSEO({
    title: 'Trading Strategies',
    description: 'Create, manage, and track AI-powered trading strategies with Trade AI Zotra. Build scalping, day trading, swing, and options strategies in one platform.',
    keywords: 'trading strategies, AI trading, strategy builder, scalping, day trading, swing trading, options strategies',
  });

  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const queryClient = useQueryClient();

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Strategy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Strategy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      setShowForm(false);
      setEditingStrategy(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Strategy.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategies'] }),
  });

  const handleSubmit = (data) => {
    if (editingStrategy) {
      updateMutation.mutate({ id: editingStrategy.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (strategy) => {
    setEditingStrategy(strategy);
    setShowForm(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Strategies</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered trading strategies</p>
        </div>
        <Button
          onClick={() => { setEditingStrategy(null); setShowForm(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
      </motion.div>

      {showForm && (
        <StrategyForm
          strategy={editingStrategy}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingStrategy(null); }}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {strategies.length === 0 && !showForm ? (
        <div className="neon-border rounded-xl bg-card/60 backdrop-blur-sm p-12 text-center">
          <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No strategies yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first AI strategy</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create Strategy
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((s, i) => (
            <StrategyCard
              key={s.id}
              strategy={s}
              index={i}
              onEdit={() => handleEdit(s)}
              onDelete={() => deleteMutation.mutate(s.id)}
              onStatusChange={(status) => updateMutation.mutate({ id: s.id, data: { status } })}
            />
          ))}
        </div>
      )}
    </div>
  );
}