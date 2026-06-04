import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../CartContext';
import { formatPrice } from '../lib/utils';
import { Link } from 'react-router-dom';

import { EmptyState } from '../components/ui/EmptyState';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <main className="pb-24 pt-10 px-6 max-w-4xl mx-auto min-h-screen">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tighter  italic">MY BAG</h1>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">0 Items in your selection</p>
        </div>
        <EmptyState 
          icon={ShoppingBag}
          title="Bag is Empty"
          description="Your high-tech inventory is currently at zero capacity. Time to acquire new gear."
          actionText="Commence Shopping"
          actionPath="/"
        />
      </main>
    );
  }

  return (
    <main className="pb-24 pt-6 md:pt-24 px-6 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tighter">MY BAG</h1>
        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">{cartCount} Items in your selection</p>
      </div>

      <div className="space-y-8">
        {cart.map((item) => (
          <div key={item.id} className="relative overflow-hidden rounded-[32px]">
            {/* Delete Background Action */}
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-10">
              <Trash2 className="text-white animate-pulse" size={24} />
            </div>

            <motion.div 
              layout
              drag="x"
              dragConstraints={{ left: -100, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) {
                  removeFromCart(item.id);
                }
              }}
              className="flex gap-6 pb-8 border-b border-zinc-100 group bg-white relative z-10"
            >
              <div className="w-24 h-32 rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
                <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 py-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-zinc-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{item.category}</p>
                  </div>
                  <p className="font-mono font-bold text-lg">{formatPrice(item.price)}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 bg-zinc-100 rounded-full px-3 py-1.5">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:text-zinc-500"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:text-zinc-500"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-300 hover:text-red-500 transition-colors hidden md:block"
                  >
                    <Trash2 size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-zinc-500">
            <span>Subtotal</span>
            <span className="font-mono">{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-500">
            <span>Shipping</span>
            <span className="font-mono">FREE</span>
          </div>
          <div className="h-px bg-zinc-100 my-4"></div>
          <div className="flex justify-between items-end">
            <span className="text-xl font-bold tracking-tighter">TOTAL</span>
            <span className="text-3xl font-mono font-bold">{formatPrice(cartTotal)}</span>
          </div>
        </div>

        <Link to="/checkout" className="w-full bg-black text-white py-5 rounded-full font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-black/10">
          PROCEED TO CHECKOUT <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}
