import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data';
import * as Icons from 'lucide-react';
import { cn } from '../lib/utils';

export function CategoryBar() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/search?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="flex gap-4 overflow-x-auto px-6 py-4 no-scrollbar">
      {CATEGORIES.map((category) => {
        const Icon = (Icons as any)[category.icon];
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            className={cn(
              "flex flex-col items-center gap-2 min-w-[72px] group transition-all"
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:-translate-y-1">
              <Icon size={24} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
