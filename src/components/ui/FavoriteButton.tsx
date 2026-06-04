import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../WishlistContext';
import { Product } from '../../types';

interface FavoriteButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg' | 'card';
  className?: string;
}

interface HeartParticle {
  id: number;
  x: number;
  scale: number;
  rotation: number;
  delay: number;
}

export function FavoriteButton({ product, size = 'md', className = '' }: FavoriteButtonProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [particles, setParticles] = useState<HeartParticle[]>([]);
  const active = isInWishlist(product.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isAdding = !active;
    toggleWishlist(product);

    if (isAdding) {
      // Generate a cluster of floating mini-hearts
      const newParticles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 45, // horizontal spread
        scale: 0.5 + Math.random() * 0.7, // variety of size
        rotation: (Math.random() - 0.5) * 60, // random rotation angles
        delay: Math.random() * 0.1, // staggered launch
      }));

      setParticles((prev) => [...prev, ...newParticles]);

      // Clean up particles
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
      }, 1000);
    }
  };

  // Base configurations depending on the requested size style
  let buttonClasses = '';
  let iconSize = 20;

  if (size === 'sm') {
    // Used in mobile product detail top-bar (white pill/bubble)
    buttonClasses = 'w-12 h-12 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg active:scale-95 transition-all text-zinc-950 hover:bg-zinc-50 border border-zinc-100';
    iconSize = 20;
  } else if (size === 'lg') {
    // Used on desktop product details main buy action bar
    buttonClasses = 'w-[60px] h-[60px] rounded-full border-2 flex items-center justify-center transition-all bg-white hover:bg-zinc-50 active:scale-95 shrink-0 select-none';
    buttonClasses += active ? ' border-red-100 bg-red-50/20' : ' border-zinc-200 hover:border-black';
    iconSize = 24;
  } else if (size === 'card') {
    // Small elegant circle floating of product image on product lists/cards
    buttonClasses = 'w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md active:scale-90 transition-all text-zinc-900 border border-zinc-100/50 hover:bg-white';
    iconSize = 16;
  } else {
    // Default fallback middle size
    buttonClasses = 'w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-all active:scale-95';
    iconSize = 18;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Mini-Hearts Particle Emitters */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute pointer-events-none text-red-500 z-50"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: '-8px',
              marginTop: '-8px',
            }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, p.scale, p.scale * 1.1, 0],
              x: [0, p.x],
              y: [0, -60 - Math.random() * 30],
              rotate: [0, p.rotation],
            }}
            transition={{
              duration: 0.8,
              ease: [0.18, 0.89, 0.32, 1.28], // classic bouncy arc
              delay: p.delay,
            }}
          >
            <Heart size={14} className="fill-red-500 stroke-red-600" strokeWidth={1} />
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Main Interactive Button with spring pop feedback */}
      <motion.button
        onClick={handleToggle}
        className={buttonClasses}
        whileTap={{ scale: 0.8 }}
        aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <motion.div
          animate={active ? {
            scale: [1, 1.4, 0.85, 1.1, 1],
            rotate: [0, 10, -10, 5, 0],
          } : {
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 0.45,
            ease: "easeInOut"
          }}
          className="flex items-center justify-center"
        >
          <Heart
            size={iconSize}
            className={`transition-colors duration-300 ${
              active 
                ? 'text-red-500 fill-red-500 filter drop-shadow-[0_2px_8px_rgba(239,68,68,0.2)]' 
                : 'text-zinc-400 hover:text-red-400'
            }`}
            strokeWidth={active ? 1.75 : 1.5}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}
