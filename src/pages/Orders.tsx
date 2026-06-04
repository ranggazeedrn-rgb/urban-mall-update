import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ORDERS as INITIAL_ORDERS } from '../data';
import { OrderStatus, Order } from '../types';
import { OrderTracker } from '../components/OrderTracker';
import { EmptyState } from '../components/ui/EmptyState';

export default function OrderHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get order ID passed from checkout if any
  const passedOrderId = location.state?.trackingOrderId || null;

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('urban_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing urban_orders from localStorage:', e);
      }
    }
    // Fallback and initialize
    localStorage.setItem('urban_orders', JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  });

  const [selectedOrder, setSelectedOrder] = useState<string | null>(passedOrderId);

  // Sync state if a new order is passed via navigation after initial mount
  useEffect(() => {
    if (passedOrderId) {
      setSelectedOrder(passedOrderId);
    }
  }, [passedOrderId]);

  // Real-time tracking history progression simulator (every 10s)
  useEffect(() => {
    const timer = setInterval(() => {
      let isAnyOrderUpdated = false;
      const updatedOrders = orders.map(order => {
        if (order.status === 'Delivered') return order;
        
        let nextStatus: OrderStatus = order.status;
        if (order.status === 'Processing') {
          nextStatus = 'Shipped';
          isAnyOrderUpdated = true;
        } else if (order.status === 'Shipped') {
          nextStatus = 'In Transit';
          isAnyOrderUpdated = true;
        } else if (order.status === 'In Transit') {
          nextStatus = 'Delivered';
          isAnyOrderUpdated = true;
        }
        
        return { ...order, status: nextStatus };
      });
      
      if (isAnyOrderUpdated) {
        setOrders(updatedOrders);
        localStorage.setItem('urban_orders', JSON.stringify(updatedOrders));
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [orders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Processing': return 'text-amber-500 bg-amber-50';
      case 'Shipped': return 'text-blue-500 bg-blue-50';
      case 'In Transit': return 'text-purple-500 bg-purple-50';
      case 'Delivered': return 'text-green-500 bg-green-50';
      default: return 'text-zinc-500 bg-zinc-50';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Processing': return <Clock size={14} />;
      case 'Shipped': return <Package size={14} />;
      case 'In Transit': return <Truck size={14} />;
      case 'Delivered': return <CheckCircle2 size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleRemoveOrder = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    localStorage.setItem('urban_orders', JSON.stringify(updated));
  };

  const currentOrder = orders.find(o => o.id === selectedOrder);

  return (
    <main className="pb-24 pt-10 px-6 max-w-4xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => selectedOrder ? setSelectedOrder(null) : navigate(-1)}
          className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">
            {selectedOrder ? 'ORDER TRACKING' : 'HISTORY'}
          </h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
            {selectedOrder ? `TRACKING ID: ${selectedOrder}` : 'YOUR RECENT ACQUISITIONS'}
          </p>
        </div>
      </div>

      {!selectedOrder ? (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order) => (
              <div key={order.id} className="relative overflow-hidden rounded-[32px]">
                {/* Background Remove Action */}
                <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-10">
                  <Trash2 className="text-white animate-pulse" size={24} />
                </div>

                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  drag="x"
                  dragConstraints={{ left: -100, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) {
                      handleRemoveOrder(order.id);
                    }
                  }}
                  onClick={() => setSelectedOrder(order.id)}
                  className="bg-white border border-zinc-100 rounded-[32px] p-6 cursor-pointer hover:border-black transition-all group relative z-10"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order ID</p>
                      <p className="text-xl font-bold italic uppercase leading-none">{order.id}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">{order.date}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-2xl bg-zinc-50 overflow-hidden border border-zinc-100 shrink-0">
                        <img src={item.image} alt={item.name} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">+{order.items.length - 3}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                    <p className="text-xl font-bold italic">${order.total}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                      Track Package <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </AnimatePresence>
          {orders.length === 0 && (
            <EmptyState 
              icon={Package}
              title="No Acquisitions"
              description="Your order history is currently a blank slate. Start your journey by acquiring new items."
              actionText="View Catalog"
              actionPath="/"
            />
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tracking Status Card */}
          <div className="bg-zinc-950 text-white rounded-[40px] p-8 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tracking Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold font-mono tracking-tighter">{currentOrder?.trackingNumber || 'N/A'}</p>
                  {currentOrder?.status !== 'Delivered' && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                  {currentOrder?.status === 'Delivered' ? (
                    <span className="text-zinc-400">✓ LOGISTICS COMPLETED</span>
                  ) : (
                    <span className="animate-pulse">🔄 REAL-TIME UPDATES LIVE (10s Feed)</span>
                  )}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10">
                <Truck size={30} className="text-white" />
              </div>
            </div>

            <div className="relative z-10 border-t border-white/10 pt-4">
              <OrderTracker status={currentOrder?.status || 'Processing'} />
            </div>
          </div>

          <div className="bg-white border border-zinc-100 rounded-[32px] p-8 space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Order Manifest</h4>
            <div className="space-y-4">
              {currentOrder?.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-4 border-b border-zinc-50 last:border-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-zinc-100 shrink-0">
                    <img src={item.image} alt={item.name} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase italic">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">QTY: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">${item.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-50 rounded-[32px] p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-zinc-100 text-zinc-400">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Shipping Destination</p>
              <p className="text-xs font-bold text-zinc-900 mt-1 uppercase">{currentOrder?.shippingAddress}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
