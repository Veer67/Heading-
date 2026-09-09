import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="neon-border rounded-xl p-5 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}