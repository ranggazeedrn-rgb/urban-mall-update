import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Star, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { STORES, PRODUCTS } from '../data';
import { ProductCard } from '../components/ui/ProductCard';
import { SingleStoreMap } from '../components/StoreMap';

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = STORES.find(s => s.id === id);
  const storeProducts = PRODUCTS.filter(p => p.storeId === id);

  if (!store) {
    return <div className="p-20 text-center">Store not found</div>;
  }

  return (
    <main className="pb-24 pt-0 md:pt-24 min-h-screen">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img 
          src={store.image} 
          alt={store.name} 
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
          >
            <ChevronLeft size={20} />
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/10 w-fit px-3 py-1 rounded-full">{store.category}</span>
            <h1 className="text-4xl font-bold tracking-tighter text-white italic uppercase">{store.name}</h1>
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-white stroke-none" />
                <span className="text-xs font-bold">{store.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span className="text-xs font-medium">Level 1, South Wing</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-10 space-y-12">
        {/* Info Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center text-center gap-2">
            <Clock size={20} className="text-zinc-400" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase text-zinc-400">Jam Buka</p>
              <p className="text-xs font-bold uppercase italic">10:00 - 22:00</p>
            </div>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center text-center gap-2">
            <Phone size={20} className="text-zinc-400" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase text-zinc-400">Kontak</p>
              <p className="text-xs font-bold uppercase italic">+62 21 555 0123</p>
            </div>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center text-center gap-2 text-zinc-400 md:flex hidden">
             {/* hidden on mobile to keep 2 col grid clean */}
            <Globe size={20} />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase">Website</p>
              <p className="text-xs font-bold uppercase italic">urbanmall.com</p>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 italic underline decoration-zinc-200 underline-offset-4">Deskripsi</h2>
            <p className="text-xl font-medium leading-relaxed tracking-tight text-zinc-600">
              {store.description} Toko ini menawarkan kurasi pilihan {store.category.toLowerCase()} premium untuk gaya hidup perkotaan modern.
            </p>
            <div className="pt-4 flex items-center gap-2 text-zinc-400">
              <MapPin size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Distrik Bisnis Jakarta, South Wing v2</span>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SingleStoreMap store={store} />
          </motion.div>
        </section>

        {/* Products */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tighter uppercase italic">Katalog Toko</h2>
            <span className="text-[10px] font-bold uppercase text-zinc-400">{storeProducts.length} Produk</span>
          </div>
          
          {storeProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {storeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="p-10 bg-zinc-50 rounded-[32px] text-center border-2 border-dashed border-zinc-100">
              <p className="text-zinc-400 text-sm font-medium">No products currently listed for this store.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
