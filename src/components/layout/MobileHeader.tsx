import React, { useState } from 'react';
import { ShoppingBag, Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../CartContext';
import { useNotifications } from '../../NotificationContext';
import { NotificationCenter } from '../NotificationCenter';

export function MobileHeader() {
  const { cartCount } = useCart();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-zinc-100 transition-colors duration-300">
        <Link to="/shop" className="text-lg font-bold tracking-tighter italic">URBAN<span className="text-zinc-400">MALL</span></Link>
        <div className="flex items-center gap-4 text-zinc-900">
          <button 
            className="relative p-1"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <Bell size={22} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-white">{unreadCount}</span>
            )}
          </button>
          <Link to="/cart" className="relative p-1">
            <ShoppingBag size={22} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-white">{cartCount}</span>
            )}
          </Link>
        </div>
      </header>
      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </>
  );
}
