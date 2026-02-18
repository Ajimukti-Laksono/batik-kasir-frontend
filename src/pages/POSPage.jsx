import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, ArrowRight, X, User, Printer, Package } from 'lucide-react';
import api, { formatRupiah } from '../services/api';

const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    searchRef.current?.focus();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { per_page: 1000, is_active: 1 } });
      setProducts(res.data.data.data || res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', { params: { is_active: 1 } });
      setCategories(res.data.data.data || res.data.data);
    } catch {}
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'all' || p.category_id == activeCategory;
    return matchSearch && matchCategory && p.stock > 0;
  });

  const handleSearchKeyPress = async (e) => {
    if (e.key === 'Enter') {
      if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearch('');
      } else if (search.length > 0) {
        // Try exact sku or barcode match if multiple or no results in filter
        const exactMatch = products.find(p => p.sku === search || p.barcode === search);
        if (exactMatch) {
          addToCart(exactMatch);
          setSearch('');
        } else {
          // Fallback: search on server by barcode
          try {
            const res = await api.get('/products/search/barcode', { params: { barcode: search } });
            if (res.data.success) {
              addToCart(res.data.data);
              setSearch('');
            }
          } catch (err) {
            alert(`Produk dengan SKU/Barcode "${search}" tidak ditemukan`);
            setSearch('');
          }
        }
      }
    }
  };

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // success, error

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) {
        showToast(`Stok ${product.name} hanya ${product.stock}`, 'error');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
      showToast(`${product.name} qty +1`, 'success');
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
      showToast(`${product.name} ditambahkan ke keranjang`, 'success');
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id !== id) return item;
      const newQty = item.qty + delta;
      if (newQty <= 0) return null;
      if (newQty > item.stock) { 
        showToast(`Stok ${item.name} hanya ${item.stock}`, 'error'); 
        return item; 
      }
      return { ...item, qty: newQty };
    }).filter(Boolean));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  const clearCart = () => { setCart([]); setDiscount(0); };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = discount > 0 ? (subtotal * discount / 100) : 0;
  const taxable = subtotal - discountAmount;
  const tax = Math.round(taxable * 0.11);
  const total = taxable + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const payload = {
        customer_name: customerInfo.name || 'Umum',
        customer_phone: customerInfo.phone || null,
        items: cart.map(item => ({ product_id: item.id, quantity: item.qty, discount: 0 })),
        discount: discountAmount,
        tax_percentage: 11,
        payment_method: paymentMethod,
        notes: '',
      };

      const res = await api.post('/transactions', payload);
      const data = res.data.data;

      if (paymentMethod === 'midtrans') {
        // Load Midtrans Snap
        const { midtrans_token, client_key, is_production } = data;
        const snapUrl = is_production
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';

        // Load snap script dynamically
        if (!window.snap) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = snapUrl;
            script.setAttribute('data-client-key', client_key);
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        window.snap.pay(midtrans_token, {
          onSuccess: async (result) => {
            // Force sync status with backend to ensure DB is updated
            try {
              await api.get(`/transactions/${data.transaction.id}/sync`);
            } catch (e) {
              console.error('Sync failed', e);
              alert('Pembayaran berhasil di Midtrans, namun sinkronisasi status otomatis gagal. Mohon cek status di Riwayat Transaksi.');
            }

            setCurrentTransaction(data.transaction);
            setPaymentModal(false);
            setSuccessModal(true);
            clearCart();
            fetchProducts(); // Refresh stock
          },
          onPending: (result) => {
            alert('Pembayaran pending. Silakan selesaikan pembayaran. Cek riwayat transaksi untuk status terkini.');
            setPaymentModal(false);
            
            // Clear cart to prevent duplicate transaction creation if user retries
            clearCart(); 
            fetchProducts(); 
          },
          onError: (result) => {
            alert('Pembayaran gagal: ' + result.status_message);
          },
          onClose: () => {
            console.log('Payment popup closed');
          }
        });
      } else {
        // Cash or transfer
        setCurrentTransaction(data);
        setPaymentModal(false);
        setSuccessModal(true);
        clearCart();
        fetchProducts(); // Refresh stock
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 -m-6 p-4 bg-gray-100 relative">
      {/* Mobile Cart Toggle */}
      <button 
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#684F33] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#5a432b] transition-colors"
        onClick={() => {
          document.getElementById('mobile-cart').classList.remove('translate-y-full');
          document.getElementById('cart-overlay').classList.remove('hidden');
        }}
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {cart.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute -top-2 -right-2 border border-[#684F33]">{cart.length}</span>}
        </div>
      </button>

      {/* Left - Products */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden mb-20 lg:mb-0">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Cari produk atau scan barcode..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#684F33] focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`pl-1 pr-4 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 border-2 ${
                activeCategory === 'all'
                  ? 'bg-white border-[#684F33] text-[#684F33] shadow-md'
                  : 'bg-white border-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeCategory === 'all' ? 'bg-[#684F33] text-white' : 'bg-gray-200 text-gray-400'}`}>
                <Package size={16} />
              </div>
              Semua Produk
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`pl-1 pr-4 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 border-2 ${
                  activeCategory === cat.id
                    ? 'bg-white border-[#684F33] text-[#684F33] shadow-md'
                    : 'bg-white border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {cat.image ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${cat.image}`} 
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.style.display = 'none';
                        e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                        e.target.parentNode.innerHTML = `<span class="text-[10px] font-bold text-gray-400">${cat.name.substring(0,2).toUpperCase()}</span>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-[10px]">
                      {cat.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-2xl p-3 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-2 border-transparent hover:border-[#684F33]/20 group"
              >
                <div className="aspect-square bg-gradient-to-br from-[#FAF8F6] to-[#E5DDD5] rounded-xl mb-3 overflow-hidden">
                  {product.image ? (
                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${product.image}`}
                      alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-[#684F33]/30" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-0.5">{product.sku}</p>
                <p className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-[#684F33]">{product.name}</p>
                <p className="font-bold text-[#b27632] mt-1">{formatRupiah(product.price)}</p>
                <div className={`mt-1 text-xs ${product.stock <= product.min_stock ? 'text-red-500' : 'text-gray-400'}`}>
                  Stok: {product.stock}
                </div>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
              <p>Produk tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Overlay */}
      <div 
        id="cart-overlay" 
        className="fixed inset-0 bg-black/50 z-30 hidden lg:hidden"
        onClick={() => {
          document.getElementById('mobile-cart').classList.add('translate-y-full');
          document.getElementById('cart-overlay').classList.add('hidden');
        }}
      ></div>

      {/* Right - Cart */}
      <div 
        id="mobile-cart"
        className="fixed inset-x-0 bottom-0 h-[85vh] z-40 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.2)] rounded-t-3xl transition-transform duration-300 transform translate-y-full lg:translate-y-0 lg:static lg:h-auto lg:w-96 lg:rounded-2xl lg:shadow-sm flex flex-col"
      >
        {/* Mobile Header Drag Handle */}
        <div className="lg:hidden w-full flex justify-center py-3 cursor-pointer hover:bg-gray-50 rounded-t-3xl" 
             onClick={() => {
               document.getElementById('mobile-cart').classList.add('translate-y-full');
               document.getElementById('cart-overlay').classList.add('hidden');
             }}
        >
           <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Cart Header */}
        <div className="p-4 bg-gradient-to-r from-[#684F33] to-[#b27632] text-white lg:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <h2 className="font-bold">Keranjang</h2>
              {cart.length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cart.length} item</span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-white/70 hover:text-white text-xs">Kosongkan</button>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <User size={14} />
            <span>Info Pelanggan (opsional)</span>
          </div>
          <input type="text" placeholder="Nama pelanggan"
            value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-[#684F33]"
          />
          <input type="tel" placeholder="No. telepon"
            value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#684F33]"
          />
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Tambahkan produk ke keranjang</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-[#b27632] font-semibold">{formatRupiah(item.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#684F33] hover:text-white flex items-center justify-center transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#684F33] hover:text-white flex items-center justify-center transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-right min-w-[70px]">
                  <p className="text-sm font-bold text-gray-800">{formatRupiah(item.price * item.qty)}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            {/* Discount */}
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs text-gray-500 whitespace-nowrap">Diskon (%)</label>
              <input type="number" min="0" max="100" value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#684F33]"
              />
            </div>

            <div className="space-y-1 text-sm mb-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatRupiah(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon ({discount}%)</span><span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Pajak (11%)</span><span>{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-[#423526] border-t pt-2 mt-2">
                <span>TOTAL</span><span>{formatRupiah(total)}</span>
              </div>
            </div>

            <button
              onClick={() => setPaymentModal(true)}
              className="w-full py-3 bg-gradient-to-r from-[#684F33] to-[#b27632] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-[#423526] hover:to-[#684F33] transition-all shadow-lg"
            >
              <CreditCard size={18} /> Bayar {formatRupiah(total)}
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#423526]">Pilih Pembayaran</h3>
                <button onClick={() => setPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <p className="text-3xl font-bold text-[#b27632] mt-2">{formatRupiah(total)}</p>
            </div>
            <div className="p-6 space-y-3">
              {[
                { id: 'midtrans', label: 'Bayar Online (Midtrans)', sublabel: 'QRIS, Transfer, E-Wallet, Kartu Kredit', icon: CreditCard, gradient: 'from-blue-500 to-blue-600' },
                { id: 'cash', label: 'Tunai', sublabel: 'Bayar langsung di kasir', icon: Banknote, gradient: 'from-green-500 to-green-600' },
                { id: 'transfer', label: 'Transfer Bank', sublabel: 'BCA, Mandiri, BRI, BNI', icon: ArrowRight, gradient: 'from-purple-500 to-purple-600' },
              ].map(method => (
                <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === method.id
                      ? 'border-[#684F33] bg-[#684F33]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${method.gradient} rounded-xl flex items-center justify-center`}>
                    <method.icon size={22} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{method.label}</p>
                    <p className="text-xs text-gray-500">{method.sublabel}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <div className="ml-auto w-5 h-5 bg-[#684F33] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="p-6 pt-0">
              <button onClick={handleCheckout} disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-[#684F33] to-[#b27632] text-white rounded-2xl font-bold text-lg hover:from-[#423526] hover:to-[#684F33] transition-all shadow-xl disabled:opacity-70 flex items-center justify-center gap-2">
                {processing ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><CreditCard size={20} /> Proses Pembayaran</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && currentTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl text-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">Pembayaran Berhasil!</h3>
            <p className="text-gray-500 mb-4">
              {currentTransaction.invoice_number || `TRX-${currentTransaction.id}`}
            </p>
            <p className="text-4xl font-bold text-[#b27632] mb-6">
              {formatRupiah(currentTransaction.total)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => window.print()}
                className="flex-1 py-3 border-2 border-[#684F33] text-[#684F33] rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#684F33]/5">
                <Printer size={18} /> Cetak Struk
              </button>
              <button onClick={() => { 
                setSuccessModal(false); 
                setCurrentTransaction(null); 
                setCustomerInfo({ name: '', phone: '' }); 
                searchRef.current?.focus();
              }}
                className="flex-1 py-3 bg-gradient-to-r from-[#684F33] to-[#b27632] text-white rounded-xl font-semibold">
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-down ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-[#684F33] text-white'
        }`}>
          {toast.type === 'error' ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          )}
          <div>
            <p className="font-bold text-sm">{toast.type === 'error' ? 'Oops!' : 'Berhasil'}</p>
            <p className="text-xs opacity-90">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;
