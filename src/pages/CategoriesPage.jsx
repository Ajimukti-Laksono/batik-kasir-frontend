import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import api from '../services/api';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data.data || res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditing(category);
      setForm({ name: category.name, description: category.description || '', is_active: category.is_active });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', is_active: true });
    }
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('is_active', form.is_active ? 1 : 0);
    if (form.image) {
      formData.append('image', form.image);
    }
    // Setup method spoofing for PUT if editing
    if (editing) {
      formData.append('_method', 'PUT');
    }

    try {
      if (editing) {
        await api.post(`/categories/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setModal(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    } finally { setSaving(false); }
  };

  // ... (rest of the component)

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file, preview: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="space-y-5">
      {/* ... Header ... */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-[#423526]">Manajemen Kategori</h1>
           <p className="text-gray-500 text-sm">Kelola kategori produk batik Anda</p>
        </div>
        <button onClick={() => { setForm({ name: '', description: '', is_active: true, image: null, preview: null }); setEditing(null); setModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#684F33] to-[#b27632] text-white rounded-xl font-semibold hover:from-[#423526] hover:to-[#684F33] transition-all shadow-lg">
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#684F33] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <button onClick={() => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '', is_active: cat.is_active, preview: cat.image ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${cat.image}` : null }); setModal(true); }} 
                 className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Edit2 size={16}/></button>
               <button onClick={() => handleDelete(cat.id)}
                 className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={16}/></button>
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                {cat.image ? (
                  <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${cat.image}`} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Tag size={24} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
                <p className="text-xs text-[#b27632] font-medium bg-[#b27632]/10 px-2 py-0.5 rounded-full inline-block mt-1">
                  {cat.products_count || 0} Produk
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-2">
              {cat.description || 'Tidak ada deskripsi'}
            </p>
            
            <div className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${cat.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
               <span className="text-xs text-gray-500">{cat.is_active ? 'Aktif' : 'Nonaktif'}</span>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-[#423526]">{editing ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex justify-center">
                 <div className="relative w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-[#684F33] transition-colors group cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {form.preview ? (
                      <img src={form.preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Tag size={32} className="mb-2" />
                        <span className="text-xs">Upload Gambar</span>
                      </div>
                    )}
                 </div>
              </div>
            
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Kategori *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none resize-none" />
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active_cat" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}
                  className="w-4 h-4 accent-[#684F33]" />
                <label htmlFor="is_active_cat" className="text-sm font-medium text-gray-700">Kategori Aktif</label>
              </div>
              
              <div className="flex gap-3 pt-2">
                 {/* Buttons */}
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-[#684F33] to-[#b27632] text-white rounded-xl font-semibold disabled:opacity-70 flex items-center justify-center gap-2">
                  {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
