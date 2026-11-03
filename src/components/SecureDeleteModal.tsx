import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

interface SecureDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearRecordsOnly: () => void;
  onFullWipeDatabase: () => void;
  totalUsers: number;
  totalRecords: number;
}

export const SecureDeleteModal: React.FC<SecureDeleteModalProps> = ({
  isOpen,
  onClose,
  onClearRecordsOnly,
  onFullWipeDatabase,
  totalUsers,
  totalRecords,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClearRecords = () => {
    onClearRecordsOnly();
    setActionSuccess('Audit activity records have been purged successfully.');
    setTimeout(() => {
      setActionSuccess(null);
      onClose();
    }, 1500);
  };

  const handleFullWipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationText.trim().toUpperCase() !== 'DELETE') return;
    onFullWipeDatabase();
    setConfirmationText('');
    setActionSuccess('Complete database wipe executed successfully. Database is now at 0 records.');
    setTimeout(() => {
      setActionSuccess(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-rose-500/40 rounded-3xl shadow-2xl shadow-rose-950/50 p-6 sm:p-8 text-slate-100 overflow-hidden">
        
        {/* Ambient warning glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Secure Database Deletion Control
              </h3>
              <p className="text-xs text-rose-300 font-mono">auth_database.db Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="my-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="py-5 space-y-6">

          {/* Current Counts */}
          <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Registered Users:</span>
              <span className="text-cyan-400 text-lg font-bold">{totalUsers}</span>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Audit Event Logs:</span>
              <span className="text-rose-400 text-lg font-bold">{totalRecords}</span>
            </div>
          </div>

          {/* Option 1: Purge Audit Records Only */}
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Purge Login & Activity Records Only</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800">
                Safe Clean
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Deletes all rows in <code className="text-cyan-300 font-mono">login_records</code> table while keeping all registered users, passwords, and sessions intact.
            </p>
            <button
              type="button"
              onClick={handleClearRecords}
              disabled={totalRecords === 0}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/60 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Audit Records ({totalRecords})</span>
            </button>
          </div>

          {/* Option 2: Full Factory Wipe (Requires Typing "DELETE") */}
          <div className="p-4 bg-rose-950/20 rounded-2xl border border-rose-900/40 hover:border-rose-500/60 transition">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-200">Full Factory Reset (Erase Everything)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                Destructive
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Permanently wipes both <code className="text-rose-300 font-mono">users</code> and <code className="text-rose-300 font-mono">login_records</code> tables back to zero. Type <span className="font-mono font-bold text-rose-400 uppercase">DELETE</span> below to confirm.
            </p>

            <form onSubmit={handleFullWipe} className="space-y-3">
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full bg-[#0A0F1D] border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={confirmationText.trim().toUpperCase() !== 'DELETE'}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 shadow-lg shadow-rose-900/40 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Wipe Entire Database</span>
              </button>
            </form>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
