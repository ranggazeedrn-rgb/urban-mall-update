import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  Tag, 
  Calendar, 
  Shield, 
  Bell, 
  Target,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useNotifications } from '../../NotificationContext';
import { cn } from '../../lib/utils';

export function BroadcastNotification() {
  const { addNotification } = useNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'promotion' | 'event' | 'system'>('promotion');
  const [link, setLink] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    
    // Simulate API delay
    setTimeout(() => {
      addNotification({ 
        title, 
        message, 
        type, 
        link: link || undefined 
      });
      setIsSending(false);
      setSuccess(true);
      setTitle('');
      setMessage('');
      setLink('');
      
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tighter uppercase italic">Broadcast Center</h2>
          <p className="text-xs font-medium text-zinc-400">Initiate platform-wide alert transmissions</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <Users size={16} className="text-zinc-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">1,280 Endpoints Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[48px] border border-zinc-100 shadow-xl space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'promotion', label: 'Promotion', icon: Tag, color: 'text-amber-600' },
                { id: 'event', label: 'Event', icon: Calendar, color: 'text-blue-600' },
                { id: 'system', label: 'System', icon: Shield, color: 'text-zinc-600' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all",
                    type === t.id ? "bg-black border-black text-white" : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200"
                  )}
                >
                  <t.icon size={24} className={type === t.id ? "text-white" : t.color} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Subject Header</label>
                <input 
                  type="text"
                  required
                  placeholder="EX: MIDNIGHT SURGE SALE"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-5 px-8 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Payload Content</label>
                <textarea 
                  required
                  placeholder="Describe the promotion or event details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-5 px-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Navigational Link (Optional)</label>
                <input 
                  type="text"
                  placeholder="/shop, /stores, /profile..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-5 px-8 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSending}
              className={cn(
                "w-full py-5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                success ? "bg-green-500 text-white" : "bg-black text-white hover:bg-zinc-800 active:scale-[0.98] shadow-2xl shadow-black/10"
              )}
            >
              {isSending ? 'Initiating Broadcast...' : success ? <><CheckCircle2 size={18} /> Transmission Successful</> : <><Send size={18} /> Execute Transmission</>}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-zinc-950 rounded-[48px] p-8 text-white space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={16} className="text-zinc-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live Simulation</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                       <Tag size={18} />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Now • Simulation Alpha</p>
                       <h4 className="text-sm font-bold uppercase tracking-tight">{title || 'Subject Header'}</h4>
                    </div>
                 </div>
                 <p className="text-xs text-zinc-400 leading-relaxed italic">{message || 'Transmission payload will manifest here...'}</p>
              </div>
              <div className="flex items-center gap-4 text-zinc-500">
                 <AlertTriangle size={14} />
                 <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">Broadcast will be visible to all active users instantly. This action is irreversible.</p>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-zinc-100 space-y-6">
              <h3 className="text-sm font-bold uppercase italic tracking-tight">Fulfillment Metrics</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Latency', value: '24ms' },
                   { label: 'Sync Efficiency', value: '99.8%' },
                   { label: 'Open Probability', value: '72%' }
                 ].map(stat => (
                   <div key={stat.label} className="flex justify-between items-center py-3 border-b border-zinc-50 last:border-none">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{stat.label}</span>
                      <span className="font-mono text-xs font-bold">{stat.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
