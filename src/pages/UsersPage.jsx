import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import api from '../services/api';

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700' },
  manager: { label: 'Manager', color: 'bg-blue-100 text-blue-700' },
  kasir: { label: 'Kasir', color: 'bg-green-100 text-green-700' },
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'kasir', phone: '', password: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.data || res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditing(user);
      setForm({ name: user.name, email: user.email, role: user.role, phone: user.phone || '', password: '', is_active: user.is_active });
    } else {
      setEditing(null);
      setForm({ name: '', email: '', role: 'kasir', phone: '', password: '', is_active: true });
    }
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, form);
      } else {
        await api.post('/users', form);
      }
      setModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus user ini?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const handleToggle = async (id) => {
    await api.post(`/users/${id}/toggle-active`);
    fetchUsers();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#423526]">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-sm">Kelola akun kasir dan admin</p>
        </div>
        <button onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#684F33] to-[#b27632] text-white rounded-xl font-semibold hover:from-[#423526] hover:to-[#684F33] transition-all shadow-lg">
          <Plus size={18} /> Tambah User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#684F33] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.map(user => (
          <div key={user.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#684F33] to-[#b27632] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${roleConfig[user.role]?.color}`}>
                {roleConfig[user.role]?.label}
              </span>
            </div>

            {user.phone && (
              <p className="text-sm text-gray-500 mb-3">📱 {user.phone}</p>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(user.id)} className="text-gray-400 hover:text-[#684F33] transition-colors">
                  {user.is_active ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} />}
                </button>
                <span className={`text-xs font-medium ${user.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                  {user.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#423526]">{editing ? 'Edit User' : 'Tambah User'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
                <select required value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none">
                  <option value="kasir">Kasir</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password {editing ? '(kosongkan jika tidak diubah)' : '*'}
                </label>
                <input type="password" required={!editing} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  minLength={8} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active_user" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}
                  className="w-4 h-4 accent-[#684F33]" />
                <label htmlFor="is_active_user" className="text-sm font-medium text-gray-700">User Aktif</label>
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

export default UsersPage;
