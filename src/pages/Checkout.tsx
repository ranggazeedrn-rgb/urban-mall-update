import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowRight, ArrowLeft, CheckCircle2, CreditCard, Plus, PackageOpen } from 'lucide-react';
import { useCart } from '../CartContext';
import { formatPrice } from '../lib/utils';
import { PRODUCTS, ORDERS as INITIAL_ORDERS } from '../data';
import { Order } from '../types';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newCreatedOrderId, setNewCreatedOrderId] = useState<string | null>(null);

  // Promo / Coupon State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: 'percent' | 'flat'; value: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Fixed visual identifier for checkout order totals summary
  const AVAILABLE_PROMOS = [
    { code: 'URBAN10', type: 'percent' as const, value: 10, description: '10% off your entire order' },
    { code: 'VIP20', type: 'percent' as const, value: 20, description: 'Exclusive VIP 20% discount' },
    { code: 'MEGA50', type: 'percent' as const, value: 50, description: 'Spectacular 50% seasonal discount' },
    { code: 'WELCOME50', type: 'flat' as const, value: 50, description: '$50.00 Welcome Voucher' },
  ];

  const handleApplyPromo = (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) return;

    const promo = AVAILABLE_PROMOS.find(p => p.code === code);
    if (promo) {
      if (promo.type === 'flat' && promo.value >= cartTotal) {
        setPromoError(`Cart total must be greater than flat value.`);
        setPromoSuccess('');
        return;
      }
      setAppliedPromo(promo);
      setPromoSuccess(`Voucher '${promo.code}' applied!`);
      setPromoError('');
    } else {
      setPromoError('Invalid code. Try URBAN10, VIP20, or WELCOME50.');
      setPromoSuccess('');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoSuccess('');
    setPromoError('');
  };

  const discountAmount = appliedPromo
    ? appliedPromo.type === 'percent'
      ? (cartTotal * appliedPromo.value) / 100
      : Math.min(cartTotal, appliedPromo.value)
    : 0;
  
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  // Frequently Bought Together Logic
  const boughtTogether = PRODUCTS
    .filter(p => !cart.some(item => item.id === p.id))
    .slice(0, 5);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  if (cart.length === 0 && !isSuccess) {
    return (
      <main className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <h2 className="text-2xl font-bold tracking-tighter uppercase italic">Cart Empty</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs"
        >
          Go Back
        </button>
      </main>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const simulatedOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    setNewCreatedOrderId(simulatedOrderId);

    const newOrder: Order = {
      id: simulatedOrderId,
      date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: 'Processing',
      total: finalTotal,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      trackingNumber: `JKT-${Math.floor(100000000 + Math.random() * 900000000)}`,
      shippingAddress: `${formData.address || 'Online Mall Collection Point'}, ${formData.city || 'Jakarta'}`
    };

    // Store to localStorage
    const savedOrdersStr = localStorage.getItem('urban_orders');
    let currentOrders = INITIAL_ORDERS;
    if (savedOrdersStr) {
      try {
        currentOrders = JSON.parse(savedOrdersStr);
      } catch (err) {
        console.error('Error loading urban_orders in checkout:', err);
      }
    }
    const updatedOrders = [newOrder, ...currentOrders];
    localStorage.setItem('urban_orders', JSON.stringify(updatedOrders));

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    }, 1500);
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-[40px] border border-zinc-100 shadow-xl shadow-zinc-200/50 text-center space-y-6"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter uppercase italic">Order Confirmed</h1>
            <p className="text-zinc-500 font-medium text-sm">Thank you for your purchase. We've sent a confirmation email to {formData.email || 'your email'}.</p>
          </div>
          
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 text-left space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 uppercase font-bold tracking-widest">Order Num</span>
              <span className="font-mono font-bold">{newCreatedOrderId}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-xs text-green-600 font-bold">
                <span className="uppercase tracking-widest">Promo Code</span>
                <span className="font-mono font-bold">{appliedPromo.code} (-{appliedPromo.type === 'percent' ? `${appliedPromo.value}%` : formatPrice(appliedPromo.value)})</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 uppercase font-bold tracking-widest">Amount Paid</span>
              <span className="font-mono font-bold text-zinc-950">{formatPrice(finalTotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 uppercase font-bold tracking-widest">Date</span>
              <span className="font-mono font-bold">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button 
              onClick={() => navigate('/orders', { state: { trackingOrderId: newCreatedOrderId } })}
              className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              Track Order Progress
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-zinc-100 text-zinc-800 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-zinc-200 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pb-24 pt-6 md:pt-24 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
      <div className="lg:w-2/3 space-y-10">
        <div>
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Cart
          </button>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">Checkout</h1>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">Complete your order safely</p>
        </div>

        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
          {/* Contact Info */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold tracking-tighter uppercase italic">1. Contact Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="email" 
                name="email"
                placeholder="Email Address *"
                required
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-xs font-bold font-mono focus:outline-none focus:border-black focus:bg-white transition-all"
              />
              <input 
                type="text" 
                name="name"
                placeholder="Full Name *"
                required
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-xs font-bold font-mono focus:outline-none focus:border-black focus:bg-white transition-all uppercase"
              />
            </div>
          </section>

          {/* Shipping */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold tracking-tighter uppercase italic">2. Shipping Address</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                name="address"
                placeholder="Street Address *"
                required
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-xs font-bold font-mono focus:outline-none focus:border-black focus:bg-white transition-all uppercase"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  name="city"
                  placeholder="City *"
                  required
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-xs font-bold font-mono focus:outline-none focus:border-black focus:bg-white transition-all uppercase"
                />
                <input 
                  type="text" 
                  placeholder="Postal Code"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-xs font-bold font-mono focus:outline-none focus:border-black focus:bg-white transition-all uppercase"
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tighter uppercase italic">3. Payment</h2>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-zinc-200 rounded flex items-center justify-center">
                  <CreditCard size={14} className="text-zinc-500" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-[24px] p-6 space-y-4 shadow-sm">
              <input 
                type="text" 
                name="cardNumber"
                placeholder="Card Number *"
                required
                maxLength={19}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-xs font-bold font-mono focus:outline-none focus:border-black focus:bg-white transition-all"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  name="expiry"
                  placeholder="MM/YY *"
                  required
                  maxLength={5}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-xs font-bold font-mono focus:outline-none focus:border-black focus:bg-white transition-all"
                />
                <input 
                  type="password" 
                  name="cvc"
                  placeholder="CVC *"
                  required
                  maxLength={4}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-xs font-bold font-mono focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>
            </div>
          </section>
        </form>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:w-1/3">
        <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 sticky top-28 space-y-8">
          <div>
            <h3 className="text-lg font-bold tracking-tighter uppercase italic mb-6">Order Summary</h3>
            <div className="max-h-64 overflow-y-auto space-y-4 pr-2 no-scrollbar mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 rounded-xl bg-white overflow-hidden shrink-0 border border-zinc-100">
                    <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 py-1">
                    <h4 className="text-xs font-bold uppercase line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                    <p className="font-mono text-xs font-bold mt-2">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input Section */}
            <div className="pt-6 border-t border-zinc-200 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Apply Voucher Code</h4>
                {appliedPromo && (
                  <button 
                    onClick={handleRemovePromo}
                    className="text-[10px] uppercase font-bold text-red-500 tracking-wider hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="E.G. URBAN10"
                  className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono font-bold uppercase focus:outline-none focus:border-black transition-all"
                />
                <button 
                  type="button"
                  onClick={() => handleApplyPromo(promoInput)}
                  className="bg-black text-white hover:bg-zinc-800 transition-colors px-5 rounded-xl uppercase text-xs font-bold tracking-wider"
                >
                  Apply
                </button>
              </div>

              {/* Quick Voucher Selects */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Tap to apply promo:</span>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_PROMOS.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => {
                        setPromoInput(p.code);
                        handleApplyPromo(p.code);
                      }}
                      className={`text-[9px] font-bold font-mono px-2 py-1 rounded-md border transition-all uppercase ${
                        appliedPromo?.code === p.code 
                          ? 'bg-zinc-950 text-white border-zinc-950' 
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {p.code} ({p.type === 'percent' ? `${p.value}%` : `$${p.value}`} OFF)
                    </button>
                  ))}
                </div>
              </div>

              {promoError && (
                <p className="text-[10px] text-red-500 font-bold uppercase mt-1 tracking-wide">{promoError}</p>
              )}
              {promoSuccess && (
                <p className="text-[10px] text-green-600 font-bold uppercase mt-1 tracking-wide">✓ {promoSuccess}</p>
              )}
            </div>
            
            <div className="space-y-3 pt-6 border-t border-zinc-200">
              <div className="flex justify-between text-sm text-zinc-500 font-medium">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-900">{formatPrice(cartTotal)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount ({appliedPromo.code})</span>
                  <span className="font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-zinc-500 font-medium">
                <span>Shipping</span>
                <span className="font-mono text-zinc-900">FREE</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-lg font-bold tracking-tighter uppercase">Total</span>
                <span className="text-2xl font-mono font-bold text-black">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Frequently Bought Together */}
          <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <PackageOpen size={16} className="text-zinc-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Frequently Bought Together</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {boughtTogether.map((product) => (
                <div key={product.id} className="min-w-[140px] group">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-zinc-100 mb-2">
                    <img src={product.image} alt={product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <button 
                      onClick={() => addToCart(product)}
                      className="absolute bottom-2 right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <h4 className="text-[9px] font-bold uppercase truncate">{product.name}</h4>
                  <p className="text-[9px] font-mono font-bold text-zinc-500">{formatPrice(product.price)}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className="w-full bg-black text-white py-5 rounded-full font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-black/10 disabled:opacity-70"
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>Pay {formatPrice(finalTotal)} <ArrowRight size={18} /></>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-zinc-400">
            <Shield size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure 256-bit encryption</span>
          </div>
        </div>
      </div>
    </main>
  );
}
