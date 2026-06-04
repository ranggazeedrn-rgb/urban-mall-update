import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { STORES } from '../data';
import { Store } from '../types';
import { Star, MapPin, ArrowRight, Layers, Compass, Shirt, Smartphone, Coffee, Dumbbell, Home as HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const API_KEY = 
  process.env.GOOGLE_MAPS_PLATFORM_KEY || 
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || 
  '';

const hasValidKey = Boolean(API_KEY) && 
  API_KEY !== 'YOUR_API_KEY' && 
  API_KEY !== 'MY_GEMINI_API_KEY' &&
  API_KEY !== 'placeholder' &&
  API_KEY.length > 20 && // Real keys are usually ~39 chars
  API_KEY.startsWith('AIza'); // Google Maps keys start with AIza

interface MarkerWithInfoWindowProps {
  store: Store;
}

const MarkerWithInfoWindow = ({ store }: MarkerWithInfoWindowProps) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={store.location}
        onClick={() => setIsOpen(true)}
      >
        <Pin background="#000" glyphColor="#fff" borderColor="#000" />
      </AdvancedMarker>
      {isOpen && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setIsOpen(false)}
        >
          <div className="p-2 min-w-[200px] space-y-3">
            <img 
              src={store.image} 
              alt={store.name} 
              referrerPolicy="no-referrer"
              className="w-full h-24 object-cover rounded-xl"
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">{store.category}</span>
                <div className="flex items-center gap-1">
                  <Star size={10} className="fill-black" />
                  <span className="text-[10px] font-bold">{store.rating}</span>
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase italic tracking-tight">{store.name}</h3>
            </div>
            <Link 
              to={`/store/${store.id}`}
              className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
            >
              View Store <ArrowRight size={12} />
            </Link>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapSetupSplash = ({ onClose }: { onClose: () => void }) => (
  <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 text-center">
    <div className="max-w-md space-y-6">
      <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
        <MapPin size={32} />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold uppercase italic tracking-tighter">Google Maps Key Required</h2>
        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
          The interactive Live Map feature requires a valid Google Maps Platform API key to be set in your environment secrets.
        </p>
      </div>
      
      <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-left space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Setup Instructions</p>
        <ol className="text-[10px] font-bold uppercase tracking-tight text-zinc-600 space-y-2">
          <li className="flex gap-2">
            <span className="w-4 h-4 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">1</span>
            <span>Get a key from <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-black underline">Cloud Console</a></span>
          </li>
          <li className="flex gap-2">
            <span className="w-4 h-4 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">2</span>
            <span>Open <strong className="text-black">Settings (⚙️)</strong> → <strong className="text-black">Secrets</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="w-4 h-4 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">3</span>
            <span>Add <code className="bg-white px-1 border rounded">GOOGLE_MAPS_PLATFORM_KEY</code></span>
          </li>
        </ol>
      </div>

      <button 
        onClick={onClose}
        className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
      >
        Dismiss
      </button>
    </div>
  </div>
);

export const StoreMap = () => {
  const [viewMode, setViewMode] = useState<'schematic' | 'satellite'>(hasValidKey ? 'satellite' : 'schematic');
  const [showSetup, setShowSetup] = useState(false);
  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const [selectedStore, setSelectedStore] = useState<Store | null>(STORES[0] || null);

  // Center coordinates for active Google map
  const defaultCenter = STORES.length > 0
    ? STORES.reduce(
        (acc, store) => ({
          lat: acc.lat + store.location.lat / STORES.length,
          lng: acc.lng + store.location.lng / STORES.length,
        }),
        { lat: 0, lng: 0 }
      )
    : { lat: -6.2245, lng: 106.8065 };

  // Define details for schematic floor layouts
  const schematicData = {
    1: [
      {
        id: 'zone-fashion',
        name: 'Fashion Boulevard',
        level: 'Level 1, West Wing',
        desc: 'Curated high-end boutique zone housing the finest designer creations.',
        stores: STORES.filter((s) => s.id === 's1'),
        color: 'from-amber-50 to-orange-50/50',
        borderColor: 'border-orange-200',
        textTheme: 'text-orange-950',
        icon: Shirt,
        gridArea: 'col-span-12 md:col-span-6 h-48',
      },
      {
        id: 'zone-electronics',
        name: 'Tech Central',
        level: 'Level 1, East Wing',
        desc: 'Advanced modern workshop with futuristic design concepts.',
        stores: STORES.filter((s) => s.id === 's2'),
        color: 'from-blue-50 to-indigo-50/50',
        borderColor: 'border-blue-200',
        textTheme: 'text-blue-950',
        icon: Smartphone,
        gridArea: 'col-span-12 md:col-span-6 h-48',
      },
      {
        id: 'zone-home',
        name: 'Atrium Galleria',
        level: 'Level 1, Central East',
        desc: 'Minimalist living aesthetics for serene home architecture.',
        stores: STORES.filter((s) => s.id === 's5'),
        color: 'from-zinc-50 to-neutral-100/50',
        borderColor: 'border-zinc-300',
        textTheme: 'text-zinc-950',
        icon: HomeIcon,
        gridArea: 'col-span-12 h-44',
      },
    ],
    2: [
      {
        id: 'zone-dining',
        name: 'Gourmet Plaza',
        level: 'Level 2, North Terrace',
        desc: 'Artisanal bites, freshly roasted coffee beans, and social spaces.',
        stores: STORES.filter((s) => s.id === 's3'),
        color: 'from-rose-50 to-pink-50/50',
        borderColor: 'border-rose-200',
        textTheme: 'text-rose-950',
        icon: Coffee,
        gridArea: 'col-span-12 md:col-span-6 h-52',
      },
      {
        id: 'zone-sports',
        name: 'Sports Arena',
        level: 'Level 2, South Mezzanine',
        desc: 'State-of-the-art apparel and performance gear fields.',
        stores: STORES.filter((s) => s.id === 's4'),
        color: 'from-emerald-50 to-teal-50/50',
        borderColor: 'border-emerald-200',
        textTheme: 'text-emerald-950',
        icon: Dumbbell,
        gridArea: 'col-span-12 md:col-span-6 h-52',
      },
    ],
  };

  return (
    <div className="w-full bg-white rounded-[48px] border border-zinc-100 shadow-xl overflow-hidden flex flex-col">
      {/* Top Controls / Modes bar */}
      <div className="p-6 md:p-8 border-b border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Compass size={20} className="animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase italic tracking-tight">Mall Store Locator</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Interactive schematic and GPS guide</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl border border-zinc-200/50">
          <button
            onClick={() => setViewMode('schematic')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              viewMode === 'schematic' ? 'bg-white text-black shadow-sm font-black' : 'text-zinc-500 hover:text-black'
            }`}
          >
            Schematic Blueprints
          </button>
          
          <button
            onClick={() => {
              if (hasValidKey) {
                setViewMode('satellite');
              } else {
                setShowSetup(true);
              }
            }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'satellite' ? 'bg-white text-black shadow-sm font-black' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Live Map
            {!hasValidKey && <span className="text-[8px] px-1 py-0.5 bg-zinc-200 text-zinc-500 rounded font-bold uppercase">Locked</span>}
          </button>
        </div>
      </div>

      {/* Map Content Viewport */}
      <div className="relative">
        {showSetup && <MapSetupSplash onClose={() => setShowSetup(false)} />}
        
        {viewMode === 'satellite' && hasValidKey ? (
          <div className="w-full h-[550px] relative">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={defaultCenter}
                defaultZoom={15}
                mapId="STORE_LOCATOR_MAP_SATELLITE"
                disableDefaultUI={true}
                style={{ width: '100%', height: '100%' }}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                gestureHandling={'greedy'}
              >
                {STORES.map((store) => (
                  <MarkerWithInfoWindow key={store.id} store={store} />
                ))}
              </Map>
            </APIProvider>
            
            <div className="absolute top-6 left-6 bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-2xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-bold uppercase tracking-widest">{STORES.length} GPS OUTPOSTS</span>
            </div>
          </div>
        ) : (
          /* Blueprint schematic */
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
            {/* Main draw field */}
            <div className="lg:col-span-8 p-6 md:p-10 bg-slate-950 font-mono text-zinc-300 flex flex-col justify-between relative overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-zinc-100">
              {/* Architectural Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-25"></div>
              
              {/* Header info / floor selector */}
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[8px] tracking-[0.4em] text-cyan-400 font-extrabold uppercase">SCHEMATIC V1.03</span>
                  <h1 className="text-lg font-black tracking-tighter text-white uppercase italic">URBAN SHOPPING DIRECTORY</h1>
                </div>
                
                <div className="flex gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  {[1, 2].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setActiveFloor(lvl as 1 | 2)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        activeFloor === lvl ? 'bg-cyan-500 text-slate-950 shadow-inner' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      LEVEL 0{lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Zones layout blueprint */}
              <div className="relative z-10 my-10 grid grid-cols-12 gap-4">
                {schematicData[activeFloor].map((zone) => {
                  const ZoneIcon = zone.icon;
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all group relative overflow-hidden cursor-pointer ${zone.gridArea}`}
                      onClick={() => {
                        if (zone.stores.length > 0) setSelectedStore(zone.stores[0]);
                      }}
                    >
                      <div className="absolute top-0 right-0 p-8 text-slate-800 pointer-events-none group-hover:text-cyan-500/10 transition-colors">
                        <ZoneIcon size={120} />
                      </div>

                      <div className="space-y-1 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] bg-slate-800 text-cyan-400 font-extrabold px-2 py-0.5 rounded tracking-widest uppercase">
                            {zone.level}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">{zone.name}</h3>
                        <p className="text-[10px] text-zinc-400 leading-normal max-w-xs">{zone.desc}</p>
                      </div>

                      {/* Store markers contained inside */}
                      <div className="flex items-center gap-3 mt-4 relative z-10">
                        {zone.stores.map((st) => (
                          <button
                            key={st.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStore(st);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                              selectedStore?.id === st.id
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                            {st.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Blueprint legends */}
              <div className="relative z-10 flex text-[8px] text-zinc-500 font-bold uppercase tracking-widest flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-slate-950">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> ACTIVE SHOP POSITION</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> RESTROOMS / ELEVATORS</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> GUEST VIP LOUNGE</span>
                <span className="ml-auto text-cyan-400 font-black">JAKARTA URBAN CORP. ALL RIGHTS SECURED</span>
              </div>
            </div>

            {/* Interactive details inspect card */}
            <div className="lg:col-span-4 p-8 flex flex-col justify-between space-y-8 bg-white min-h-[400px]">
              <AnimatePresence mode="wait">
                {selectedStore ? (
                  <motion.div
                    key={selectedStore.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 flex flex-col justify-between h-full"
                  >
                    <div className="space-y-6">
                      <div className="relative h-44 rounded-3xl overflow-hidden shadow-md">
                        <img
                          src={selectedStore.image}
                          alt={selectedStore.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow">
                          <Star size={11} className="fill-black text-black" />
                          <span className="text-[10px] font-black">{selectedStore.rating}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-xl">
                          {selectedStore.category}
                        </span>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none pt-2">{selectedStore.name}</h2>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">{selectedStore.description}</p>
                      </div>

                      <div className="pt-4 border-t border-zinc-50 space-y-3">
                        <div className="flex items-center gap-2.5 text-zinc-500">
                          <MapPin size={15} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {selectedStore.id === 's1' || selectedStore.id === 's2' || selectedStore.id === 's5' ? 'LEVEL 1, CENTRAL BLVD' : 'LEVEL 2, UPPER GALLERY'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-zinc-500">
                          <Layers size={15} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">HOURS: 10:00 AM - 10:00 PM</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/store/${selectedStore.id}`}
                      className="w-full py-4 bg-black hover:bg-zinc-800 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-black/10 active:scale-95 shrink-0"
                    >
                      Enter Shop <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 py-10 space-y-4">
                    <Compass size={40} className="stroke-1 text-zinc-300" />
                    <div>
                      <h4 className="text-sm font-bold uppercase text-zinc-800">Select an Area</h4>
                      <p className="text-[11px] font-medium text-zinc-400 max-w-xs mt-1">Click a suite on the blueprint directory map to view shop catalog details.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
    </div>
  </div>
);
};

export const SingleStoreMap = ({ store }: { store: Store }) => {
  if (!hasValidKey) {
    // Return a neat stylized blueprint card fallback for store details so the map slot is never empty
    return (
      <div className="w-full h-80 rounded-[40px] bg-slate-950 border border-slate-800 p-8 flex flex-col justify-between font-mono relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-[7px] text-cyan-400 font-extrabold uppercase tracking-[0.3em]">GPS DIRECT COORD</span>
            <h3 className="text-sm font-black text-white uppercase tracking-widest pt-0.5">{store.name} POSITION</h3>
          </div>
          <MapPin size={20} className="text-cyan-400 animate-pulse" />
        </div>

        <div className="relative z-10 text-center py-4">
          <div className="w-12 h-12 bg-slate-900 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto text-cyan-400 shadow-xl mb-3">
            <Compass size={22} className="animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <p className="text-[10px] text-white font-extrabold uppercase tracking-widest">{store.category} - LEVEL 01/02</p>
          <p className="text-[9px] text-zinc-500 mt-1 uppercase font-bold">LAT: {store.location.lat} // LNG: {store.location.lng}</p>
        </div>

        <div className="relative z-10 text-[7px] text-zinc-500 font-bold border-t border-slate-900 pt-3 flex justify-between uppercase">
          <span>ZONE: ATRIUM APEX</span>
          <span>JAKARTA MALL GR.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-[40px] overflow-hidden border border-zinc-100 shadow-lg">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={store.location}
          defaultZoom={17}
          mapId={`STORE_MAP_${store.id}`}
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling={'greedy'}
        >
          <AdvancedMarker position={store.location}>
            <Pin background="#000" glyphColor="#fff" borderColor="#000" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};
