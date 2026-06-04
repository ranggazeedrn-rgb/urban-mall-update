import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="bg-white min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-10 py-6">
        <Link to="/" className="text-2xl font-bold tracking-tighter italic">URBAN<span className="text-zinc-400">MALL</span></Link>
        <div className="flex items-center gap-8">
          <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest hover:text-zinc-500 transition-colors">Experience</Link>
          <Link to="/stores" className="text-[10px] font-bold uppercase tracking-widest hover:text-zinc-500 transition-colors">Directory</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Next Gen Retail Infrastructure</span>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-none italic uppercase">
              Retail <br /> 
              <span className="text-zinc-300">Reimagined</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-2xl text-lg font-medium leading-relaxed"
          >
            Experience the future of commerce at Urban Mall. A high-tech ecosystem where luxury iteration meets digital precision in the heart of Jakarta.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center"
          >
            <Link to="/shop" className="bg-black text-white px-12 py-5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20">
              Explore Collection <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-zinc-50 rounded-full blur-[120px] -z-10 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-50 rounded-full blur-[120px] -z-10 -translate-x-1/2"></div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-10 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Zap, title: "Neural Logistics", desc: "Real-time inventory synchronization powered by our edge computing network." },
              { icon: ShieldCheck, title: "Vault Protocol", desc: "Secure multi-factor authentication for every high-value acquisition." },
              { icon: Globe, title: "Global Sync", desc: "Consistent cross-platform experience from mobile to terminal displays." }
            ].map((feature, i) => (
              <div key={i} className="space-y-6 group">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <feature.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold tracking-tighter uppercase italic">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Teaser Section */}
      <section className="py-40 px-10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">The Blueprint</span>
                <h2 className="text-6xl font-bold tracking-tighter italic uppercase leading-none">Command & <span className="text-zinc-300">Control</span></h2>
                <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                    Our administrative engine provides retailers with unparalleled oversight. Monitor capital flow, manage inventory metadata, and audit store performance through a unified cryptographic dashboard.
                </p>
                <div className="pt-6">
                    <Link to="/stores" className="group inline-flex items-center gap-4 text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-2 hover:border-zinc-300 transition-all">
                        Explore Retail Network <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
            <div className="relative">
                <div className="aspect-square bg-zinc-100 rounded-[64px] overflow-hidden rotate-3 shadow-2xl relative">
                    <img 
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070" 
                      alt="Modern Hub" 
                      className="w-full h-full object-cover grayscale opacity-50 contrast-125"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white border border-zinc-100 rounded-[40px] p-8 shadow-xl -rotate-6 hidden md:flex flex-col justify-between">
                    <Sparkles className="text-zinc-900" size={32} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Premium Architecture</p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-10 border-t border-zinc-100 bg-zinc-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tighter italic">URBAN<span className="text-zinc-400">MALL</span></h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">© 2026 Urban Mall Infrastructure. All iterations reserved.</p>
          </div>
          <div className="flex gap-12">
            {['Inquiry', 'Protocols', 'Terminal', 'Registry'].map(link => (
              <a key={link} href="#" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
