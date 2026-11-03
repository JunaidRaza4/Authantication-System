import React from 'react';
import { Shield, Download, FileCode, LogOut, User, Trash2, DatabaseZap } from 'lucide-react';
import { User as UserType } from '../types/auth';

interface HeaderProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onExportCSV: () => void;
  activeView: 'dashboard' | 'code' | 'docs';
  setActiveView: (view: 'dashboard' | 'code' | 'docs') => void;
  onDownloadAppPy: () => void;
  onOpenDeleteModal: () => void;
  usersCount: number;
  recordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onExportCSV,
  activeView,
  setActiveView,
  onDownloadAppPy,
  onOpenDeleteModal,
  usersCount,
  recordsCount,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0B1220]/85 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 p-[2px] flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/35 transition-all duration-300">
              <div className="w-full h-full bg-[#0A0F1D] rounded-[14px] flex items-center justify-center flex-col relative overflow-hidden">
                <span className="text-[11px] font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  MJR
                </span>
                <div className="w-3 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 mt-0.5"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                M.J.R <span className="text-cyan-400 font-extrabold">Auth System</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-xs">
                SECURE LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Enterprise Identity & Audit Tracking &bull; Zero Mock Data</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeView === 'dashboard'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Console
          </button>
          <button
            onClick={() => setActiveView('code')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              activeView === 'code'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>app.py</span>
          </button>
          <button
            onClick={() => setActiveView('docs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeView === 'docs'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Urdu Docs
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* SECURE DATABASE DELETE BUTTON */}
          <button
            onClick={onOpenDeleteModal}
            title="Open Secure Database Deletion Control"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-xl hover:bg-rose-900/60 hover:border-rose-400 transition shadow-sm cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Delete DB</span>
          </button>

          <button
            onClick={onDownloadAppPy}
            title="Download standalone app.py for local Python run"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-xl hover:border-cyan-400 hover:text-cyan-300 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download app.py</span>
          </button>

          <button
            onClick={onExportCSV}
            title="Export all saved login records as CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-xl hover:bg-cyan-900/60 hover:border-cyan-400 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Export</span> CSV
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-slate-950 shadow-xs">
                {currentUser.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <div className="font-bold text-white truncate max-w-[110px]">{currentUser.full_name}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{currentUser.email}</div>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium">Guest</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
