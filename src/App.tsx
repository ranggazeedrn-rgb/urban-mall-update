import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MobileHeader } from './components/layout/MobileHeader';
import { DesktopHeader } from './components/layout/DesktopHeader';
import { BottomNav } from './components/layout/BottomNav';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Stores from './pages/Stores';
import StoreDetail from './pages/StoreDetail';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Search from './pages/Search';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { AuthProvider } from './lib/AuthContext';
import { NotificationProvider } from './NotificationContext';
import Landing from './pages/Landing';
import Register from './pages/admin/Register';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-10 text-center">
          <div className="space-y-4 max-w-lg">
            <h1 className="text-4xl font-bold tracking-tighter uppercase italic">System Fault</h1>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest leading-relaxed">
              A synchronization error occurred.
            </p>
            {this.state.error && (
              <pre className="mt-4 p-4 bg-zinc-50 rounded-xl text-left text-[10px] font-mono text-zinc-400 overflow-auto max-h-40 border border-zinc-100 no-scrollbar">
                {this.state.error.stack || this.state.error.message}
              </pre>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 bg-black text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Reboot Terminal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen shadow-2xl relative flex flex-col md:max-w-none md:bg-zinc-50">
      <div className="flex-1 w-full max-w-[1400px] mx-auto md:shadow-2xl md:bg-white md:relative md:min-h-screen">
        {location.pathname !== '/' && (
          <>
            <DesktopHeader />
            <MobileHeader />
          </>
        )}
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<Home />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/store/:id" element={<StoreDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>

        {location.pathname !== '/' && (
          <>
            <BottomNav />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <AppContent />
              </Router>
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </AuthProvider>
  );
}
