import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Twitter, Github, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useSEO } from '@/lib/useSEO';

export default function Contact() {
  useSEO({
    title: 'Contact Trade AI Zotra',
    description: 'Get in touch with the Trade AI Zotra team for support, feedback, or questions about our AI trading analysis platform.',
    keywords: 'contact Trade AI Zotra, trading platform support, AI trading help, feedback, customer service',
  });

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'veerffzotra7@gmail.com',
      subject: `Contact Form: ${form.name}`,
      body: `From: ${form.name} <${form.email}>\n\n${form.message}`,
    });
    setSent(true);
    setSending(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-primary uppercase">Get In Touch</span>
          </div>
          <h1 className="text-4xl font-black text-foreground mb-3">Contact Us</h1>
          <p className="text-muted-foreground text-sm">Have questions, feedback, or need support? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-emerald-500/20 bg-emerald-500/5"
              >
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
                <p className="text-lg font-bold text-foreground">Message Sent!</p>
                <p className="text-sm text-muted-foreground mt-1">We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
                  className="mt-4 text-xs text-primary hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1.5">Your Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full bg-card border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full bg-card border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us how we can help..."
                    className="w-full bg-card border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
                <Button type="submit" disabled={sending} className="w-full h-11 font-bold text-sm">
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-4">Direct Contact</p>
              <div className="space-y-3">
                <a href="mailto:veerffzotra7@gmail.com"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-xs text-muted-foreground font-mono">veerffzotra7@gmail.com</p>
                  </div>
                </a>
                <a href="https://twitter.com/tradeaiztra" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Twitter className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Twitter / X</p>
                    <p className="text-xs text-muted-foreground font-mono">@tradeaiztra</p>
                  </div>
                </a>
                <a href="https://github.com/tradeaiztra" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Github className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-xs text-muted-foreground font-mono">github.com/tradeaiztra</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Support Hours</p>
              <p className="text-sm text-foreground font-medium">Monday – Friday</p>
              <p className="text-xs text-muted-foreground font-mono">9:00 AM – 6:00 PM IST</p>
              <p className="text-[11px] text-muted-foreground mt-2">We typically respond within 24 hours.</p>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <p className="text-sm font-bold text-foreground">AI Chat</p>
              </div>
              <p className="text-xs text-muted-foreground">Need instant help? Try our built-in AI Chat — available 24/7 for trading questions and platform support.</p>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}