import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  MoreHorizontal,
  CreditCard,
  User,
  ArrowRight
} from 'lucide-react';
import { cn, formatPrice } from '../../lib/utils';

// Mock orders for demo
const MOCK_ORDERS = [
  { id: 'ORD-2026-X01', user: 'Julian Voss', total: 420.50, status: 'Processing', date: '2026-06-03', items: 3, location: 'Berlin, DE' },
  { id: 'ORD-2026-X02', user: 'Aiden Reed', total: 1290.00, status: 'Shipped', date: '2026-06-02', items: 1, location: 'New York, US' },
  { id: 'ORD-2026-X03', user: 'Leah Smith', total: 85.20, status: 'Delivered', date: '2026-06-01', items: 5, location: 'London, UK' },
  { id: 'ORD-2026-X04', user: 'Marcus Thorne', total: 540.00, status: 'Cancelled', date: '2026-05-30', items: 2, location: 'Singapore, SG' },
  { id: 'ORD-2026-X05', user: 'Elena Rossi', total: 12.500, status: 'Processing', date: '2026-05-30', items: 12, location: 'Milan, IT' },
];

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = MOCK_ORDERS.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'Shipped': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Delivered': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'Cancelled': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm transition-all hover:shadow-md">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tighter uppercase italic">Logistics Stream</h2>
          <p className="text-xs font-medium text-zinc-400">Monitor and fulfill global client acquisitions</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Track Order ID..." 
              className="bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-zinc-50 p-1 rounded-2xl border border-zinc-100">
             {['All', 'Processing', 'Shipped', 'Delivered'].map(s => (
               <button 
                 key={s}
                 onClick={() => setStatusFilter(s)}
                 className={cn(
                   "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                   statusFilter === s ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                 )}
               >
                 {s}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Transaction ID</th>
              <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Acquirer</th>
              <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Status</th>
              <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Capital Impact</th>
              <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Timestamp</th>
              <th className="px-10 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filteredOrders.map((order) => (
              <motion.tr 
                key={order.id}
                layout
                className="hover:bg-zinc-50/50 transition-all group"
              >
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-900 border border-zinc-100">
                      <Package size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight uppercase italic">{order.id}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{order.items} Items Registered</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 overflow-hidden">
                       <User size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{order.user}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> {order.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
                    getStatusColor(order.status)
                  )}>
                    {order.status}
                  </span>
                </td>
                <td className="px-10 py-8">
                  <p className="text-sm font-mono font-black">{formatPrice(order.total)}</p>
                  <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest flex items-center gap-1 mt-1">
                    <CreditCard size={10} /> VERIFIED
                  </p>
                </td>
                <td className="px-10 py-8">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-zinc-900">{order.date}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> 09:30 AM
                    </p>
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                   <button 
                    onClick={() => setSelectedOrder(order)}
                    className="p-2.5 bg-zinc-50 rounded-xl hover:bg-black hover:text-white transition-all"
                   >
                     <ArrowRight size={16} />
                   </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="py-20 text-center space-y-4">
             <h3 className="text-xl font-bold uppercase italic tracking-tighter">Negative Stream Result</h3>
             <p className="text-xs text-zinc-400 font-medium">Clear search filters to resume global monitoring.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-bold tracking-tighter uppercase italic">{selectedOrder.id}</h3>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Detailed Acquisition Profile</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-all font-bold"
                  >
                    ESC
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fulfillment Status</p>
                      <div className="flex items-center gap-3">
                         <select className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest focus:outline-none">
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                         </select>
                         <button className="bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
                           Update
                         </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Shipping Metadata</p>
                       <p className="text-sm font-bold leading-relaxed">
                         {selectedOrder.user}<br />
                         {selectedOrder.location} Central Hub<br />
                         Suite 405, Terminal B
                       </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Capital Overview</p>
                        <div className="space-y-2">
                           <div className="flex justify-between text-zinc-500 text-xs font-bold uppercase tracking-tight">
                             <span>Sub-Total</span>
                             <span className="font-mono">{formatPrice(selectedOrder.total - 45)}</span>
                           </div>
                           <div className="flex justify-between text-zinc-500 text-xs font-bold uppercase tracking-tight">
                             <span>Logistics</span>
                             <span className="font-mono">$45.00</span>
                           </div>
                           <div className="flex justify-between pt-4 border-t border-zinc-200 text-zinc-950 font-black text-lg tracking-tighter uppercase italic">
                             <span>Grand Total</span>
                             <span className="font-mono">{formatPrice(selectedOrder.total)}</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-zinc-50">
                   <button className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                     <Truck size={14} /> Initiate Logistics Scan
                   </button>
                   <button className="flex-1 border border-zinc-200 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                     <XCircle size={14} /> Terminate Acquisition
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
