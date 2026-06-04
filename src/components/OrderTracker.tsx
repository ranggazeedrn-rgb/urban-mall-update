import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Package, Truck, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import { OrderStatus } from '../types';

interface OrderTrackerProps {
  status: OrderStatus;
}

const steps = [
  { id: 'Processing', label: 'Ordered', icon: CheckCircle2 },
  { id: 'Shipped', label: 'Dispatched', icon: Package },
  { id: 'In Transit', label: 'In Transit', icon: Truck },
  { id: 'Delivered', label: 'Delivered', icon: Home },
];

export function OrderTracker({ status }: OrderTrackerProps) {
  const currentStepIndex = steps.findIndex(s => s.id === status);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  // Dynamic timeline events in Indonesian matching Indonesian customer requirements
  const getTimelineEvents = (idx: number) => {
    const events = [
      { time: '09:30 AM', location: 'Gudang Pusat Jakarta', activity: 'Pesanan terkonfirmasi & sedang diproses di warehouse' },
      { time: '11:15 AM', location: 'Jakarta DC Hub', activity: 'Paket telah dikemas dan diserahkan ke kurir pengiriman' },
      { time: '02:20 PM', location: 'In Transit JKT', activity: 'Kurir sedang melakukan pengiriman menuju lokasi Anda' },
      { time: '04:10 PM', location: 'Alamat Tujuan', activity: 'Pesanan berhasil diserahterimakan dan selesai' },
    ];
    return events.slice(0, idx + 1);
  };

  const timelineEvents = getTimelineEvents(activeIndex);

  return (
    <div className="w-full space-y-12">
      <div className="py-8">
        <div className="relative flex justify-between">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-black -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out"
            style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                    isCompleted 
                      ? "bg-black text-white shadow-lg" 
                      : "bg-white border-2 border-zinc-100 text-zinc-300"
                  )}
                >
                  <Icon size={18} strokeWidth={isCompleted ? 2.5 : 2} />
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    isCompleted ? "text-black" : "text-zinc-400"
                  )}>
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="w-1.5 h-1.5 bg-black rounded-full inline-block mt-1 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline View */}
      <div className="space-y-6 px-2">
        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Journey Logs</h5>
        <div className="relative space-y-8">
          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-zinc-800/10"></div>
          
          {timelineEvents.reverse().map((event, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-8"
            >
              <div className={cn(
                "absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors duration-500",
                idx === 0 ? "bg-black" : "bg-zinc-200"
              )}></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className={cn(
                    "text-xs font-bold uppercase tracking-tight transition-colors duration-500",
                    idx === 0 ? "text-black" : "text-zinc-400"
                  )}>
                    {event.activity}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-wide">
                    {event.location}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-300 tracking-tighter">
                  {event.time}
                </span>
              </div>
            </motion.div>
          ))}

          {timelineEvents.length === 0 && (
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-4">
              Awaiting further logistics updates...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
