import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, Mail, Shield, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Persist the newly registered admin account to local storage
      const savedAccountsStr = localStorage.getItem('urban_admin_accounts');
      let adminAccounts = [];
      if (savedAccountsStr) {
        try {
          adminAccounts = JSON.parse(savedAccountsStr);
        } catch (err) {
          console.error(err);
        }
      } else {
        // Bootstrap defaults if empty
        adminAccounts = [
          { email: 'admin@urban.com', joined: '04 Jun 2026, 05:40' },
          { email: 'super_operator@urban.com', joined: '01 Jun 2026, 12:00' }
        ];
      }
      
      adminAccounts.push({
        email: email,
        joined: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      });
      localStorage.setItem('urban_admin_accounts', JSON.stringify(adminAccounts));

      // Make sure they have admin rights
      localStorage.setItem('isAdmin', 'true');
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-white relative">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors bg-white/5 border border-white/10 px-5 py-2.5 rounded-full"
      >
        <ArrowLeft size={14} /> Back to Landing Page
      </Link>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-xl border border-white/10 ring-4 ring-white/5">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">NEW<span className="text-zinc-500">OPERATOR</span></h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Establish System Credentials</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-bold uppercase text-center tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-white transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                placeholder="SYSTEM EMAIL"
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-5 pl-12 pr-4 text-xs font-bold tracking-widest focus:outline-none focus:border-white/40 transition-all uppercase placeholder:text-zinc-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-white transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                placeholder="ACCESS PASSWORD"
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-5 pl-12 pr-4 text-xs font-bold tracking-widest focus:outline-none focus:border-white/40 transition-all uppercase placeholder:text-zinc-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-2xl shadow-white/5 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Provision Account'} <Zap size={16} className="fill-black" />
          </button>
        </form>

        <div className="flex flex-col items-center gap-4">
            <Link to="/admin/login" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                Existing Operator? Sign In
            </Link>
            <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest text-center max-w-[280px]">
                By provisioning this account, you agree to comply with standard mall security protocols.
            </p>
        </div>
      </motion.div>
    </main>
  );
}

const Zap = ({ size, className, fill }: { size: number, className?: string, fill?: string }) => (
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
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);
