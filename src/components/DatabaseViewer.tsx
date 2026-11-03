import React, { useState } from 'react';
import { Database, Download, Search, Filter, Copy, Check, Terminal, Inbox, Trash2, ShieldAlert } from 'lucide-react';
import { User, LoginRecord, EventType } from '../types/auth';

interface DatabaseViewerProps {
  users: User[];
  records: LoginRecord[];
  onExportCSV: () => void;
  onOpenDeleteModal: () => void;
  onDeleteSingleRecord?: (recordId: number) => void;
  onDeleteSingleUser?: (userId: number) => void;
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({
  users,
  records,
  onExportCSV,
  onOpenDeleteModal,
  onDeleteSingleRecord,
  onDeleteSingleUser,
}) => {
  const [activeTable, setActiveTable] = useState<'records' | 'users'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.email_entered.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ip_address.includes(searchTerm) ||
      r.device_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = eventFilter === 'ALL' || r.event_type === eventFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter users
  const filteredUsers = users.filter((u) => {
    return (
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.password_hash.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getBadgeClass = (type: EventType) => {
    switch (type) {
      case 'LOGIN_SUCCESS':
        return 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40';
      case 'SIGNUP_SUCCESS':
        return 'bg-cyan-950/70 text-cyan-400 border border-cyan-500/40';
      case 'WRONG_PASSWORD':
        return 'bg-rose-950/70 text-rose-400 border border-rose-500/40';
      case 'USER_NOT_FOUND':
        return 'bg-amber-950/70 text-amber-400 border border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="bg-[#0F172A]/85 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 space-y-0 text-slate-100">
      
      {/* Top Header of DB Viewer */}
      <div className="p-5 border-b border-slate-800 bg-[#0B1220]/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">Live Database Inspector</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                M.J.R SQLite3
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">auth_database.db &bull; Real-time Disk Storage (No Mock Data)</p>
          </div>
        </div>

        {/* View Switcher Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 bg-slate-900 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTable('records')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                activeTable === 'records'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>login_records</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTable === 'records' ? 'bg-black/30 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {records.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTable('users')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                activeTable === 'users'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>users</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTable === 'users' ? 'bg-black/30 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {users.length}
              </span>
            </button>
          </div>

          {/* SECURE DELETE CONTROL BUTTON */}
          <button
            onClick={onOpenDeleteModal}
            title="Open Secure Database Deletion Control"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-xl hover:bg-rose-900/60 transition shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete DB Records</span>
          </button>

          <button
            onClick={onExportCSV}
            title="Export all login records to CSV"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-xl hover:bg-cyan-900/60 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-5 py-3 bg-[#0D1527] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${activeTable === 'records' ? 'by email, IP, agent, or event...' : 'by name, email, or hash...'}`}
            className="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {activeTable === 'records' && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="bg-[#0A0F1D] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 font-medium cursor-pointer"
            >
              <option value="ALL">All Events ({records.length})</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS (Green)</option>
              <option value="SIGNUP_SUCCESS">SIGNUP_SUCCESS (Blue)</option>
              <option value="WRONG_PASSWORD">WRONG_PASSWORD (Red)</option>
              <option value="USER_NOT_FOUND">USER_NOT_FOUND (Yellow)</option>
            </select>
          </div>
        )}
      </div>

      {/* TABLE 1: login_records table */}
      {activeTable === 'records' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0F1D] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">#ID</th>
                <th className="py-3 px-4 font-bold">Event Status</th>
                <th className="py-3 px-4 font-bold">User ID</th>
                <th className="py-3 px-4 font-bold">Email Entered</th>
                <th className="py-3 px-4 font-bold">IP Address</th>
                <th className="py-3 px-4 font-bold">Device / Browser Info</th>
                <th className="py-3 px-4 font-bold whitespace-nowrap">Logged At</th>
                <th className="py-3 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-semibold">#{r.id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getBadgeClass(r.event_type)}`}>
                        {r.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {r.user_id !== null ? (
                        <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/80">
                          UID: {r.user_id}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">NULL</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{r.email_entered}</td>
                    <td className="py-3 px-4 text-cyan-300 font-mono text-[11px]">{r.ip_address}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs text-[11px]" title={r.device_info}>
                      {r.device_info}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">{r.logged_at}</td>
                    <td className="py-3 px-4 text-center">
                      {onDeleteSingleRecord && (
                        <button
                          type="button"
                          onClick={() => onDeleteSingleRecord(r.id)}
                          title={`Delete record #${r.id}`}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-1">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300">No Activity Logs Found</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Zero dummy data present. Use the Sign Up or Sign In form above to record your first live user interaction!
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* TABLE 2: users table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0F1D] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">ID</th>
                <th className="py-3 px-4 font-bold">Full Name</th>
                <th className="py-3 px-4 font-bold">Email</th>
                <th className="py-3 px-4 font-bold">Salted Password Hash (Werkzeug PBKDF2)</th>
                <th className="py-3 px-4 font-bold">Created At</th>
                <th className="py-3 px-4 font-bold">Last Login</th>
                <th className="py-3 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-cyan-400 font-bold">#{u.id}</td>
                    <td className="py-3 px-4 font-sans font-bold text-white">{u.full_name}</td>
                    <td className="py-3 px-4 text-cyan-300 font-semibold">{u.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code
                          className="px-2 py-0.5 rounded-lg bg-[#0A0F1D] text-slate-300 border border-slate-800 font-mono text-[10px] truncate max-w-[260px] block"
                          title={u.password_hash}
                        >
                          {u.password_hash}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(u.password_hash, `hash-${u.id}`)}
                          className="p-1 text-slate-500 hover:text-cyan-400 transition"
                          title="Copy hash"
                        >
                          {copiedHash === `hash-${u.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">{u.created_at}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {u.last_login_at ? (
                        <span className="text-emerald-400 font-semibold">{u.last_login_at}</span>
                      ) : (
                        <span className="text-slate-600 italic">Never</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {onDeleteSingleUser && (
                        <button
                          type="button"
                          onClick={() => onDeleteSingleUser(u.id)}
                          title={`Delete user #${u.id} (${u.email})`}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-1">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300">No Users in Database</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Zero dummy data. Create an account via the Sign Up form above to register the first live user account.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SQL Query Footer Helper */}
      <div className="p-3.5 bg-[#0B1220] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {activeTable === 'records'
              ? 'SELECT * FROM login_records ORDER BY id DESC LIMIT 100;'
              : 'SELECT id, full_name, email, password_hash, created_at, last_login_at FROM users;'}
          </span>
        </div>
        <span className="font-semibold text-slate-300">
          Showing: {activeTable === 'records' ? filteredRecords.length : filteredUsers.length} live records
        </span>
      </div>

    </div>
  );
};
