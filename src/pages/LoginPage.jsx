import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Eye, EyeOff, LogIn, Store } from 'lucide-react';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'kasir' ? '/pos' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#2D241B]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/login-bg.png" 
          alt="Background" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'; // Fallback to gradient if image missing
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D241B]/95 via-[#2D241B]/90 to-[#423526]/80 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative w-full max-w-4xl grid md:grid-cols-2 shadow-2xl rounded-[2rem] overflow-hidden animate-fade-in group">
        
        {/* Left Side - Hero */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-[#D4AF37] to-[#8A6E2F] text-white relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/batik-pattern-1.png')]"></div>
           <div className="relative z-10 text-center">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-500 p-4">
                <img 
                  src="/logo.png" 
                  alt="Logo Batik Nusantara" 
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store drop-shadow-md"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>';
                  }}
                />
              </div>
              <h1 className="text-4xl font-serif font-bold tracking-widest mb-2">BATIK</h1>
              <p className="text-sm tracking-[0.4em] uppercase opacity-90 border-t border-white/30 pt-4 inline-block px-4">Nusantara System</p>
              <div className="mt-12 space-y-2 text-sm opacity-80 font-light italic">
                <p>"Melestarikan budaya melalui teknologi"</p>
              </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white/95 backdrop-blur-xl p-8 md:p-12 flex flex-col justify-center relative">
          <div className="absolute top-0 right-0 p-32 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
          <div className="mb-8 relative z-10">
             <h2 className="text-3xl font-bold text-[#2D241B] font-serif mb-2">Selamat Datang</h2>
             <p className="text-gray-500 text-sm">Silakan masuk untuk mengakses sistem</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="nama@email.com"
                required
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all duration-300 font-medium text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  required
                  className="w-full px-5 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all duration-300 font-medium text-gray-700"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors p-1">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer" />
                <span className="text-gray-500 group-hover:text-gray-700 transition-colors">Ingat saya</span>
              </label>
              <a href="#" className="text-[#D4AF37] font-semibold hover:underline">Lupa password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#8A6E2F] text-white rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-[#D4AF37]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Masuk Sistem <LogIn size={18} className="group-hover:translate-x-1 transition-transform"/></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center relative z-10">
             <p className="text-xs text-gray-400">© 2024 Batik Nusantara. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
