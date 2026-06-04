import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Star, ShoppingBag, Heart, Share2, Check, Shield, Truck, RefreshCw, MessageSquare, User } from 'lucide-react';
import { PRODUCTS, STORES, REVIEWS } from '../data';
import { formatPrice } from '../lib/utils';
import { useCart } from '../CartContext';
import { FavoriteButton } from '../components/ui/FavoriteButton';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  
  const product = PRODUCTS.find(p => p.id === id);
  const store = product?.storeId ? STORES.find(s => s.id === product.storeId) : null;

  // Local state for reviews and form
  const [localReviews, setLocalReviews] = useState(REVIEWS.filter(r => r.productId === id));
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  if (!product) {
    return <div className="p-20 text-center">Product not found</div>;
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const review = {
      id: `r-${Date.now()}`,
      productId: id!,
      userName: 'You',
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
    };

    setLocalReviews([review, ...localReviews]);
    setNewComment('');
    setNewRating(5);
    setShowReviewForm(false);
  };

  return (
    <main className="pb-24 pt-0 md:pt-24 min-h-screen relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-4 rounded-full flex items-center justify-between gap-6 shadow-2xl min-w-[300px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Check size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">Added to bag</p>
                <p className="text-[10px] text-white/60 font-medium line-clamp-1">{product.name}</p>
              </div>
            </div>
            <button onClick={() => navigate('/cart')} className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4">
              View Bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Share2 size={20} />
          </button>
          <FavoriteButton product={product} size="sm" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10 px-0 md:px-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full md:w-1/2 aspect-[4/5] md:aspect-[3/4] md:rounded-[48px] overflow-hidden bg-zinc-100 relative shadow-inner"
        >
          <img 
            src={product.image} 
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="w-full md:w-1/2 space-y-8 px-6 md:px-0 md:py-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-full">{product.category}</span>
              <div className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-full shadow-sm">
                <Star size={12} className="fill-white stroke-none" />
                <span className="text-[10px] font-bold">{product.rating}</span>
                <span className="text-[10px] text-zinc-400 ml-1">({product.reviews})</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase italic leading-none">{product.name}</h1>
              <button 
                onClick={handleShare}
                className="hidden md:flex w-12 h-12 rounded-full bg-zinc-50 items-center justify-center border border-zinc-200 hover:border-black transition-all active:scale-95"
              >
                <Share2 size={20} />
              </button>
            </div>
            <p className="text-3xl font-mono font-bold tracking-tight">{formatPrice(product.price)}</p>
          </div>

          <p className="text-zinc-500 leading-relaxed text-sm font-medium">
            {product.description}
          </p>

          <div className="space-y-6 pt-4 border-t border-zinc-100">
            {/* Color Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest">Color</span>
                <span className="text-xs font-bold text-zinc-400">{selectedColor}</span>
              </div>
              <div className="flex gap-3">
                {['Black', 'White', 'Silver'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center p-1 transition-all ${selectedColor === color ? 'border-black' : 'border-transparent'}`}
                  >
                    <div className="w-full h-full rounded-full border border-zinc-200" style={{ backgroundColor: color.toLowerCase() }}></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest">Size</span>
                <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 underline underline-offset-4">Size Guide</button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${
                      selectedSize === size 
                        ? 'bg-black text-white border-black shadow-lg shadow-black/20' 
                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-8">
            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white px-8 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-black/10"
              >
                <ShoppingBag size={18} strokeWidth={2.5} />
                Tambah ke Keranjang
              </button>
              <FavoriteButton product={product} size="lg" />
            </div>
            
            {/* Value Props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <Truck size={20} className="text-zinc-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest italic">Free Delivery</p>
                  <p className="text-[10px] text-zinc-400">Pesanan di atas $150</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <RefreshCw size={20} className="text-zinc-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest italic">30 Hari Garansi</p>
                  <p className="text-[10px] text-zinc-400">Tanpa pertanyaan</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <Shield size={20} className="text-zinc-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest italic">Bayar Aman</p>
                  <p className="text-[10px] text-zinc-400">Enkripsi 256-bit</p>
                </div>
              </div>
            </div>

            {store && (
              <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-100">
                    <img src={store.image} alt={store.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Dijual oleh</p>
                    <p className="text-sm font-bold uppercase italic">{store.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/store/${store.id}`)}
                  className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 hover:text-zinc-500"
                >
                  Kunjungi Toko
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-24 px-6 md:px-10 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-100">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter italic uppercase leading-none">FEEDBACK</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Verified Guest Impressions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full shadow-lg">
              <Star size={14} className="fill-white stroke-none" />
              <span className="text-xs font-bold leading-none">{product.rating}</span>
              <span className="text-zinc-400 font-bold uppercase text-[10px] ml-1">Overall based on {product.reviews + (localReviews.length - REVIEWS.filter(r => r.productId === id).length)} reviews</span>
            </div>
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-zinc-100 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
            >
              {showReviewForm ? 'Cancel' : 'Write Experience'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showReviewForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmitReview} className="bg-zinc-50 rounded-[40px] p-8 space-y-6 border border-zinc-100 border-dashed">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold uppercase italic tracking-tight">Your Impression</h4>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Rate and describe your acquisition</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={24} 
                          className={star <= newRating ? 'fill-black stroke-none' : 'text-zinc-300'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with this item..."
                  className="w-full bg-white border border-zinc-200 rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none resize-none h-32"
                />

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-black text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all"
                  >
                    Transmit Feedback
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 lg:grid-cols-2">
          {localReviews.length > 0 ? (
            localReviews.map((review) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-zinc-100 rounded-[40px] p-8 space-y-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100">
                      <User size={20} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase italic tracking-tight">{review.userName}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? 'fill-black stroke-none' : 'text-zinc-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-zinc-500 italic leading-relaxed text-sm font-medium border-l-2 border-zinc-100 pl-6 py-1">
                  "{review.comment}"
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Authentic Signature</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="lg:col-span-2 bg-zinc-50 border border-zinc-100 border-dashed rounded-[48px] p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border border-zinc-100 shadow-sm mb-6">
                <MessageSquare size={32} className="text-zinc-200" />
              </div>
              <h3 className="text-xl font-bold italic uppercase tracking-tighter mb-2">No Impressions Yet</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Identify your purchase and leave the first mark</p>
              <button 
                onClick={() => setShowReviewForm(true)}
                className="mt-8 px-8 py-4 bg-zinc-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all"
              >
                Write Experience
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
