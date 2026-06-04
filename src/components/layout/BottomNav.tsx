import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Store, Search, ShoppingBag, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCart } from '../../CartContext';

export function BottomNav() {
  const { cartCount } = useCart();
  const navItems = [
    { icon: Home, label: 'Home', path: '/shop' },
    { icon: Search, label: 'Explore', path: '/search' },
    { icon: Store, label: 'Stores', path: '/stores' },
    { icon: ShoppingBag, label: 'Cart', path: '/cart' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-zinc-100 px-6 py-3 flex justify-between items-center md:hidden transition-colors duration-300">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 transition-all duration-200 relative",
              isActive ? "text-zinc-900" : "text-zinc-400"
            )
          }
        >
          <item.icon size={22} />
          {item.path === '/cart' && cartCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-black text-[8px] text-white flex items-center justify-center rounded-full font-bold">{cartCount}</span>
          )}
          <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
