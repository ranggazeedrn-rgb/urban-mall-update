import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionPath?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionPath = "/" 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      <div className="relative mb-8">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-32 h-32 bg-zinc-50 rounded-[40px] flex items-center justify-center border border-zinc-100 relative z-10"
        >
          <Icon size={48} className="text-zinc-200" strokeWidth={1.5} />
        </motion.div>
        <div className="absolute inset-0 bg-zinc-100 rounded-[40px] blur-2xl opacity-20 -z-10 scale-110"></div>
      </div>
      
      <h3 className="text-2xl font-bold tracking-tighter uppercase italic mb-3">{title}</h3>
      <p className="text-zinc-400 text-sm max-w-[280px] leading-relaxed mb-10 font-medium">
        {description}
      </p>

      {actionText && (
        <Link 
          to={actionPath}
          className="bg-black text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all"
        >
          {actionText}
        </Link>
      )}
    </motion.div>
  );
}
