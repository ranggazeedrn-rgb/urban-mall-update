import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, SlidersHorizontal, ArrowRight, Store as StoreIcon, Star, MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS, CATEGORIES, STORES } from '../data';
import { ProductCard } from '../components/ui/ProductCard';
import { Link } from 'react-router-dom';

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const filteredStores = STORES.filter((store) => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          store.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? store.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="pb-24 pt-6 md:pt-24 px-6 max-w-6xl mx-auto min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">CARI</h1>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">Temukan produk favorit Anda</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-zinc-100 p-1 rounded-xl self-start border border-zinc-200/50">
          <button
            onClick={() => { setActiveTab('products'); setSelectedCategory(null); }}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'products' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
          >
            Produk
          </button>
          <button
            onClick={() => { setActiveTab('stores'); setSelectedCategory(null); }}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'stores' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
          >
            Toko
          </button>
        </div>
      </div>

      <div className="sticky top-20 md:top-24 z-40 bg-zinc-50/80 md:bg-white/80 backdrop-blur-md pt-4 pb-6 -mx-6 px-6 md:mx-0 md:px-0">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              placeholder={activeTab === 'products' ? "CARI PRODUK, MEREK..." : "CARI TOKO, KATEGORI..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-full py-4 pl-12 pr-6 text-xs font-bold tracking-widest focus:outline-none focus:border-black transition-all uppercase shadow-sm"
            />
          </div>
          <button className="w-14 h-14 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:text-black transition-colors shadow-sm shrink-0">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${!selectedCategory ? 'bg-black text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >
            Semua Kategori
          </button>
          {CATEGORIES.map(category => (
            <button 
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === category.name ? 'bg-black text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'products' ? (
        filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-2">
              <SearchIcon size={32} className="text-zinc-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-tighter uppercase italic">Tidak ditemukan</h2>
            <p className="text-zinc-400 text-sm font-medium">Cobalah menyesuaikan pencarian Anda.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1"
            >
              Bersihkan Filter <ArrowRight size={14} />
            </button>
          </div>
        )
      ) : (
        /* Stores Search view */
        filteredStores.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={store.id}
              >
                <Link 
                  to={`/store/${store.id}`}
                  className="group bg-white border border-zinc-100 hover:border-zinc-200 rounded-[28px] overflow-hidden hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={store.image} 
                      alt={store.name} 
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                      <Star size={10} className="fill-black text-black" />
                      <span className="text-[10px] font-black">{store.rating}</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-md">{store.category}</span>
                      <h3 className="text-lg font-bold uppercase italic tracking-tight text-zinc-950 mt-2 group-hover:text-zinc-600 transition-colors">{store.name}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium line-clamp-2 mt-1">{store.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> LEVEL 1
                      </span>
                      <span className="text-black hover:underline cursor-pointer flex items-center gap-1">
                        Kunjungi <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-2">
              <StoreIcon size={32} className="text-zinc-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-tighter uppercase italic">Toko tidak ditemukan</h2>
            <p className="text-zinc-400 text-sm font-medium">Kami tidak menemukan toko yang cocok.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1"
            >
              Bersihkan Filter <ArrowRight size={14} />
            </button>
          </div>
        )
      )}
    </main>
  );
}
