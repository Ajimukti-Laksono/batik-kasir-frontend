import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Package, Users, AlertTriangle, ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api, { formatRupiah, formatDate } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => { 
    fetchDashboard(); 
    
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 19) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const statCards = [
    { label: 'Revenue Hari Ini', value: formatRupiah(stats?.today_revenue || 0), icon: TrendingUp, color: 'from-[#D4AF37] to-[#8A6E2F]', change: '+12%', bg: 'bg-orange-50' },
    { label: 'Transaksi Hari Ini', value: stats?.today_transactions || 0, icon: ShoppingCart, color: 'from-[#2D241B] to-[#423526]', change: '+5%', bg: 'bg-stone-50' },
    { label: 'Total Produk', value: stats?.total_products || 0, icon: Package, color: 'from-amber-600 to-amber-700', change: '', bg: 'bg-amber-50' },
    { label: 'Stok Menipis', value: stats?.low_stock_count || 0, icon: AlertTriangle, color: 'from-red-600 to-red-700', change: '', alert: true, bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2D241B] to-[#423526] text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
             <path fill="#FFFFFF" d="M45.7,-76.3C58.9,-69.3,69.1,-55.6,76.3,-41.2C83.5,-26.8,87.6,-11.7,85.2,2.4C82.8,16.5,73.8,29.7,64.1,41.2C54.4,52.7,44,62.5,31.7,69.3C19.4,76.1,5.2,79.9,-8.3,78.8C-21.8,77.7,-34.6,71.7,-45.5,63.4C-56.4,55.1,-65.4,44.5,-72.1,32.3C-78.8,20.1,-83.2,6.3,-80.4,-6.2C-77.6,-18.7,-67.6,-29.9,-57.3,-39.8C-47,-49.7,-36.4,-58.3,-24.8,-66.3C-13.2,-74.3,-0.6,-81.7,13.6,-80.6C27.9,-79.6,55.8,-70.2,45.7,-76.3Z" transform="translate(100 100)" />
           </svg>
        </div>
        
        <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#F3E5AB] mb-2">{greeting}, {user?.name}</h1>
             <p className="text-white/80 max-w-xl">
               Selamat datang kembali di Aplikasi Kasir Batik Nusantara. Pantau performa penjualan dan stok produk Anda hari ini.
             </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20 text-center">
               <p className="text-xs text-[#F3E5AB] uppercase tracking-wider">Jam</p>
               <p className="text-xl font-bold font-mono"><Clock size={16} className="inline mr-1" />{new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20 text-center">
               <p className="text-xs text-[#F3E5AB] uppercase tracking-wider">Tanggal</p>
               <p className="text-xl font-bold font-serif">{new Date().getDate()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={24} className="text-white" />
              </div>
              {card.change && (
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ArrowUpRight size={12} strokeWidth={3} />{card.change}
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-800 tracking-tight">{card.value}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-xl text-gray-800 font-serif">Revenue Mingguan</h3>
             <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#D4AF37]/50">
               <option>7 Hari Terakhir</option>
               <option>Bulan Ini</option>
             </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.weekly_revenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                tickFormatter={v => `${v/1000}k`} 
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip 
                cursor={{ fill: '#F8F5F2' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                formatter={v => [formatRupiah(v), 'Revenue']} 
                labelStyle={{ fontWeight: 'bold', color: '#423526' }} 
              />
              <Bar dataKey="revenue" fill="url(#batikGradient)" radius={[8, 8, 0, 0]} maxBarSize={50} />
              <defs>
                <linearGradient id="batikGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8A6E2F" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-gray-800 font-serif">Produk Terlaris</h3>
            <Link to="/reports" className="text-xs font-bold text-[#D4AF37] hover:underline uppercase tracking-wide">Lihat semua</Link>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {(stats?.top_products || []).slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                   i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                   i === 1 ? 'bg-gray-100 text-gray-700' :
                   i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white border border-gray-200 text-gray-500'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#D4AF37] transition-colors">{p.product_name}</p>
                  <p className="text-xs text-gray-500">{p.total_qty} terjual minggu ini</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-[#2D241B]">{formatRupiah(p.total_revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-gray-800 font-serif">Transaksi Terbaru</h3>
            <Link to="/transactions" className="text-xs font-bold text-[#D4AF37] hover:underline uppercase tracking-wide">Lihat semua</Link>
          </div>
          <div className="space-y-4">
            {(stats?.recent_transactions || []).slice(0, 5).map(trx => (
              <div key={trx.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F8F5F2] transition-colors border border-transparent hover:border-gray-200">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                  trx.payment_status === 'success' ? 'bg-green-100 text-green-600' : 
                  trx.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                }`}>
                  <ShoppingCart size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-800">{trx.invoice_number}</p>
                  <p className="text-sm text-gray-500">{trx.customer_name || 'Pelanggan Umum'}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-[#2D241B]">{formatRupiah(trx.total)}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                    trx.payment_status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                    trx.payment_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>{trx.payment_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-red-50/50 rounded-2xl p-8 shadow-sm border border-red-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-red-800 font-serif flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle size={18} className="text-red-500" /></div>
              Stok Menipis
            </h3>
            <Link to="/products?low_stock=1" className="text-xs font-bold text-red-600 hover:underline uppercase tracking-wide">Kelola stok</Link>
          </div>
          <div className="space-y-3">
            {(stats?.low_stock_products || []).slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 font-bold text-lg">
                  {p.stock}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-800">{p.name}</p>
                  <p className="text-sm text-gray-500">SKU: {p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500">Minimal</p>
                  <p className="text-lg font-bold text-[#8A6E2F]">{p.min_stock}</p>
                </div>
              </div>
            ))}
            {(!stats?.low_stock_products || stats.low_stock_products.length === 0) && (
              <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
                <Package size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Stok semua produk aman</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
