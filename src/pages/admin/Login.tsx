import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, Chrome, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn: googleSignIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Initialize admin accounts list with standard operators if empty
      const savedAccountsStr = localStorage.getItem('urban_admin_accounts');
      let adminAccounts = [];
      if (savedAccountsStr) {
        try {
          adminAccounts = JSON.parse(savedAccountsStr);
        } catch (err) {
          console.error(err);
        }
      } else {
        adminAccounts = [
          { email: 'admin@urban.com', joined: '04 Jun 2026, 05:40' },
          { email: 'super_operator@urban.com', joined: '01 Jun 2026, 12:00' }
        ];
      }

      // Add the current logged-in email if it's not already in the admin list
      if (!adminAccounts.some((acc: any) => acc.email.toLowerCase() === email.toLowerCase())) {
        adminAccounts.push({
          email: email,
          joined: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });
      }
      localStorage.setItem('urban_admin_accounts', JSON.stringify(adminAccounts));

      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError('System verification failed. check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      localStorage.setItem('isAdmin', 'true');
      
      // Attempt login email collection
      const savedAccountsStr = localStorage.getItem('urban_admin_accounts');
      let adminAccounts = [];
      if (savedAccountsStr) {
        try {
          adminAccounts = JSON.parse(savedAccountsStr);
        } catch (err) {
          console.error(err);
        }
      } else {
        adminAccounts = [
          { email: 'admin@urban.com', joined: '04 Jun 2026, 05:40' },
          { email: 'super_operator@urban.com', joined: '01 Jun 2026, 12:00' }
        ];
      }

      const googleUserEmail = auth.currentUser?.email || 'google_admin@urban.com';
      if (!adminAccounts.some((acc: any) => acc.email.toLowerCase() === googleUserEmail.toLowerCase())) {
        adminAccounts.push({
          email: googleUserEmail,
          joined: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });
      }
      localStorage.setItem('urban_admin_accounts', JSON.stringify(adminAccounts));

      navigate('/admin/dashboard');
    } catch (err) {
      setError('Google synchronization failed.');
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-6 bg-zinc-900 relative">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors bg-white/5 border border-white/10 px-5 py-2.5 rounded-full"
      >
        <ArrowLeft size={14} /> Back to Landing Page
      </Link>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/20">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white uppercase italic">ADMIN<span className="text-zinc-500">ACCESS</span></h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">UrbanMall Internal Systems</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-[10px] font-bold uppercase text-center tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-white transition-colors">
                <User size={18} />
              </div>
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS"
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 text-xs font-bold tracking-widest focus:outline-none focus:border-white/40 transition-all uppercase"
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
                placeholder="PASSWORD"
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 text-xs font-bold tracking-widest focus:outline-none focus:border-white/40 transition-all uppercase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Authenticate'} <ArrowRight size={16} />
            </button>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-transparent border border-white/10 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/5 active:scale-[0.98] transition-all"
            >
              <Chrome size={16} /> Sign in with Universal ID
            </button>
          </div>
        </form>

        <div className="flex flex-col items-center gap-4">
          <Link to="/admin/register" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
            Request New Operator Access
          </Link>
          <p className="text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            Secured by UrbanMall Systems • v1.0.4
          </p>
        </div>
      </motion.div>
    </main>
  );
}
