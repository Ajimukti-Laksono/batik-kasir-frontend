import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, X } from 'lucide-react';
import api, { formatRupiah } from '../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', sku: '', category_id: '', price: '', cost_price: '',
    stock: '', min_stock: 5, description: '', is_active: true, image: null
  });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [search, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search, page, per_page: 12 } });
      setProducts(res.data.data.data);
      setMeta(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data.data || res.data.data);
    } catch {}
  };

  const openModal = (product = null) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name, sku: product.sku, category_id: product.category_id,
        price: product.price, cost_price: product.cost_price, stock: product.stock,
        min_stock: product.min_stock, description: product.description || '',
        is_active: product.is_active, image: null
      });
    } else {
      setEditing(null);
      setForm({ name: '', sku: '', category_id: '', price: '', cost_price: '', stock: '', min_stock: 5, description: '', is_active: true, image: null });
    }
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { 
        if (v !== null) {
          if (k === 'is_active') {
            formData.append(k, v ? '1' : '0');
          } else {
            formData.append(k, v);
          }
        }
      });
      if (editing) {
        formData.append('_method', 'PUT');
        await api.post(`/products/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#423526]">Manajemen Produk</h1>
          <p className="text-gray-500 text-sm">Kelola produk batik Anda</p>
        </div>
        <button onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#684F33] to-[#b27632] text-white rounded-xl font-semibold hover:from-[#423526] hover:to-[#684F33] transition-all shadow-lg">
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari produk..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#423526] to-[#684F33] text-white">
              <tr>
                <th className="text-left p-4 text-sm font-semibold">Produk</th>
                <th className="text-left p-4 text-sm font-semibold">Kategori</th>
                <th className="text-left p-4 text-sm font-semibold">Harga Jual</th>
                <th className="text-left p-4 text-sm font-semibold">Stok</th>
                <th className="text-left p-4 text-sm font-semibold">Status</th>
                <th className="text-center p-4 text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><div className="w-8 h-8 border-4 border-[#684F33] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#FAF8F6] to-[#E5DDD5] flex-shrink-0">
                        {product.image
                          ? <img src={`${API_URL}/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                          : <Package size={20} className="text-[#684F33]/30 m-auto mt-3" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2 py-1 bg-[#684F33]/10 text-[#684F33] rounded-lg text-xs font-medium">{product.category?.name}</span></td>
                  <td className="p-4"><p className="font-bold text-[#b27632]">{formatRupiah(product.price)}</p><p className="text-xs text-gray-400">HPP: {formatRupiah(product.cost_price)}</p></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-lg ${product.stock <= product.min_stock ? 'text-red-600' : 'text-gray-800'}`}>{product.stock}</span>
                      {product.stock <= product.min_stock && <AlertTriangle size={14} className="text-red-500" />}
                    </div>
                    <p className="text-xs text-gray-400">Min: {product.min_stock}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Menampilkan {meta.from}-{meta.to} dari {meta.total} produk</p>
            <div className="flex gap-2">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-gradient-to-r from-[#684F33] to-[#b27632] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl font-bold text-[#423526]">{editing ? 'Edit Produk' : 'Tambah Produk'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Produk *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">SKU *</label>
                  <input type="text" required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori *</label>
                  <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none">
                    <option value="">Pilih kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Jual *</label>
                  <input type="number" required min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">HPP (Harga Pokok)</label>
                  <input type="number" min="0" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stok *</label>
                  <input type="number" required min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stok Minimum</label>
                  <input type="number" min="0" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Foto Produk</label>
                  <input type="file" accept="image/*" onChange={e => setForm({...form, image: e.target.files[0]})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none text-sm" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}
                    className="w-4 h-4 accent-[#684F33]" />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Produk Aktif</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
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

export default ProductsPage;
