import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, RefreshCw, X } from 'lucide-react';
import api, { formatRupiah, formatDate } from '../services/api';

const OnlineOrdersPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions/online/pending');
      setTransactions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await api.get(`/transactions/${id}`);
      setDetail(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmOrder = async (id) => {
    if (!window.confirm('Apakah Anda yakin pesanan ini sudah dibayar dan siap dikonfirmasi?')) return;
    
    try {
      const res = await api.put(`/transactions/${id}/confirm`);
      if (res.data.success) {
        alert('Pesanan berhasil dikonfirmasi!');
        fetchPendingOrders();
      }
    } catch (err) {
      alert('Gagal mengonfirmasi pesanan: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-batik-dark">Pesanan Online</h1>
          <p className="text-gray-500 text-sm">Konfirmasi pesanan dari e-commerce yang berstatus pending</p>
        </div>
        <button onClick={fetchPendingOrders} className="btn btn-outline flex items-center gap-2 border-2 border-batik-gold text-batik-gold px-4 py-2 rounded-xl hover:bg-batik-gold hover:text-white transition-colors">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-batik-green to-batik-dark text-white">
              <tr>
                <th className="text-left p-4 text-sm font-semibold">Invoice</th>
                <th className="text-left p-4 text-sm font-semibold">Pelanggan</th>
                <th className="text-left p-4 text-sm font-semibold">Total</th>
                <th className="text-left p-4 text-sm font-semibold">Pembayaran</th>
                <th className="text-left p-4 text-sm font-semibold">Tanggal</th>
                <th className="text-center p-4 text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-batik-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td></tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Tidak ada pesanan online yang perlu dikonfirmasi saat ini.
                  </td>
                </tr>
              ) : transactions.map(trx => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm font-bold text-batik-green">{trx.invoice_number}</td>
                  <td className="p-4 text-sm">
                    {trx.customer_name}
                    {trx.customer_phone && <div className="text-xs text-gray-500">{trx.customer_phone}</div>}
                  </td>
                  <td className="p-4 font-bold text-gray-800">{formatRupiah(trx.total)}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg capitalize">
                      {trx.payment_method} - Pending
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{formatDate(trx.created_at)}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => fetchDetail(trx.id)}
                        title="Lihat Detail"
                        className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                        <Eye size={16} /> Detail
                      </button>
                      <button onClick={() => confirmOrder(trx.id)}
                        title="Konfirmasi Pesanan"
                        className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                        <CheckCircle size={16} /> Konfirmasi
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold text-batik-dark">Detail Pesanan Online</h3>
                <p className="text-sm font-mono text-batik-gold">{detail.invoice_number}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Pelanggan</p><p className="font-semibold">{detail.customer_name}</p></div>
                <div><p className="text-gray-500">No. Telepon</p><p className="font-semibold">{detail.customer_phone || '-'}</p></div>
                <div><p className="text-gray-500">Pembayaran</p><p className="font-semibold capitalize">{detail.payment_method}</p></div>
                <div><p className="text-gray-500">Status</p>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    Pending
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
                <div className="flex justify-between text-lg font-bold text-batik-dark border-t pt-2">
                  <span>Total</span><span>{formatRupiah(detail.total)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t mt-4">
                <button 
                  onClick={() => {
                    confirmOrder(detail.id);
                    setDetail(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-batik-gold to-batik-warm hover:shadow-lg text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                  <CheckCircle size={20} />
                  Konfirmasi Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineOrdersPage;
