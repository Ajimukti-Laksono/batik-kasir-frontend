import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download, Calendar } from 'lucide-react';
import api, { formatRupiah } from '../services/api';

const COLORS = ['#684F33', '#b27632', '#9a6329', '#c99150', '#423526'];

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchReport(); }, [dateFrom, dateTo]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions/report/summary', { params: { date_from: dateFrom, date_to: dateTo } });
      setData(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[#684F33] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#423526]">Laporan Penjualan</h1>
          <p className="text-gray-500 text-sm">Analisis performa penjualan Batik Nusantara</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-gray-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="text-sm border-none outline-none" />
            <span className="text-gray-400">—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="text-sm border-none outline-none" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: formatRupiah(data?.summary?.total_revenue || 0), color: 'from-[#684F33] to-[#b27632]' },
          { label: 'Total Transaksi', value: data?.summary?.total_transactions || 0, color: 'from-blue-500 to-blue-600' },
          { label: 'Rata-rata Transaksi', value: formatRupiah(data?.summary?.avg_transaction || 0), color: 'from-purple-500 to-purple-600' },
        ].map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-6 shadow-lg`}>
            <p className="text-white/80 text-sm mb-1">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-[#b27632]" /> Revenue Harian
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.daily_report || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => [formatRupiah(v), 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#b27632" strokeWidth={3} dot={{ fill: '#684F33', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Produk Terlaris</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={(data?.top_products || []).slice(0, 7)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="product_name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={v => formatRupiah(v)} />
              <Bar dataKey="total_revenue" fill="#684F33" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Kasir Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Performa Kasir</h3>
          <div className="space-y-4">
            {(data?.kasir_report || []).map((kasir, i) => {
              const maxRevenue = Math.max(...(data?.kasir_report || []).map(k => k.revenue));
              const percentage = (kasir.revenue / maxRevenue) * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-[#684F33] to-[#b27632] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {kasir.kasir?.name?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{kasir.kasir?.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{formatRupiah(kasir.revenue)}</p>
                      <p className="text-xs text-gray-500">{kasir.count} transaksi</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#684F33] to-[#b27632] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
