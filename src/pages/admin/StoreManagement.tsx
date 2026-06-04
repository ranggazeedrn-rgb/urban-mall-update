import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store as StoreType } from '../../types';
import { Search, Plus, Filter, Edit2, Archive, Trash2, X, MapPin, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface ExtendedStore extends StoreType {
  status: string;
  revenue: string;
  date: string;
}

interface StoreManagementProps {
  stores: ExtendedStore[];
  setStores: React.Dispatch<React.SetStateAction<ExtendedStore[]>>;
}

export function StoreManagement({ stores, setStores }: StoreManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<ExtendedStore | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ExtendedStore>>({});

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          store.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || store.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (store?: ExtendedStore) => {
    if (store) {
      setEditingStore(store);
      setFormData(store);
    } else {
      setEditingStore(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        image: '',
        location: { lat: 0, lng: 0 },
        status: 'Active',
        rating: 0,
        revenue: '$0',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setEditingStore(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ExtendedStore] as any),
          [child]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStore) {
      setStores(stores.map(s => s.id === editingStore.id ? { ...s, ...formData } as ExtendedStore : s));
    } else {
      const newStore: ExtendedStore = {
        ...(formData as ExtendedStore),
        id: `s${Date.now()}`,
      };
      setStores([...stores, newStore]);
    }
    handleCloseModal();
  };

  const handleToggleStatus = (id: string) => {
    setStores(stores.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'Active' ? 'Archived' : 'Active' };
      }
      return s;
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      setStores(stores.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">Store Control</h1>
          <p className="text-sm font-medium text-zinc-400">Manage directory, metadata, and status</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH STORES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-white border border-zinc-200 rounded-full py-3.5 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-black transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 active:scale-95"
          >
            <Plus size={16} />
            Add Store
          </button>
        </div>
      </header>

      {/* Main Table Area */}
      <section className="bg-white rounded-[48px] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Filter Status:</span>
          </div>
          <div className="flex bg-zinc-50 p-1 rounded-2xl border border-zinc-100">
            {['All', 'Active', 'Pending', 'Archived'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterStatus === status ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/30">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Store Context</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hidden lg:table-cell">Location Data</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-zinc-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-100 shrink-0 bg-zinc-50">
                        {store.image ? (
                          <img src={store.image} alt={store.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="text-zinc-300" size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight uppercase italic">{store.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{store.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${store.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                        store.status === 'Active' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {store.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <MapPin size={14} />
                      <span className="font-mono text-[10px] font-bold">{store.location.lat.toFixed(4)}, {store.location.lng.toFixed(4)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(store)}
                        className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all tooltip-trigger"
                        title="Edit Details"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(store.id)}
                        className={`p-2 rounded-xl transition-all ${
                          store.status === 'Active' 
                            ? 'text-amber-500 hover:bg-amber-50' 
                            : 'text-green-500 hover:bg-green-50'
                        }`}
                        title={store.status === 'Active' ? 'Archive Store' : 'Activate Store'}
                      >
                        {store.status === 'Active' ? <Archive size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(store.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-zinc-500 text-sm font-medium">
                    No stores found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h2 className="text-2xl font-bold tracking-tighter uppercase italic">
                  {editingStore ? 'Edit Store Entity' : 'New Store Entity'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 border border-zinc-200 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form id="store-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Store Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Vogue Essentials"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-bold uppercase focus:border-black focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Category</label>
                      <input 
                        type="text" 
                        name="category"
                        value={formData.category || ''}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Fashion"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-bold uppercase focus:border-black focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Description</label>
                    <textarea 
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      required
                      placeholder="Enter a brief description..."
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-medium focus:border-black focus:bg-white transition-all outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Featured Image URL</label>
                    <input 
                      type="url" 
                      name="image"
                      value={formData.image || ''}
                      onChange={handleChange}
                      required
                      placeholder="https://..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-mono focus:border-black focus:bg-white transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Latitude</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input 
                          type="number" 
                          step="any"
                          name="location.lat"
                          value={formData.location?.lat || 0}
                          onChange={handleChange}
                          required
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-mono font-bold focus:border-black focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Longitude</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input 
                          type="number" 
                          step="any"
                          name="location.lng"
                          value={formData.location?.lng || 0}
                          onChange={handleChange}
                          required
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-mono font-bold focus:border-black focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Status</label>
                     <select 
                        name="status"
                        value={formData.status || 'Active'}
                        onChange={handleChange}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-bold uppercase focus:border-black focus:bg-white transition-all outline-none"
                     >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Archived">Archived</option>
                     </select>
                  </div>
                </form>
              </div>

              <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-4">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black hover:bg-zinc-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="store-form"
                  className="bg-black text-white px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                >
                  {editingStore ? 'Save Changes' : 'Create Store'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
