import React from 'react';
import { Users, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SecurityStats } from '../types/auth';

interface StatsCardsProps {
  stats: SecurityStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Registered Users */}
      <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Live Users</span>
          <div className="p-2 rounded-xl bg-cyan-950/70 text-cyan-400 border border-cyan-800/60">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-white font-mono tracking-tight">{stats.total_users}</div>
        <div className="text-[11px] text-cyan-400 font-medium mt-1 flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>users table records</span>
        </div>
      </div>

      {/* 2. Total Login Attempts */}
      <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Total Attempts</span>
          <div className="p-2 rounded-xl bg-indigo-950/70 text-indigo-400 border border-indigo-800/60">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-white font-mono tracking-tight">{stats.total_attempts}</div>
        <div className="text-[11px] text-indigo-400 font-medium mt-1 flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span>login_records logged</span>
        </div>
      </div>

      {/* 3. Successful Logins */}
      <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Successful Logins</span>
          <div className="p-2 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">{stats.success_logins}</div>
        <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>LOGIN_SUCCESS</span>
        </div>
      </div>

      {/* 4. Failed / Blocked Attempts */}
      <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Failed / Blocked</span>
          <div className="p-2 rounded-xl bg-rose-950/70 text-rose-400 border border-rose-800/60">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">{stats.failed_attempts}</div>
        <div className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>WRONG_PASS / UNKNOWN</span>
        </div>
      </div>
    </section>
  );
};
