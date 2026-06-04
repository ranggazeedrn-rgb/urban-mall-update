import React from 'react';
import { Heart } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { useWishlist } from '../WishlistContext';
import { ProductCard } from '../components/ui/ProductCard';

export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <main className="pb-24 pt-10 px-6 max-w-4xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tighter uppercase italic">WISH LIST</h1>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Items saved for future iteration</p>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState 
          icon={Heart}
          title="Nothing Saved"
          description="Build your collection by tapping the heart icon on any product page."
          actionText="Explore Products"
          actionPath="/shop"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
