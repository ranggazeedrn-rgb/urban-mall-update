import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Tag,
  DollarSign,
  Layers,
  Star
} from 'lucide-react';
import { PRODUCTS, STORES } from '../../data';
import { formatPrice } from '../../lib/utils';

export function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(PRODUCTS.map(p => p.category))];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tighter uppercase italic">Inventory Metadata</h2>
          <p className="text-xs font-medium text-zinc-400">Audit and mutate product registrations</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Query ID/Name..." 
              className="bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none transition-all cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-black/10">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const store = STORES.find(s => s.id === product.storeId);
          return (
            <motion.div 
              layout
              key={product.id}
              className="bg-white rounded-[40px] border border-zinc-100 p-8 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-24 h-24 bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button className="p-2.5 bg-zinc-50 rounded-xl hover:bg-black hover:text-white transition-all">
                    <Edit3 size={14} />
                  </button>
                  <button className="p-2.5 bg-zinc-50 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{product.category}</span>
                    <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{store?.name}</span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tighter uppercase italic truncate">{product.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-50">
                   <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <DollarSign size={10} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Pricing</span>
                      </div>
                      <p className="text-sm font-mono font-bold">{formatPrice(product.price)}</p>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Layers size={10} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Stock Level</span>
                      </div>
                      <p className="text-sm font-bold text-green-600 uppercase italic">In Supply</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-1.5">
                    <Star size={12} className="fill-black" />
                    <span className="text-xs font-bold">{product.rating}</span>
                    <span className="text-[10px] font-bold text-zinc-400">({product.reviews})</span>
                  </div>
                  <button className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:underline underline-offset-4 transition-all flex items-center gap-1.5">
                    View Public <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
         <div className="bg-white py-20 rounded-[48px] border border-dashed border-zinc-200 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto">
               <Package size={24} className="text-zinc-300" />
            </div>
            <h4 className="text-xl font-bold uppercase italic tracking-tighter">Zero Match Found</h4>
            <p className="text-xs text-zinc-400 font-medium">Verify your search query or clear existing filters.</p>
         </div>
      )}
    </div>
  );
}
