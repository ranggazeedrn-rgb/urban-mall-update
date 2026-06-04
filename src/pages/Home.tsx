import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { CategoryBar } from '../components/CategoryBar';
import { ProductCard } from '../components/ui/ProductCard';
import { DiscountCarousel } from '../components/DiscountCarousel';
import { PRODUCTS } from '../data';
import { BannerSkeleton, ProductSkeleton } from '../components/ui/Skeleton';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const featuredProducts = PRODUCTS.filter(p => p.isFeatured);
  const recentProducts = PRODUCTS.slice(0, 4);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API fetch for latest products
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
    setPullDistance(0);
  };

  return (
    <main className="pb-24 md:pt-24 min-h-screen relative overflow-hidden">
      {/* Pull to Refresh Indicator */}
      <motion.div 
        style={{ 
          height: isRefreshing ? 80 : Math.min(pullDistance, 80),
          opacity: Math.min(pullDistance / 50, 1)
        }}
        className="flex items-center justify-center bg-zinc-50 border-b border-zinc-100 overflow-hidden"
      >
        <div className="flex flex-col items-center gap-2">
          {isRefreshing ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight className="rotate-90 text-zinc-400" size={20} />
          )}
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">
            {isRefreshing ? 'Synchronizing' : 'Pull to Refresh'}
          </span>
        </div>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDrag={(_, info) => {
          if (!isRefreshing && info.offset.y > 0) {
            setPullDistance(info.offset.y);
          }
        }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80) {
            handleRefresh();
          } else {
            setPullDistance(0);
          }
        }}
        className="relative z-10"
      >
        {/* Discount Carousel Section */}
        <section className="px-6 py-6">
        {isLoading ? <BannerSkeleton /> : <DiscountCarousel />}
      </section>

      {/* Categories */}
      <section>
        <div className="px-6 flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Kategori</h2>
          <button className="text-[10px] font-bold uppercase text-zinc-400 hover:text-zinc-900 transition-colors">Lihat Semua</button>
        </div>
        <CategoryBar />
      </section>

      {/* Featured Products */}
      <section className="mt-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tighter">PRODUK UNGGULAN</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Pilihan terbaik untuk Anda</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Seasonal Promo */}
      <section className="px-6 mt-12">
        <div className="bg-zinc-100 rounded-[32px] p-8 overflow-hidden relative group">
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 text-zinc-500">Edisi Terbatas</span>
            <h2 className="text-2xl font-bold tracking-tighter mb-4">KOLEKSI TECH NOIR</h2>
            <button className="text-xs font-bold underline underline-offset-4 decoration-2">JELAJAHI SEKARANG</button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-200/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-zinc-200/50 rounded-full blur-3xl -ml-10 -mb-10"></div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mt-12 px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tighter">PRODUK TERBARU</h2>
          <button className="text-[10px] font-bold uppercase text-zinc-400 hover:text-zinc-900">Lihat semua</button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </motion.div>
  </main>
);
}
