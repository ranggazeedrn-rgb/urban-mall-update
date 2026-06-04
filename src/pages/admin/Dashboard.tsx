import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  ComposedChart,
  Legend,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  LayoutDashboard, 
  Store, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  ArrowUpRight,
  Plus,
  Search,
  TrendingUp,
  Download,
  Package,
  Globe,
  Bell,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { StoreManagement } from './StoreManagement';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { CustomerManagement } from './CustomerManagement';
import { BroadcastNotification } from './BroadcastNotification';
import { STORES } from '../../data';
import { useAuth } from '../../lib/AuthContext';
import { sheetsService } from '../../lib/sheetsService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const REVENUE_DATA = [
  { name: 'Jan', value: 42000 },
  { name: 'Feb', value: 38000 },
  { name: 'Mar', value: 54000 },
  { name: 'Apr', value: 48000 },
  { name: 'May', value: 62000 },
  { name: 'Jun', value: 78000 },
  { name: 'Jul', value: 84232 },
];

const CATEGORY_DATA = [
  { name: 'Fashion', count: 18, color: '#000000' },
  { name: 'Electronics', count: 12, color: '#71717a' },
  { name: 'Food', count: 8, color: '#a1a1aa' },
  { name: 'Home', count: 4, color: '#e4e4e7' },
];

const TOP_STORES_PERFORMANCE_DATA = [
  { name: 'Vogue Essentials', revenue: 98000, target: 85000 },
  { name: 'Tech Haven', revenue: 84000, target: 80000 },
  { name: 'Urban Sport', revenue: 68000, target: 70000 },
  { name: 'Gourmet Street', revenue: 62000, target: 55000 },
  { name: 'Zen Living', revenue: 45000, target: 50000 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, accessToken, signIn, logout: authLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [sheetId, setSheetId] = useState<string | null>(localStorage.getItem('urban_sheet_id'));
  const [connecting, setConnecting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [syncingTrends, setSyncingTrends] = useState(false);
  const [syncingAdmins, setSyncingAdmins] = useState(false);

  const [adminAccounts, setAdminAccounts] = useState(() => {
    const saved = localStorage.getItem('urban_admin_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing urban_admin_accounts:', e);
      }
    }
    const defaults = [
      { email: 'admin@urban.com', joined: '04 Jun 2026, 05:40' },
      { email: 'super_operator@urban.com', joined: '01 Jun 2026, 12:00' }
    ];
    localStorage.setItem('urban_admin_accounts', JSON.stringify(defaults));
    return defaults;
  });

  const handleSyncAdminsToSheets = async () => {
    if (!sheetId) {
      alert('Establish Google Sheets connection first under "Overview" tab.');
      return;
    }
    let tokenToUse = accessToken;
    if (!tokenToUse) {
      try {
        const refreshedToken = await signIn();
        if (refreshedToken) {
           tokenToUse = refreshedToken;
        } else {
           return;
        }
      } catch (e) {
        alert('Failed to refresh authentication. Please try again.');
        return;
      }
    }
    setSyncingAdmins(true);
    try {
      const values = [
        ['Admin Email', 'Registration Timestamp'],
        ...adminAccounts.map((acc: any) => [acc.email, acc.joined])
      ];
      await sheetsService.updateSheet(sheetId, 'Sheet1!L1', values, tokenToUse);
      alert('Admin account credentials and operators list synced flawlessly to Google Sheets (Range: L1-M10)!');
    } catch (err: any) {
      console.error('Admin sync failed:', err);
      const msg = err.response?.data?.error?.message || err.message;
      alert(`Failed to synchronize admin accounts: ${msg}`);
    } finally {
      setSyncingAdmins(false);
    }
  };

  const [analyticsData, setAnalyticsData] = useState(() => {
    const saved = localStorage.getItem('urban_analytics_trends');
    return saved ? JSON.parse(saved) : {
      sales: [
        { date: '05/28', sales: 12000, users: 450 },
        { date: '05/29', sales: 15400, users: 512 },
        { date: '05/30', sales: 13200, users: 480 },
        { date: '05/31', sales: 17800, users: 620 },
        { date: '06/01', sales: 19500, users: 710 },
        { date: '06/02', sales: 22000, users: 805 },
        { date: '06/03', sales: 24232, users: 890 },
      ],
      dau: [
        { date: '05/28', activeUsers: 450, bounceRate: 24 },
        { date: '05/29', activeUsers: 512, bounceRate: 21 },
        { date: '05/30', activeUsers: 480, bounceRate: 22 },
        { date: '05/31', activeUsers: 620, bounceRate: 18 },
        { date: '06/01', activeUsers: 710, bounceRate: 15 },
        { date: '06/02', activeUsers: 805, bounceRate: 14 },
        { date: '06/03', activeUsers: 890, bounceRate: 12 },
      ]
    };
  });

  const handleSyncAnalyticsFromSheets = async () => {
    if (!sheetId) {
      alert('Establish Google Sheets connection first.');
      return;
    }
    let tokenToUse = accessToken;
    if (!tokenToUse) {
      try {
        const refreshedToken = await signIn();
        if (refreshedToken) {
           tokenToUse = refreshedToken;
        } else {
           return;
        }
      } catch (e) {
        alert('Failed to authorize with Google.');
        return;
      }
    }
    setSyncingTrends(true);
    try {
      const salesValues = [
        ['Date', 'Revenue Sales ($)', 'Daily Active Users'],
        ...analyticsData.sales.map((s: any, idx: number) => [s.date, s.sales, analyticsData.dau[idx]?.activeUsers || 0])
      ];
      await sheetsService.updateSheet(sheetId, 'Sheet1!H1', salesValues, tokenToUse);
      localStorage.setItem('urban_analytics_trends', JSON.stringify(analyticsData));
      alert('Analytics trends and DAU sales parameters synced flawlessly to your Google Sheet (Range: H1-J8)!');
    } catch (err) {
      console.error('Trend sync failed:', err);
      alert('Failed to synchronize trends.');
    } finally {
      setSyncingTrends(false);
    }
  };

  // Initialize store state from data
  const [stores, setStores] = useState(
    STORES.map((s) => ({
      ...s,
      status: 'Active',
      revenue: '$' + (Math.random() * 10000 + 2000).toFixed(0),
      date: 'Oct 20',
    }))
  );

  const handleLogout = async () => {
    await authLogout();
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  const handleConnectSheets = async () => {
    let tokenToUse = accessToken;
    if (!tokenToUse) {
      try {
        const refreshedToken = await signIn();
        if (refreshedToken) {
           tokenToUse = refreshedToken;
        } else {
           return;
        }
      } catch (e) {
        alert('Failed to authorize with Google.');
        return;
      }
    }

    setConnecting(true);
    try {
      const title = `UrbanMall Database - ${new Date().toLocaleDateString()}`;
      const spreadsheet = await sheetsService.createSpreadsheet(title, tokenToUse);
      const newSheetId = spreadsheet.spreadsheetId;
      setSheetId(newSheetId);
      localStorage.setItem('urban_sheet_id', newSheetId);
      alert(`Synchronized with Google Sheets: ${title}`);
    } catch (err: any) {
      console.error('Sheets connection failed:', err);
      const msg = err.response?.data?.error?.message || err.message;
      alert(`Failed to establish Google Sheets connection: ${msg}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleExportDataSource = async () => {
    if (!sheetId) {
      alert('Establish Google Sheets connection first.');
      return;
    }
    let tokenToUse = accessToken;
    if (!tokenToUse) {
      try {
        const refreshedToken = await signIn();
        if (refreshedToken) {
           tokenToUse = refreshedToken;
        } else {
           return;
        }
      } catch (e) {
        alert('Failed to authorize with Google.');
        return;
      }
    }

    try {
      const values = [
        ['Store ID', 'Name', 'Category', 'Status', 'Revenue', 'Entry Date'],
        ...stores.map(s => [s.id, s.name, s.category, s.status, s.revenue, s.date])
      ];
      await sheetsService.updateSheet(sheetId, 'Sheet1!A1', values, tokenToUse);
      alert('Store data successfully synchronized to Google Sheets.');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Data synchronization failed.');
    }
  };

  const handleNewEntry = async () => {
    const newStoreName = prompt("Enter new store name:");
    if (!newStoreName) return;

    const newCategory = prompt("Enter category (e.g., F&B, Retail, Services):", "Retail") || "Retail";

    const newStore = {
      id: `STR-${Math.floor(Math.random() * 10000)}`,
      name: newStoreName,
      category: newCategory,
      status: 'Active',
      revenue: '$' + (Math.random() * 5000 + 1000).toFixed(0),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    const updatedStores = [newStore, ...stores];
    setStores(updatedStores);

    if (sheetId && accessToken) {
        try {
            const values = [
                ['Store ID', 'Name', 'Category', 'Status', 'Revenue', 'Entry Date'],
                ...updatedStores.map(s => [s.id, s.name, s.category, s.status, s.revenue, s.date])
            ];
            await sheetsService.updateSheet(sheetId, 'Sheet1!A1', values, accessToken);
            alert('New store added and synced to Google Sheets!');
        } catch (err) {
            console.error('Auto-sync failed:', err);
            alert('New store added locally, but auto-sync to Sheets failed.');
        }
    } else {
        alert('New store added locally. Connect to Sheets to sync.');
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    
    // Add Title
    doc.setFontSize(22);
    doc.text('UrbanMall Admin Dashboard Report', 14, 20);
    
    // Add Subtitle
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
    
    let currentY = 40;

    // Summary Analytics
    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text('Performance Summary', 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Metric', 'Value', 'Change']],
      body: [
        ['Total Revenue', '$84,232', '+12.5%'],
        ['Active Stores', stores.filter(s => s.status === 'Active').length.toString(), '+2'],
        ['Total Products', '1,280', '+24'],
        ['New Customers', '890', '+18.2%'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Store Data
    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text('Store Data', 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['ID', 'Name', 'Category', 'Status', 'Revenue']],
      body: stores.map(s => [s.id, s.name, s.category, s.status, s.revenue]),
      theme: 'striped',
      headStyles: { fillColor: [40, 40, 40] }
    });
    
    // Check if we need to add a new page
    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // Admin Accounts Data
    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text('Administrative Accounts', 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Email', 'Registration Timestamp']],
      body: adminAccounts.map((acc: any) => [acc.email, acc.joined]),
      theme: 'striped',
      headStyles: { fillColor: [40, 40, 40] }
    });

    // Save PDF
    doc.save(`UrbanMall-Admin-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const stats = [
    { label: 'Total Revenue', value: '$84,232', change: '+12.5%', icon: BarChart3 },
    { label: 'Active Stores', value: stores.filter(s => s.status === 'Active').length.toString(), change: '+2', icon: Store },
    { label: 'Total Products', value: '1,280', change: '+24', icon: ShoppingBag },
    { label: 'New Customers', value: '890', change: '+18.2%', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 text-white flex flex-col p-6 hidden lg:flex sticky top-0 h-screen border-r border-zinc-900">
        <div className="mb-12 px-4 space-y-3">
          <h2 className="text-xl font-bold tracking-tighter italic">URBAN<span className="text-zinc-500">MALL</span></h2>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Admin Control Center</p>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-red-400 hover:text-white transition-all bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:border-white/10">
            <ArrowLeft size={10} /> Shift to Mall
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Overview' },
            { icon: Store, label: 'Stores' },
            { icon: ShoppingBag, label: 'Products' },
            { icon: Package, label: 'Orders' },
            { icon: Users, label: 'Customers' },
            { icon: Bell, label: 'Broadcast' },
            { icon: BarChart3, label: 'Analytics' },
            { icon: Settings, label: 'Settings' },
          ].map((item) => {
            const isActive = activeTab === item.label;
            return (
              <button 
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isActive ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Storage Usage</p>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-white w-3/4"></div>
            </div>
            <p className="text-[9px] text-zinc-400">750GB / 1TB Used</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={16} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Column Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header / Drawer Trigger */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white sticky top-0 z-40 w-full shrink-0">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-all"
          >
            <Menu size={22} className="text-zinc-900" />
          </button>
          <Link to="/shop" className="text-lg font-bold tracking-tighter italic">URBAN<span className="text-zinc-400">MALL</span></Link>
        </div>
        <Link 
          to="/shop" 
          className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-all bg-zinc-100 px-3 py-2 rounded-full border border-zinc-200"
        >
          <ArrowLeft size={10} /> Exit Admin
        </Link>
      </div>

      {/* Mobile Sidebar/Drawer Menu */}
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden"
            onClick={() => setIsDrawerOpen(false)}
          />
          {/* Slide-out Panel */}
          <div className="fixed top-0 left-0 h-full w-72 bg-zinc-950 text-white flex flex-col p-6 z-50 lg:hidden shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tighter italic">URBAN<span className="text-zinc-500">MALL</span></h2>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Admin Control Center</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
              {[
                { icon: LayoutDashboard, label: 'Overview' },
                { icon: Store, label: 'Stores' },
                { icon: ShoppingBag, label: 'Products' },
                { icon: Package, label: 'Orders' },
                { icon: Users, label: 'Customers' },
                { icon: Bell, label: 'Broadcast' },
                { icon: BarChart3, label: 'Analytics' },
                { icon: Settings, label: 'Settings' },
              ].map((item) => {
                const isActive = activeTab === item.label;
                return (
                  <button 
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.label);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-zinc-900 text-left text-[10px] font-bold uppercase tracking-widest transition-all ${
                      isActive ? 'bg-white text-black rounded-xl' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <item.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4">
              <Link 
                to="/shop" 
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-200 transition-all"
              >
                <ArrowLeft size={12} /> Shift to Mall View
              </Link>
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-400/10 hover:bg-red-400/20 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-400 transition-all"
              >
                <LogOut size={12} /> Logout Session
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 bg-zinc-50 overflow-x-hidden overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-10 w-full">
          {activeTab === 'Stores' ? (
            <StoreManagement stores={stores} setStores={setStores} />
          ) : activeTab === 'Products' ? (
            <ProductManagement />
          ) : activeTab === 'Orders' ? (
            <OrderManagement />
          ) : activeTab === 'Customers' ? (
            <CustomerManagement />
          ) : activeTab === 'Broadcast' ? (
            <BroadcastNotification />
          ) : activeTab === 'Overview' ? (
            <>
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Platform performance is up 15%</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase italic break-words">Executive Overview</h1>
                </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleConnectSheets}
                  disabled={connecting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    sheetId ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-white border border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <Globe size={14} className={sheetId ? 'animate-pulse' : ''} />
                  {connecting ? 'Synchronizing...' : sheetId ? 'Sheets Connected' : 'Connect Database'}
                </button>
                <button 
                  onClick={handleExportDataSource}
                  className="hidden md:flex items-center gap-2 bg-white border border-zinc-200 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 active:scale-95 transition-all"
                >
                  <Download size={14} />
                  Export to Sheets
                </button>
                <button 
                  onClick={handleGeneratePDF}
                  className="hidden md:flex items-center gap-2 bg-white border border-zinc-200 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 active:scale-95 transition-all"
                >
                  <Download size={14} />
                  PDF Report
                </button>
                <button 
                  onClick={handleNewEntry}
                  className="bg-black text-white px-8 py-3 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 active:scale-95"
                >
                  <Plus size={16} />
                  New Entry
                </button>
              </div>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 border border-zinc-100 group-hover:bg-black group-hover:text-white transition-all">
                      <stat.icon size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 font-mono text-[10px] font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      <ArrowUpRight size={10} />
                      {stat.change}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{stat.label}</p>
                    <h3 className="text-4xl font-bold tracking-tighter underline decoration-zinc-100 underline-offset-8 decoration-4">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </section>

            {/* Real-time Analytics Summary Card */}
            <section className="bg-black text-white p-8 md:p-10 rounded-[48px] border border-zinc-900 shadow-2xl space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-green-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live Stream Analytics
                  </div>
                  <h2 className="text-2xl font-bold tracking-tighter uppercase italic text-white">Day Visits & Sales Stream</h2>
                  <p className="text-zinc-400 text-xs">Real-time metrics visualizer tracking store visits alongside transactions</p>
                </div>
                {/* Micro metrics */}
                <div className="flex gap-10">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active Store Visits</p>
                    <p className="text-2xl font-bold tracking-tight">4,821 <span className="text-green-4500 text-xs font-mono font-medium text-green-400">+12.4%</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Live Transacting Rate</p>
                    <p className="text-2xl font-bold tracking-tight">85.4% <span className="text-zinc-500 text-xs font-mono font-medium">Synced</span></p>
                  </div>
                </div>
              </div>

              <div className="h-[220px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={[
                      { hour: '08:00', visits: 110, sales: 3400 },
                      { hour: '10:00', visits: 340, sales: 8200 },
                      { hour: '12:00', visits: 580, sales: 16400 },
                      { hour: '14:00', visits: 490, sales: 14000 },
                      { hour: '16:00', visits: 720, sales: 21900 },
                      { hour: '18:00', visits: 910, sales: 29800 },
                      { hour: '20:00', visits: 840, sales: 26500 },
                      { hour: '22:00', visits: 610, sales: 18400 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#fff" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                    <XAxis 
                      dataKey="hour" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#71717a' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#71717a' }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#09090b',
                        borderRadius: '20px', 
                        border: '1px solid #27272a', 
                        padding: '12px 16px'
                      }}
                      labelStyle={{ fontSize: '9px', fontWeight: 850, textTransform: 'uppercase', color: '#71717a', marginBottom: '4px' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="#fff" 
                      name="Store Visits (Inward)"
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorVisits)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#a1a1aa" 
                      name="Gross Sales Volume ($)"
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Charts & Trends */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[48px] border border-zinc-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tighter uppercase italic">Revenue Momentum</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Growth over the last 7 months</p>
                  </div>
                  <select className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none">
                    <option>ALL TIME</option>
                    <option>THIS YEAR</option>
                    <option>THIS MONTH</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={REVENUE_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} 
                        dy={16}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                          padding: '16px 24px'
                        }}
                        labelStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 700, color: '#000' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#000" 
                        strokeWidth={4} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 8, fill: '#000' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[48px] border border-zinc-100 shadow-sm space-y-8">
                <h2 className="text-xl font-bold tracking-tighter uppercase italic">Store Diversity</h2>
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CATEGORY_DATA}>
                      <XAxis 
                        dataKey="name" 
                        hide 
                      />
                      <Tooltip 
                         cursor={{ fill: 'transparent' }}
                         contentStyle={{ 
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                          padding: '16px 24px'
                        }}
                      />
                      <Bar dataKey="count" radius={[12, 12, 12, 12]} barSize={40}>
                        {CATEGORY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {CATEGORY_DATA.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{cat.name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold">{cat.count}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Top 5 Stores Performance */}
            <section className="bg-white p-8 rounded-[48px] border border-zinc-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tighter uppercase italic">Top 5 Stores Performance</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Revenue vs Target over the last quarter</p>
                </div>
                <select className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none">
                  <option>Q3 2026</option>
                  <option>Q2 2026</option>
                  <option>Q1 2026</option>
                </select>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={TOP_STORES_PERFORMANCE_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} 
                      dy={16}
                    />
                    <YAxis 
                      yAxisId="left"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} 
                      dx={-16}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '24px', 
                        border: 'none', 
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                        padding: '16px 24px'
                      }}
                      labelStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, undefined]}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar yAxisId="left" dataKey="revenue" name="Achieved Revenue" barSize={40} fill="#000" radius={[12, 12, 12, 12]} />
                    <Line yAxisId="left" type="monotone" dataKey="target" name="Target Revenue" stroke="#a1a1aa" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#000' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Improved Table Section */}
            <section className="bg-white rounded-[48px] border border-zinc-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tighter uppercase italic">Institutional Directory</h2>
                  <p className="text-xs font-medium text-zinc-400 mt-1">Manage and audit active mall entities</p>
                </div>
                <div className="flex bg-zinc-50 p-1 rounded-2xl border border-zinc-100">
                  <button className="px-6 py-2.5 rounded-xl bg-white shadow-sm text-[10px] font-bold uppercase tracking-widest">Active</button>
                  <button className="px-6 py-2.5 rounded-xl text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Pending</button>
                  <button className="px-6 py-2.5 rounded-xl text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Archived</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50/30">
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Store Context</th>
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Classification</th>
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Activity Status</th>
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Capital Flow</th>
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Entry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {stores.slice(0, 5).map((store) => (
                      <tr key={store.id} className="hover:bg-zinc-50/50 transition-all group">
                        <td className="px-10 py-8 font-bold text-sm tracking-tight group-hover:translate-x-1 transition-transform uppercase italic">{store.name}</td>
                        <td className="px-10 py-8">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-zinc-100 rounded-full text-zinc-500">
                            {store.category}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${store.status === 'Active' ? 'bg-green-500' : store.status === 'Archived' ? 'bg-zinc-500' : 'bg-amber-500 animate-pulse'}`}></div>
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                              store.status === 'Active' ? 'text-green-700' : store.status === 'Archived' ? 'text-zinc-700' : 'text-amber-700'
                            }`}>
                              {store.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8 font-mono text-sm font-bold text-zinc-900">{store.revenue}</td>
                        <td className="px-10 py-8 text-xs font-bold text-zinc-400 uppercase tracking-tighter">{store.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-8 border-t border-zinc-50 text-center">
                <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors">
                  Load More Store Metadata
                </button>
              </div>
            </section>
          </>
        ) : activeTab === 'Analytics' ? (
          <div className="space-y-10">
            {/* Analytics Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <TrendingUp size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Google Sheets Linked Performance Trends</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter uppercase italic">Institutional Analytics</h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={handleSyncAnalyticsFromSheets}
                  disabled={syncingTrends}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all bg-black text-white hover:bg-zinc-800 disabled:opacity-50 shadow-xl shadow-black/10"
                >
                  <Globe size={14} className={syncingTrends ? 'animate-spin' : ''} />
                  {syncingTrends ? 'Syncing trends...' : 'Sync trends to Sheets'}
                </button>
              </div>
            </header>

            {/* Recharts Analytics Trends Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card 1: Sales trends */}
              <div className="bg-white p-8 rounded-[48px] border border-zinc-100 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tighter uppercase italic">Gross Revenue Trend ($)</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Google Sheets Connected Range (Sheet1!H2:I8)</p>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.sales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} 
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                          padding: '16px 24px'
                        }}
                        labelStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                      />
                      <Bar dataKey="sales" name="Gross Sales" fill="#000" radius={[10, 10, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 2: Daily Active Users (DAU) trends */}
              <div className="bg-white p-8 rounded-[48px] border border-zinc-100 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tighter uppercase italic">Daily Active Users (DAU)</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Google Sheets Connected Range (Sheet1!J2:J8)</p>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.dau} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} 
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                          padding: '16px 24px'
                        }}
                        labelStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="activeUsers" 
                        name="Active Visitors" 
                        stroke="#000" 
                        strokeWidth={4} 
                        dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 8, fill: '#000' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sheets Interactive Seed Block */}
            <div className="bg-zinc-900 text-white rounded-[48px] p-10 border border-zinc-800 shadow-xl space-y-6">
              <h3 className="text-lg font-bold tracking-tighter uppercase italic text-white">Google Sheets Analytics Seed</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-4xl">
                When Google Sheets is synced, we map these Recharts analytics to range columns <code className="bg-zinc-800 text-white px-2 py-1 rounded">Sheet1!H1:J8</code>. You can click the button above to seed, export, or live-update these values from the Google Sheets console whenever desired, enabling interactive data adjustments.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800/60">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Target Columns</p>
                  <p className="text-sm font-bold">H1: Date, I1: Revenue, J1: DAU</p>
                </div>
                <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800/60">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Current DAU Peak</p>
                  <p className="text-sm font-bold">890 active users</p>
                </div>
                <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800/60">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Last Synced Status</p>
                  <p className="text-sm font-bold">{sheetId ? "Active Google Cloud Integration" : "Local Standby Mode"}</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'Settings' ? (
          <div className="space-y-10">
            {/* Settings Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tighter uppercase italic">SYSTEM CONTROLS</h1>
                <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.25em]">Manage administrative credentials and database feeds</p>
              </div>

              {/* Action Buttons */}
              <button 
                type="button"
                onClick={handleSyncAdminsToSheets}
                disabled={syncingAdmins}
                className="flex items-center gap-2 px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all bg-black text-white hover:bg-zinc-800 disabled:opacity-50 shadow-xl shadow-black/10 active:scale-95"
              >
                <Globe size={14} className={syncingAdmins ? 'animate-spin' : ''} />
                {syncingAdmins ? 'Syncing accounts...' : 'Sync Admins to Sheets'}
              </button>
            </header>

            {/* Connection Profile info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-zinc-100 rounded-[32px] p-8 space-y-6">
                <h3 className="text-lg font-bold tracking-tighter uppercase italic text-zinc-900 border-b border-zinc-50 pb-4">Linked Google Spreadsheet</h3>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Connection Status</span>
                    <span className={`font-bold uppercase tracking-widest ${sheetId ? 'text-green-500' : 'text-amber-500'}`}>
                      {sheetId ? 'CONNECTED' : 'STANDBY'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Active Google Account</span>
                    <span className="font-mono font-medium">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Google Spreadsheet ID</span>
                    <span className="font-mono font-bold select-all truncate max-w-[200px]">{sheetId || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Target Columns Range</span>
                    <span className="font-bold">Sheet1!L1:M10</span>
                  </div>
                </div>
              </div>

              {/* Guide card */}
              <div className="bg-zinc-950 text-white rounded-[32px] p-8 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tighter uppercase italic text-white border-b border-white/5 pb-4 mb-4">Database Replication Protocol</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Once synced, the system replicates administrative entries to columns <code className="bg-zinc-900 px-2 py-1 rounded text-white font-mono">L1</code> (Admin Email) and <code className="bg-zinc-900 px-2 py-1 rounded text-white font-mono">M1</code> (Timestamp). This guarantees offline persistence, audit capability, and high-fidelity operational transparency.
                  </p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-zinc-300 uppercase tracking-wide">
                  * All synchronization activities are logged by the system shell
                </div>
              </div>
            </div>

            {/* Operator accounts table */}
            <div className="bg-white border border-zinc-100 rounded-[32px] p-8 space-y-6">
              <h3 className="text-xl font-bold tracking-tighter uppercase italic text-zinc-900 font-bold">SYSTEM OPERATORS REGISTRY</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-150 text-zinc-400 font-bold tracking-wider text-[10px] uppercase">
                      <th className="py-4">No.</th>
                      <th className="py-4">Operator Email</th>
                      <th className="py-4">Access Registration Date</th>
                      <th className="py-4">Auth Channel</th>
                      <th className="py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminAccounts.map((acc: any, idx: number) => (
                      <tr key={idx} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4 font-mono text-zinc-400">{idx + 1}</td>
                        <td className="py-4 font-bold text-zinc-900">{acc.email}</td>
                        <td className="py-4 font-mono text-zinc-500">{acc.joined}</td>
                        <td className="py-4 font-bold uppercase tracking-widest text-[9px] text-zinc-400">
                          {acc.email.includes('google_admin') ? 'Universal ID' : 'Direct Auth'}
                        </td>
                        <td className="py-4">
                          <span className="bg-green-50 text-green-500 border border-green-150 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                            Authorized
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tighter uppercase italic">{activeTab} Details</h2>
            <p className="text-zinc-500 font-medium">This module is currently under development.</p>
          </div>
        )}
        </div>
      </main>
      </div>
    </div>
  );
}
