import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Store, ShoppingBag, Package, Layers, Receipt, PieChart, Users,
  LogOut, Menu, X, ChevronDown, Tag, Bell, Settings
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager'] },
    { path: '/pos', icon: Store, label: 'Kasir Offline', roles: ['kasir_offline'] },
    { path: '/online-orders', icon: ShoppingBag, label: 'Pesanan Online', roles: ['kasir_online'] },
    { path: '/products', icon: Package, label: 'Produk', roles: ['admin', 'manager'] },
    { path: '/categories', icon: Layers, label: 'Kategori', roles: ['admin', 'manager'] },
    { path: '/transactions', icon: Receipt, label: 'Transaksi', roles: ['admin', 'manager'] },
    { path: '/reports', icon: PieChart, label: 'Laporan', roles: ['admin', 'manager'] },
    { path: '/users', icon: Users, label: 'Pengguna', roles: ['admin'] },
  ];

  const visibleNav = navItems.filter(item => hasRole(item.roles));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-blue-100 text-blue-700',
    kasir: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex h-screen bg-[#F8F5F2] font-sans text-gray-800 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30
        ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 md:w-24 -translate-x-full md:translate-x-0'} 
        bg-batik-pattern text-white transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] 
        flex flex-col shadow-2xl
      `}>
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-batik-dark/95 via-batik-dark/90 to-batik-green/95 z-0"></div>
        
        {/* Logo Section */}
        <div className="p-8 border-b border-white/5 z-10 flex flex-col items-center relative">
          <div className={`${sidebarOpen ? 'w-24 h-24' : 'w-12 h-12'} transition-all duration-500 ease-out flex items-center justify-center relative mb-4`}>
            {/* Logo Image */}
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform hover:scale-105 duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-batik-gold to-batik-olive rounded-2xl flex items-center justify-center shadow-lg transform rotate-3"><svg xmlns="http://www.w3.org/2000/svg" width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg></div>';
              }}
            />
          </div>
          {sidebarOpen && (
            <div className="text-center animate-fade-in">
              <h1 className="font-serif text-2xl tracking-widest font-bold text-transparent bg-clip-text bg-gradient-to-r from-batik-gold to-batik-warm">BATIK</h1>
              <p className="text-[10px] text-[#A8A29E] tracking-[0.3em] uppercase mt-2 border-t border-white/10 pt-2 inline-block">Nusantara System</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto z-10 custom-scrollbar">
          {visibleNav.map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  active
                    ? 'bg-batik-gold/10 text-batik-gold backdrop-blur-sm'
                    : 'text-[#A8A29E] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${active ? 'bg-gradient-to-br from-batik-gold to-batik-warm text-batik-dark shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 group-hover:bg-white/10'}`}>
                   <item.icon size={18} />
                </div>
                
                {sidebarOpen && (
                  <span className={`text-sm font-medium tracking-wide transition-all z-10 ${active ? 'text-batik-gold font-bold' : ''}`}>
                    {item.label}
                  </span>
                )}
                
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 inset-y-0 w-1 bg-batik-gold shadow-[0_0_10px_#D4AF37]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-6 border-t border-white/5 z-10 bg-[#0B301D]/80 backdrop-blur-md">
          <div className={`flex items-center gap-4 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-batik-gold to-batik-warm shadow-lg">
              <div className="w-full h-full rounded-full bg-batik-dark flex items-center justify-center text-xs font-bold text-batik-gold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-sm font-bold truncate text-white">{user?.name}</p>
                <p className="text-xs text-batik-gold capitalize">{user?.role}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-[#F4F6F4]">
        {/* Top Bar Floating */}
        <header className="px-8 py-4 z-30">
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
               <button
                 onClick={() => setSidebarOpen(!sidebarOpen)}
                 className="p-2 rounded-xl hover:bg-batik-green/10 hover:text-batik-green transition-colors text-gray-500"
               >
                 <Menu size={20} />
               </button>
               <h2 className="text-lg font-bold text-batik-dark hidden sm:block font-serif">
                  {navItems.find(item => isActive(item.path))?.label || 'Aplikasi Batik'}
               </h2>
            </div>
  
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-gray-500 hover:text-batik-gold transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="h-8 w-[1px] bg-gray-200"></div>
  
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500 font-medium">Selamat Datang,</p>
                    <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-batik-gold to-batik-olive p-[2px] shadow-lg">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                      alt="User" 
                      className="w-full h-full rounded-full border-2 border-white object-cover"
                    />
                 </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 pt-2 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
