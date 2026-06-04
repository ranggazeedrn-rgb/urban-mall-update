import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Tag, Calendar, Shield, ArrowRight, Trash2 } from 'lucide-react';
import { useNotifications } from '../NotificationContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter uppercase italic">Alert Stream</h2>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Internal Communications</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-6 rounded-[32px] border transition-all relative group",
                      n.isRead ? "bg-white border-zinc-100" : "bg-zinc-50 border-zinc-200 ring-2 ring-black/5"
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    {!n.isRead && (
                      <span className="absolute top-6 right-6 w-2 h-2 bg-black rounded-full animate-pulse" />
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        n.type === 'promotion' ? "bg-amber-100 text-amber-600" :
                        n.type === 'event' ? "bg-blue-100 text-blue-600" :
                        "bg-zinc-100 text-zinc-600"
                      )}>
                        {n.type === 'promotion' ? <Tag size={20} /> :
                         n.type === 'event' ? <Calendar size={20} /> :
                         <Shield size={20} />}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                            {new Date(n.timestamp).toLocaleDateString()} • {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold tracking-tight uppercase">{n.title}</h4>
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">{n.message}</p>
                        
                        {n.link && (
                          <Link 
                            to={n.link} 
                            onClick={onClose}
                            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-900 border-b border-black pb-1 pt-2 hover:gap-4 transition-all"
                          >
                            Execute Action <ArrowRight size={10} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Bell size={48} strokeWidth={1} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Zero Active Transmissions</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex items-center gap-3">
              <button 
                onClick={markAllAsRead}
                className="flex-1 bg-white border border-zinc-200 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
              >
                <CheckAll size={14} /> Clear Backlog
              </button>
              <button 
                onClick={clearNotifications}
                className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const CheckAll = ({ size, className }: { size: number, className?: string }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
        <path d="M18 6 7 17l-5-5" />
        <path d="m22 10-7.5 7.5L13 16" />
    </svg>
);
