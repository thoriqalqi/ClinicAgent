
import React, { useState } from 'react';
import { NAV_ITEMS } from '../constants';
import { AppView, User, UserRole } from '../types';
import { 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Bell, 
  ShieldCheck,
  User as UserIcon,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LayoutProps {
  currentUser: User | null;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onLogout: () => void;
  children: React.ReactNode;
  systemName?: string;
}

export const Layout: React.FC<LayoutProps> = ({ currentUser, currentView, setCurrentView, onLogout, children, systemName = "ClinicAgent" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!currentUser) return <>{children}</>;

  const navItems = NAV_ITEMS[currentUser.role] || [];
  
  const isProfileEditable = currentUser.role !== UserRole.ADMIN;

  return (
    <div className="flex h-screen bg-[#F2F4F7] overflow-hidden font-sans text-sm">
      
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 shadow-soft
          transition-all duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static
          ${isCollapsed ? 'w-[110px]' : 'w-[300px]'}
        `}
      >
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-4 top-24 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center shadow-md text-slate-400 hover:text-primary-600 hover:scale-110 transition-all z-50"
        >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        
        <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-8'} transition-all duration-300 border-b border-slate-50`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 shrink-0">
              <ShieldCheck size={24} />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in overflow-hidden whitespace-nowrap">
                <span className="font-bold text-xl tracking-tight text-slate-900 block leading-none mb-1">{systemName}</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md inline-block">Portal</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 py-8 px-4 space-y-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {!isCollapsed && (
            <p className="px-4 mb-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider animate-fade-in">
              Menu Utama
            </p>
          )}
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as AppView);
                  setIsMobileMenuOpen(false);
                }}
                title={isCollapsed ? item.label : ''}
                className={`
                  w-full flex items-center transition-all duration-300 group relative overflow-hidden
                  ${isCollapsed ? 'justify-center h-16 rounded-[2rem] px-0' : 'h-16 px-6 gap-4 rounded-[2rem]'}
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-primary-700'}
                `}
              >
                {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-100 z-0"></div>
                )}

                <div className="relative z-10 flex items-center justify-center w-8 h-8">
                   <Icon size={24} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-600 transition-colors'} />
                </div>

                {!isCollapsed && (
                  <span className="relative z-10 font-bold text-base tracking-wide whitespace-nowrap">{item.label}</span>
                )}
                
                {!isCollapsed && isActive && (
                  <div className="absolute right-6 w-2 h-2 rounded-full bg-white/50 shadow-inner z-10"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={() => isProfileEditable && setCurrentView(AppView.PROFILE)}
            disabled={!isProfileEditable}
            className={`
               w-full rounded-[2.5rem] bg-white border border-slate-200 shadow-sm flex items-center
               ${isCollapsed ? 'justify-center p-2 h-16' : 'p-3 gap-4 h-20'}
               ${isProfileEditable ? 'hover:shadow-md hover:border-primary-200 cursor-pointer group' : 'cursor-default'}
            `}
            title={isProfileEditable ? "Edit Profil" : "Akun Administrator"}
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                 {currentUser.avatar ? (
                     <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-slate-600 font-bold text-lg">{currentUser.name.charAt(0)}</span>
                 )}
            </div>
            
            {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left animate-fade-in">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-700">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate capitalize font-medium flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${currentUser.role === 'DOCTOR' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                    {currentUser.role === 'DOCTOR' ? 'Dokter' : currentUser.role === 'ADMIN' ? 'Admin' : 'Pasien'}
                </p>
                </div>
            )}
            
            {!isCollapsed && isProfileEditable && <Settings size={20} className="text-slate-300 group-hover:text-primary-500 mr-2" />}
          </button>
          
          {!isCollapsed && (
              <button 
                onClick={onLogout}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                >
                <LogOut size={16} /> Keluar
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen relative bg-[#F2F4F7]">
        
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0 bg-[#F2F4F7]/90 backdrop-blur-sm">
           <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-500 hover:bg-white rounded-xl transition-colors"
             >
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center bg-white shadow-sm rounded-full px-5 py-3 w-80 focus-within:ring-4 focus-within:ring-primary-100 transition-all border border-slate-100">
                <Search size={18} className="text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Cari apa saja..." 
                  className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400 font-medium"
                />
             </div>

              <button className="relative p-3 bg-white rounded-full text-slate-400 hover:text-primary-600 hover:shadow-md transition-all border border-slate-100">
                <Bell size={20} />
                <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
           <div className="max-w-[1600px] mx-auto w-full pb-10">
             {children}
           </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};
