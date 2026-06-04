import React from 'react';
import { motion } from 'motion/react';
import { Star, Plus } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useCart } from '../../CartContext';
import { FavoriteButton } from './FavoriteButton';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative mb-3">
        <Link to={`/product/${product.id}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-zinc-100">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {product.isFeatured && (
              <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full shadow-sm">
                <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-900">Featured</span>
              </div>
            )}
            <div className="absolute top-3 right-3 z-10">
              <FavoriteButton product={product} size="card" />
            </div>
          </div>
        </Link>
        <button 
          className="absolute bottom-3 right-3 w-10 h-10 bg-white text-zinc-900 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-zinc-900 hover:text-white active:scale-90"
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
      
      <Link to={`/product/${product.id}`} className="space-y-1 block">
        <div className="flex items-center gap-1">
          <Star size={10} className="fill-black stroke-none" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{product.rating}</span>
        </div>
        <h3 className="font-bold text-xs uppercase tracking-tight text-zinc-900 line-clamp-1">{product.name}</h3>
        <p className="font-mono text-xs font-bold text-zinc-500">{formatPrice(product.price)}</p>
      </Link>
    </motion.div>
  );
}
