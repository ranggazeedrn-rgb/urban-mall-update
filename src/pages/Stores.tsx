import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STORES } from '../data';
import { Star, MapPin, ArrowRight, Search, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StoreMap } from '../components/StoreMap';

export default function Stores() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'distance'>('default');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(STORES.map(s => s.category));
    return Array.from(cats);
  }, []);

  // Request user location if sorting by distance
  useEffect(() => {
    if (sortBy === 'distance' && !userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error("Error getting location", error);
            alert("Could not get your location for distance sorting.");
            setSortBy('default');
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
        setSortBy('default');
      }
    }
  }, [sortBy, userLocation]);

  // Calculate distance formula (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const filteredStores = useMemo(() => {
    let result = STORES;

    // Filter by search
    if (searchQuery) {
      result = result.filter((store) =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(store => store.category === selectedCategory);
    }

    // Sort
    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'distance' && userLocation) {
      result = [...result].sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.location?.lat || 0, a.location?.lng || 0);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.location?.lat || 0, b.location?.lng || 0);
        return distA - distB;
      });
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy, userLocation]);

  return (
    <main className="pb-24 pt-10 md:pt-20 px-6 max-w-6xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase italic">OUR STORES</h1>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-2">Discover the best brands in town</p>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 border-b border-zinc-100 pb-2">
          <MapPin size={16} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Jakarta, ID</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <StoreMap />
      </motion.div>

      {/* Dynamic Store Search Engine & Filters */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">DIRECTORY LISTING</h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">Showing {filteredStores.length} of {STORES.length} elite mall suites</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none w-full sm:w-48 bg-white border border-zinc-200 rounded-full py-3.5 pl-6 pr-10 text-[10px] font-extrabold tracking-widest focus:outline-none focus:border-black transition-all uppercase cursor-pointer"
              >
                <option value="default">Sort by: Default</option>
                <option value="rating">Sort by: Top Rated</option>
                <option value="distance">Sort by: Nearest</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="SEARCH STORES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-full py-3.5 pl-12 pr-10 text-[10px] font-extrabold tracking-widest focus:outline-none focus:border-black transition-all uppercase shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              selectedCategory === null 
                ? 'bg-black text-white' 
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-black'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                selectedCategory === category 
                  ? 'bg-black text-white' 
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <AnimatePresence mode="popLayout">
          {filteredStores.length > 0 ? (
            <motion.div 
              layout
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-2"
            >
              {filteredStores.map((store, index) => {
                let distanceText = '';
                if (userLocation && store.location) {
                  const dist = calculateDistance(userLocation.lat, userLocation.lng, store.location.lat, store.location.lng);
                  distanceText = `• ${dist.toFixed(1)} km away`;
                }

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    key={store.id}
                  >
                    <Link 
                      to={`/store/${store.id}`}
                      className="group relative block bg-white border border-zinc-100 rounded-[32px] overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 h-full"
                    >
                      <div className="flex flex-col md:flex-row h-full">
                        <div className="w-full md:w-48 h-48 md:h-auto shrink-0 overflow-hidden relative">
                          <img 
                            src={store.image} 
                            alt={store.name} 
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        
                        <div className="p-8 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md">{store.category}</span>
                              <div className="flex items-center gap-1">
                                <Star size={12} className="fill-black" />
                                <span className="text-xs font-bold">{store.rating}</span>
                              </div>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-zinc-600 transition-colors uppercase italic">{store.name}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{store.description}</p>
                          </div>

                          <div className="mt-6 flex flex-col justify-between pt-4 border-t border-zinc-50 gap-2">
                            <div className="flex items-center gap-1 text-zinc-400">
                              <MapPin size={14} />
                              <span className="text-[10px] font-medium uppercase tracking-wider">
                                {store.id === 's1' || store.id === 's2' || store.id === 's5' ? 'Level 1, Central Wing' : 'Level 2, Upper Gallery'} {distanceText}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group/btn mt-1 text-black">
                              Visit Store <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100">
                <Search size={24} className="text-zinc-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight italic">No stores found</h3>
                <p className="text-xs text-zinc-400 font-medium max-w-sm mt-1">We couldn't find any suites matching your filters.</p>
              </div>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSortBy('default');
                }}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 decoration-2"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
