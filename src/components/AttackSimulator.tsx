import React from 'react';
import { ShieldAlert, Zap, UserX, UserCheck, Flame } from 'lucide-react';

interface AttackSimulatorProps {
  onSimulateWrongPassword: () => void;
  onSimulateUnknownUser: () => void;
  onSimulateSuccessSignup: () => void;
  onSimulateBruteForceBurst: () => void;
}

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({
  onSimulateWrongPassword,
  onSimulateUnknownUser,
  onSimulateSuccessSignup,
  onSimulateBruteForceBurst,
}) => {
  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Event Trigger & Security Testing</h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">1-Click Live Test</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={onSimulateWrongPassword}
          className="p-2.5 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/50 hover:border-rose-500/50 rounded-xl text-left transition group"
        >
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs mb-1">
            <ShieldAlert className="w-3.5 h-3.5 group-hover:scale-110 transition" />
            <span>Wrong Pass</span>
          </div>
          <p className="text-[10px] text-slate-400">Trigger WRONG_PASSWORD audit record</p>
        </button>

        <button
          type="button"
          onClick={onSimulateUnknownUser}
          className="p-2.5 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-900/50 hover:border-amber-500/50 rounded-xl text-left transition group"
        >
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs mb-1">
            <UserX className="w-3.5 h-3.5 group-hover:scale-110 transition" />
            <span>Unknown Email</span>
          </div>
          <p className="text-[10px] text-slate-400">Trigger USER_NOT_FOUND scan attempt</p>
        </button>

        <button
          type="button"
          onClick={onSimulateSuccessSignup}
          className="p-2.5 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-900/50 hover:border-cyan-500/50 rounded-xl text-left transition group"
        >
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs mb-1">
            <UserCheck className="w-3.5 h-3.5 group-hover:scale-110 transition" />
            <span>Mock Signup</span>
          </div>
          <p className="text-[10px] text-slate-400">Creates user + SIGNUP_SUCCESS event</p>
        </button>

        <button
          type="button"
          onClick={onSimulateBruteForceBurst}
          className="p-2.5 bg-purple-950/40 hover:bg-purple-950/70 border border-purple-900/50 hover:border-purple-500/50 rounded-xl text-left transition group"
        >
          <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs mb-1">
            <Flame className="w-3.5 h-3.5 group-hover:scale-110 transition" />
            <span>Brute Burst (x3)</span>
          </div>
          <p className="text-[10px] text-slate-400">Rapid attacks to test audit table</p>
        </button>
      </div>
    </div>
  );
};
