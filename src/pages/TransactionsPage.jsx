import React, { useState, useEffect } from 'react';
import { Search, Eye, Calendar, X, RefreshCw } from 'lucide-react';
import api, { formatRupiah, formatDate } from '../services/api';

const statusConfig = {
  success: { label: 'Berhasil', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  failed: { label: 'Gagal', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-600' },
  refunded: { label: 'Refund', color: 'bg-purple-100 text-purple-700' },
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => { fetchTransactions(); }, [search, status, dateFrom, dateTo, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions', {
        params: { search, status, date_from: dateFrom, date_to: dateTo, page, per_page: 15 }
      });
      setTransactions(res.data.data.data);
      setMeta(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const fetchDetail = async (id) => {
    const res = await api.get(`/transactions/${id}`);
    setDetail(res.data.data);
  };

  const syncStatus = async (id) => {
    try {
      await api.get(`/transactions/${id}/sync`);
      fetchTransactions();
    } catch (err) {
      alert('Gagal sinkronisasi: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#423526]">Riwayat Transaksi</h1>
        <p className="text-gray-500 text-sm">Semua transaksi penjualan batik</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari invoice / pelanggan..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none text-sm" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none text-sm">
          <option value="">Semua Status</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none text-sm" />
          <span className="text-gray-400">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#423526] to-[#684F33] text-white">
              <tr>
                <th className="text-left p-4 text-sm font-semibold">Invoice</th>
                <th className="text-left p-4 text-sm font-semibold">Pelanggan</th>
                <th className="text-left p-4 text-sm font-semibold">Kasir</th>
                <th className="text-left p-4 text-sm font-semibold">Total</th>
                <th className="text-left p-4 text-sm font-semibold">Pembayaran</th>
                <th className="text-left p-4 text-sm font-semibold">Status</th>
                <th className="text-left p-4 text-sm font-semibold">Tanggal</th>
                <th className="text-center p-4 text-sm font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-[#684F33] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td></tr>
              ) : transactions.map(trx => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm font-bold text-[#684F33]">{trx.invoice_number}</td>
                  <td className="p-4 text-sm">{trx.customer_name}</td>
                  <td className="p-4 text-sm text-gray-600">{trx.kasir?.name}</td>
                  <td className="p-4 font-bold text-gray-800">{formatRupiah(trx.total)}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-lg capitalize">{trx.payment_method}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusConfig[trx.payment_status]?.color}`}>
                      {statusConfig[trx.payment_status]?.label}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{formatDate(trx.created_at)}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-1">
                      {trx.payment_method === 'midtrans' && trx.payment_status === 'pending' && (
                        <button onClick={() => syncStatus(trx.id)}
                          title="Sinkronkan Status"
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                          <RefreshCw size={16} />
                        </button>
                      )}
                      <button onClick={() => fetchDetail(trx.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Total: {meta.total} transaksi</p>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-gradient-to-r from-[#684F33] to-[#b27632] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold text-[#423526]">Detail Transaksi</h3>
                <p className="text-sm font-mono text-[#b27632]">{detail.invoice_number}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Pelanggan</p><p className="font-semibold">{detail.customer_name}</p></div>
                <div><p className="text-gray-500">Kasir</p><p className="font-semibold">{detail.kasir?.name}</p></div>
                <div><p className="text-gray-500">Pembayaran</p><p className="font-semibold capitalize">{detail.payment_method}</p></div>
                <div><p className="text-gray-500">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig[detail.payment_status]?.color}`}>
                    {statusConfig[detail.payment_status]?.label}
                  </span>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold">Produk</th>
                      <th className="text-center p-3 font-semibold">Qty</th>
                      <th className="text-right p-3 font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detail.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="p-3">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-xs text-gray-500">{formatRupiah(item.price)} / item</p>
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right font-semibold">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatRupiah(detail.subtotal)}</span></div>
                {detail.discount > 0 && <div className="flex justify-between text-green-600"><span>Diskon</span><span>-{formatRupiah(detail.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Pajak</span><span>{formatRupiah(detail.tax)}</span></div>
                <div className="flex justify-between text-lg font-bold text-[#423526] border-t pt-2">
                  <span>Total</span><span>{formatRupiah(detail.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
