import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Star, 
  MoreVertical,
  Activity,
  Award
} from 'lucide-react';

const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'Julian Voss', email: 'voss@example.com', joined: 'Oct 2025', orders: 12, spent: 4200, tier: 'Diamond' },
  { id: 'CUST-002', name: 'Aiden Reed', email: 'reed@example.com', joined: 'Nov 2025', orders: 8, spent: 2800, tier: 'Platinum' },
  { id: 'CUST-003', name: 'Leah Smith', email: 'smith@example.com', joined: 'Jan 2026', orders: 5, spent: 1200, tier: 'Gold' },
  { id: 'CUST-004', name: 'Marcus Thorne', email: 'thorne@example.com', joined: 'Feb 2026', orders: 24, spent: 12500, tier: 'Elite' },
];

export function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tighter uppercase italic">Clent Registry</h2>
          <p className="text-xs font-medium text-zinc-400">Audit and categorize mall patron profiles</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Identity Search..." 
            className="bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCustomers.map((customer) => (
          <motion.div 
            layout
            key={customer.id}
            className="bg-white rounded-[40px] border border-zinc-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0 opacity-50 group-hover:bg-zinc-100 transition-colors"></div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white border border-zinc-800 shadow-lg group-hover:scale-110 transition-transform">
                    <User size={24} className="fill-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tighter uppercase italic">{customer.name}</h3>
                    <div className="flex items-center gap-2 text-zinc-400">
                       <Shield size={10} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">{customer.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="bg-zinc-100 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-600 border border-zinc-200">
                     {customer.tier} Tier
                   </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 border-y border-zinc-50 py-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-zinc-500">
                      <Mail size={14} />
                      <span className="text-xs font-medium truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-500">
                      <Calendar size={14} />
                      <span className="text-xs font-medium">Joined {customer.joined}</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-zinc-500">
                      <Activity size={14} />
                      <span className="text-xs font-bold">{customer.orders} Acquisitions</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-500">
                      <Award size={14} />
                      <span className="text-xs font-bold">${customer.spent.toLocaleString()} Lifetime Impact</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                   {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-black" />)}
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 bg-zinc-50 rounded-xl hover:bg-black hover:text-white transition-all">
                  Profile Audit
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const User = ({ size, className, fill }: { size: number, className?: string, fill?: string }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill || "none"} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
