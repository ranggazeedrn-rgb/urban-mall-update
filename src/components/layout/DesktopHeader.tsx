import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, User, Bell } from 'lucide-react';
import { useCart } from '../../CartContext';
import { useNotifications } from '../../NotificationContext';
import { NotificationCenter } from '../NotificationCenter';

export function DesktopHeader() {
  const { cartCount } = useCart();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <>
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-10 py-4 items-center justify-between transition-colors duration-300">
        <Link to="/shop" className="text-xl font-bold tracking-tighter italic">URBAN<span className="text-zinc-400">MALL</span></Link>
        
        <nav className="flex items-center gap-8">
          <Link to="/shop" className="text-sm font-medium hover:text-zinc-500 transition-colors uppercase tracking-widest text-[11px]">Home</Link>
          <Link to="/stores" className="text-sm font-medium hover:text-zinc-500 transition-colors uppercase tracking-widest text-[11px]">Stores</Link>
          <Link to="/wishlist" className="text-sm font-medium hover:text-zinc-500 transition-colors uppercase tracking-widest text-[11px]">Collections</Link>
        </nav>

        <div className="flex items-center gap-5">
          <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-zinc-100">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <User size={16} className="text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Jane Doe</span>
              <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Silver VIP</span>
            </div>
          </div>
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative"
          >
            <Bell size={20} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-black text-[8px] text-white flex items-center justify-center rounded-full font-bold ring-2 ring-white">{unreadCount}</span>
            )}
          </button>
          <Link to="/search" className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative">
            <Search size={20} strokeWidth={1.5} />
          </Link>
          <Link to="/cart" className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-black text-[8px] text-white flex items-center justify-center rounded-full font-bold ring-2 ring-white">{cartCount}</span>
            )}
          </Link>
          <Link to="/profile" className="bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-3 rounded-full hover:bg-zinc-800 transition-all border border-black">
            Account
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
