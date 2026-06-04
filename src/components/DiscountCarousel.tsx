import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { PROMOTIONS } from '../data';
import { cn } from '../lib/utils';

export function DiscountCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMOTIONS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % PROMOTIONS.length);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + PROMOTIONS.length) % PROMOTIONS.length);
  };

  const promo = PROMOTIONS[currentIndex];

  return (
    <div className="relative w-full h-[200px] md:h-[280px] overflow-hidden rounded-[32px] md:rounded-[48px] bg-zinc-100 group shadow-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={promo.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex flex-col md:flex-row"
        >
          {/* Background/Image Section */}
          <div className="relative w-full h-full">
            <img
              src={promo.image}
              alt={promo.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
            />
            
            {/* Content Section */}
            <div className="relative h-full flex flex-col justify-center px-8 md:px-16 space-y-2 md:space-y-4 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md flex items-center gap-1.5 border border-white/10">
                  <Ticket size={10} className="text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Limited Offer</span>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-tight"
              >
                {promo.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xs md:text-sm text-zinc-300 font-bold uppercase tracking-widest max-w-md"
              >
                {promo.subtitle}
              </motion.p>

              {promo.discountCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-2"
                >
                  <div className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Code</span>
                    <span className="text-xs font-black uppercase tracking-tighter">{promo.discountCode}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-8 md:right-16 flex items-center gap-3">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-8 md:left-16 flex gap-1.5">
        {PROMOTIONS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(idx);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              currentIndex === idx ? "w-8 bg-white" : "w-1.5 bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}
