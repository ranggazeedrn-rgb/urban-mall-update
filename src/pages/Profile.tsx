import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, User, Eye, Globe, LogIn, Sparkles, Check, CheckCircle2, ChevronRight, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { sheetsService } from '../lib/sheetsService';
import { STORES } from '../data';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeId: string;
  storeName: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  points: number;
  joinedDate: string;
  syncedToGoogle: boolean;
}

export default function Profile() {
  const { user, accessToken, signIn } = useAuth();
  
  // Spreadsheet integration coordinates
  const sheetId = localStorage.getItem('urban_sheet_id');
  const isSheetConnected = !!sheetId && !!accessToken;

  // Active view tab when logged out: 'register' | 'login'
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');

  // Customer account registry states
  const [registry, setRegistry] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem('urban_customer_registry');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(() => {
    const saved = localStorage.getItem('urban_current_customer');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });

  // Account creation form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredStore, setPreferredStore] = useState('s1');
  const [tier, setTier] = useState<'BRONZE' | 'SILVER' | 'GOLD'>('SILVER');
  const [password, setPassword] = useState('');

  // Status & feed variables
  const [txStatus, setTxStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [syncingGoogle, setSyncingGoogle] = useState(false);

  // Synchronize entire customer accounts array into Google Spreadsheet columns N1:T30
  const handleSyncRegistryToSpreadsheet = async (sourceList: CustomerProfile[] = registry) => {
    if (!sheetId) {
      setTxStatus({
        type: 'error',
        message: 'Google Sheets integration not active. Please connect to a spreadsheet first in the Admin Dashboard.'
      });
      return;
    }

    let tokenToUse = accessToken;
    if (!tokenToUse) {
      try {
        const refreshedToken = await signIn();
        if (refreshedToken) {
           tokenToUse = refreshedToken;
        } else {
           setTxStatus({
             type: 'error',
             message: 'Google Sheets integration requires Admin login with Google. Authorization failed.'
           });
           return;
        }
      } catch (e) {
        setTxStatus({
           type: 'error',
           message: 'Google Sheets integration requires Admin login with Google. Authorization failed.'
        });
        return;
      }
    }

    setSyncingGoogle(true);
    setTxStatus({ type: 'idle', message: '' });

    try {
      const headerRow = [
        ['Customer Account Registry Column Database (Live From Client Portal)'],
        ['Registration Date', 'Profile ID', 'Full Name', 'Email Address', 'WhatsApp/Phone', 'Preferred Pick-up Store', 'VIP Tier', 'Current Points Balance', 'Cloud Status']
      ];

      const dataRows = sourceList.map(cust => [
        cust.joinedDate,
        cust.id,
        cust.name,
        cust.email,
        cust.phone,
        cust.storeName,
        cust.tier,
        `${cust.points} PTS`,
        'Active Cloud Replication'
      ]);

      const values = [...headerRow, ...dataRows];
      
      // Update Google Spreadsheet Range N1-V30
      await sheetsService.updateSheet(sheetId, 'Sheet1!N1', values, tokenToUse);
      
      // Mark as synced in local registry
      const updatedRegistry = sourceList.map(c => ({ ...c, syncedToGoogle: true }));
      setRegistry(updatedRegistry);
      localStorage.setItem('urban_customer_registry', JSON.stringify(updatedRegistry));

      if (currentCustomer && sourceList.some(s => s.id === currentCustomer.id)) {
        const updatedCurrent = { ...currentCustomer, syncedToGoogle: true };
        setCurrentCustomer(updatedCurrent);
        localStorage.setItem('urban_current_customer', JSON.stringify(updatedCurrent));
      }

      setTxStatus({
        type: 'success',
        message: `Account entry successfully synchronized to Google Sheet (Range: N1-V${values.length})!`
      });
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        type: 'error',
        message: `Cloud transmission interrupted: ${err.message || 'Check spreadsheet accessibility context.'}`
      });
    } finally {
      setSyncingGoogle(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus({ type: 'idle', message: '' });

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setTxStatus({ type: 'error', message: 'Please write in all registration parameters.' });
      return;
    }

    // Check duplicate
    if (registry.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      setTxStatus({ type: 'error', message: 'E-mail is already bound to another member profile.' });
      return;
    }

    const selectedStoreObj = STORES.find(s => s.id === preferredStore) || STORES[0];
    const startingPoints = tier === 'GOLD' ? 5000 : tier === 'SILVER' ? 2500 : 1000;
    
    const newCustomer: CustomerProfile = {
      id: `UM-${Math.floor(1000000 + Math.random() * 9000000)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      storeId: preferredStore,
      storeName: selectedStoreObj.name,
      tier: tier,
      points: startingPoints,
      joinedDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      syncedToGoogle: false
    };

    const newRegistry = [...registry, newCustomer];
    setRegistry(newRegistry);
    localStorage.setItem('urban_customer_registry', JSON.stringify(newRegistry));
    
    // Login automatically
    setCurrentCustomer(newCustomer);
    localStorage.setItem('urban_current_customer', JSON.stringify(newCustomer));

    // Clear form inputs
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');

    // Trigger immediate auto-sync if connected
    if (sheetId && accessToken) {
      await handleSyncRegistryToSpreadsheet(newRegistry);
    } else {
      setTxStatus({
        type: 'success',
        message: 'Membership Account Created Locally! Ready to write to Google Sheets when internet connection / admin keys login.'
      });
    }
  };

  const handleLogin = (selectedEmail: string) => {
    const found = registry.find(c => c.email.toLowerCase() === selectedEmail.toLowerCase());
    if (found) {
      setCurrentCustomer(found);
      localStorage.setItem('urban_current_customer', JSON.stringify(found));
      setTxStatus({ type: 'success', message: `Welcome Back, ${found.name}!` });
    } else {
      setTxStatus({ type: 'error', message: 'Profile credential mismatch. Please select another.' });
    }
  };

  const handleLogout = () => {
    setCurrentCustomer(null);
    localStorage.removeItem('urban_current_customer');
    setTxStatus({ type: 'idle', message: '' });
  };

  return (
    <main className="w-full pb-24 pt-6 md:pt-12 px-6 max-w-6xl mx-auto space-y-8 min-h-screen">
      {/* Return Page Link & Admin Login */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-black text-[10px] font-bold uppercase tracking-widest transition-colors bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 px-5 py-2.5 rounded-full"
        >
          <ArrowLeft size={12} /> Kembali ke Landing Page
        </Link>
        <Link 
          to="/admin/login" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-black text-[10px] font-bold uppercase tracking-widest transition-colors bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 px-5 py-2.5 rounded-full"
        >
          <Shield size={12} /> Admin Login
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">MEMBER HUB</h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2">Create Account and persist directly with Google Spreadsheet Sync</p>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Globe size={14} className={isSheetConnected ? 'animate-pulse text-green-500' : ''} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            {isSheetConnected ? 'CLOUD GOOGLE SHEET ACTIVE' : 'LOCAL BUFFER ACTIVE'}
          </span>
        </div>
      </div>

      {txStatus.message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border text-xs font-bold transition-all ${
          txStatus.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {txStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1 uppercase tracking-wide leading-relaxed">{txStatus.message}</span>
        </div>
      )}

      {currentCustomer ? (
        /* ================== LOGGED IN DASHBOARD VIEW ================== */
        <div className="grid gap-8 lg:grid-cols-12 animate-fade-in">
          <div className="lg:col-span-5 space-y-8">
            {/* VIP Loyalty Pass Card representation */}
            <div className="bg-zinc-950 text-white rounded-[32px] p-8 space-y-8 relative overflow-hidden shadow-2xl border border-zinc-800">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-none tracking-tight">{currentCustomer.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1.5">{currentCustomer.id}</p>
                  </div>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  currentCustomer.tier === 'GOLD' 
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                    : currentCustomer.tier === 'SILVER' 
                      ? 'bg-zinc-300/10 text-zinc-300 border-zinc-200/20' 
                      : 'bg-amber-600/10 text-amber-500 border-amber-600/20'
                }`}>
                  {currentCustomer.tier} VIP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 text-center">
                <div className="text-left">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Points Balance</p>
                  <p className="text-2xl font-bold tracking-tight text-white mt-1">
                    {currentCustomer.points.toLocaleString()} <span className="text-[10px] text-zinc-400">PTS</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Pick-up Location</p>
                  <p className="text-sm font-bold text-white mt-2 truncate max-w-[120px] ml-auto">{currentCustomer.storeName}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold">
                <span className="text-zinc-500 uppercase tracking-widest">Spreadsheet Integration</span>
                <span className={`flex items-center gap-1.5 ${currentCustomer.syncedToGoogle ? 'text-green-400' : 'text-amber-400'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${currentCustomer.syncedToGoogle ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`}></span>
                  {currentCustomer.syncedToGoogle ? 'RECORDED IN GOOGLE SHEET' : 'LOCAL STAGE (SYNC READY)'}
                </span>
              </div>
            </div>

            {/* Loyalty Quick action Card/System control */}
            <div className="bg-white border border-zinc-100 rounded-[32px] p-8 space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">MEMBERSHIP ACTIONS</h4>
              <div className="space-y-3">
                <button 
                  onClick={() => handleSyncRegistryToSpreadsheet()}
                  disabled={syncingGoogle}
                  className="w-full py-4 px-6 bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-55 rounded-2xl flex items-center justify-between font-bold text-xs uppercase tracking-widest transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Globe size={14} className={syncingGoogle ? 'animate-spin' : ''} />
                    {syncingGoogle ? 'TRANSMITTING REPLICATIONS...' : 'REPLICATE TO SPREADSHEET'}
                  </span>
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 px-6 border border-zinc-200 hover:border-black rounded-2xl flex items-center justify-between text-zinc-500 hover:text-black font-bold text-xs uppercase tracking-widest transition-all"
                >
                  <span>Sign Out Account</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-zinc-50 border border-zinc-100 rounded-[40px] p-8 md:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="bg-white shadow-sm border border-zinc-100 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                Live Data Feed Logs
              </span>
              <h3 className="text-2xl font-bold tracking-tighter uppercase italic">Spreadsheet Audit Monitor</h3>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-lg">
                Your account registrations are configured to be logged into your connected Google Spreadsheet instantly inside real-time Column <code className="bg-zinc-200 text-zinc-800 px-1.5 py-0.5 rounded font-mono text-[10px]">N1:V30</code> database range. This enables offline ledger reporting and high accountability.
              </p>
            </div>

            {/* Current Registry List */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Store Registrants Queue ({registry.length})</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                {registry.map(cust => (
                  <div key={cust.id} className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-zinc-900">{cust.name} {cust.id === currentCustomer.id && <span className="text-[8px] bg-zinc-900 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">You</span>}</p>
                      <p className="text-[9px] text-zinc-400 font-mono">{cust.email} | {cust.tier} VIP</p>
                    </div>
                    <span className={`text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md ${
                      cust.syncedToGoogle 
                        ? 'bg-green-50 text-green-600 border border-green-150' 
                        : 'bg-amber-50 text-amber-500 border border-amber-100'
                    }`}>
                      {cust.syncedToGoogle ? 'CLOUD VALID' : 'LOCAL ONLY'}
                    </span>
                  </div>
                ))}
                {registry.length === 0 && (
                  <p className="text-zinc-400 italic text-[11px] py-4 text-center select-none">No registrations inside the record.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================== TABBED LOGGED OUT FORMS VIEW ================== */
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex bg-zinc-100 rounded-full p-1.5 max-w-sm mx-auto shadow-inner">
            <button 
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-3 text-center rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                authTab === 'register' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles size={12} />
                Create Account
              </span>
            </button>
            <button 
              onClick={() => setAuthTab('login')}
              className={`flex-1 py-3 text-center rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                authTab === 'login' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <LogIn size={12} />
                Sign In
              </span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {authTab === 'register' ? (
              /* ================== CREATE ACCOUNT FORM ================== */
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-sm space-y-6"
              >
                <div className="space-y-1 text-center">
                  <h3 className="text-xl font-bold tracking-tighter uppercase italic">NEW ACCOUNT CREATION</h3>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Fill registration fields to append directly to the spreadsheet</p>
                </div>

                <form onSubmit={handleCreateAccount} className="space-y-5 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-400 focus:border-black rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:bg-white transition-all text-zinc-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-400 focus:border-black rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:bg-white transition-all text-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">WhatsApp or Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+62 812-3456-7890"
                        className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-400 focus:border-black rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:bg-white transition-all text-zinc-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Preferred Pick-up Location</label>
                      <select 
                        value={preferredStore}
                        onChange={(e) => setPreferredStore(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-400 focus:border-black rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:bg-white transition-all text-zinc-900"
                      >
                        {STORES.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Security PIN / Password</label>
                      <input 
                        required
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-400 focus:border-black rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:bg-white transition-all text-zinc-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Loyalty Tier Choice (Select Bonus)</label>
                      <div className="flex gap-2">
                        {(['BRONZE', 'SILVER', 'GOLD'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTier(t)}
                            className={`flex-1 py-3 text-[10px] font-bold rounded-xl border transition-all uppercase tracking-wider ${
                              tier === t 
                                ? 'bg-zinc-950 text-white border-zinc-950' 
                                : 'bg-zinc-50 text-zinc-600 border-zinc-250 hover:bg-zinc-100'
                            }`}
                          >
                            {t} {t === 'GOLD' ? '5K' : t === 'SILVER' ? '2.5K' : '1K'} pts
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-center sm:text-left">
                      <Globe size={12} className={isSheetConnected ? 'text-green-500 animate-spin' : ''} />
                      {isSheetConnected 
                        ? 'CONNECTED (WILL APPED TO SHEET LIVE)' 
                        : 'SHEET STANDBY (SYNC READY)'}
                    </div>
                    <button
                      type="submit"
                      disabled={syncingGoogle}
                      className="w-full sm:w-auto bg-black hover:bg-zinc-800 disabled:opacity-55 text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-lg shadow-black/10 active:scale-95 transition-all"
                    >
                      {syncingGoogle ? 'WRITING SPREADSHEET ROW...' : 'CREATE & SIGN IN'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* ================== SIGN IN WITH ACTIVE MEMBERS ================== */
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-sm space-y-6"
              >
                <div className="space-y-1 text-center">
                  <h3 className="text-xl font-bold tracking-tighter uppercase italic text-zinc-900">MEMBER SIGN INTERFACE</h3>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Select a profile below to log in immediately and review live ledger updates</p>
                </div>

                <div className="space-y-3">
                  {registry.map(cust => (
                    <button
                      key={cust.id}
                      onClick={() => handleLogin(cust.email)}
                      className="w-full bg-zinc-50 border border-zinc-200/60 hover:bg-zinc-100 p-5 rounded-2xl flex items-center justify-between text-left transition-all hover:scale-[1.01]"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-zinc-900 text-sm">{cust.name}</p>
                          <span className="text-[7px] font-black uppercase bg-zinc-200/70 text-zinc-700 px-2 py-0.5 rounded-full tracking-wider">{cust.tier} VIP</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono">{cust.email} • {cust.storeName}</p>
                      </div>
                      <ChevronRight size={16} className="text-zinc-400" />
                    </button>
                  ))}

                  {registry.length === 0 && (
                    <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200/80 rounded-[28px] space-y-3">
                      <User size={30} className="mx-auto text-zinc-300" />
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
                        No member profiles detected on local disk.<br />
                        <span className="text-[10px] text-zinc-400 font-normal normal-case">Please use the "Create Account" tab above.</span>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
