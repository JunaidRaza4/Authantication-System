import React from 'react';
import { Database, ShieldCheck, Key, FileSpreadsheet, Server, Layers, Trash2 } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-200">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-[#0F172A] to-cyan-950/80 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              M.J.R Auth System Architecture & Urdu Guide
            </h2>
            <p className="text-xs text-cyan-300 font-semibold">Zero Dummy Data &bull; Enterprise SQLite3 Persistent Audit & Secure Deletion Engine</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
          Aap ke mutabiq background ko eye-catching rich obsidian cosmic dark color mein convert kar dia gaya hay aur secure database deletion system add kar dia gaya hay. Ab aap specific user/record delete kar sakte hain ya mukammal database ko wipe kar sakte hain.
        </p>
      </div>

      {/* Grid: 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Database & Record Storage */}
        <div className="bg-[#0F172A]/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>1. Database Schema & Data Kahan Save Hota Hay?</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              <strong>Data kahan save hota hay?</strong> Data built-in <code className="text-cyan-300 font-mono font-semibold">sqlite3</code> ke zariye local disk par <code className="text-cyan-300 font-mono font-semibold">auth_database.db</code> file ke andar permanently save hota hay. Server restart honay par bhi sara data mehfooz rehta hay.
            </p>
            <div className="p-3.5 bg-[#0A0F1D] rounded-2xl border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="text-cyan-400 font-bold">Table 1: users (Registered Accounts)</div>
              <ul className="text-slate-400 list-disc pl-4 space-y-0.5 text-[10px]">
                <li><code className="text-white font-bold">id</code>: INTEGER PRIMARY KEY AUTOINCREMENT</li>
                <li><code className="text-white font-bold">full_name</code>: User ka poora naam</li>
                <li><code className="text-white font-bold">email</code>: TEXT UNIQUE NOT NULL (Duplicate emails block hoti hain)</li>
                <li><code className="text-white font-bold">password_hash</code>: Werkzeug PBKDF2:SHA256 salted hash</li>
                <li><code className="text-white font-bold">created_at</code>: Account creation timestamp</li>
                <li><code className="text-white font-bold">last_login_at</code>: Aakhri login ka exact timestamp</li>
              </ul>
            </div>
            <div className="p-3.5 bg-[#0A0F1D] rounded-2xl border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="text-indigo-400 font-bold">Table 2: login_records (Live Audit Trail)</div>
              <ul className="text-slate-400 list-disc pl-4 space-y-0.5 text-[10px]">
                <li><code className="text-white font-bold">id</code>: Record ID</li>
                <li><code className="text-white font-bold">user_id</code>: Foreign Key &rarr; users.id (NULL if unregistered)</li>
                <li><code className="text-white font-bold">email_entered</code>: Form mein daala gaya email</li>
                <li><code className="text-white font-bold">event_type</code>: SIGNUP_SUCCESS, LOGIN_SUCCESS, WRONG_PASSWORD, USER_NOT_FOUND</li>
                <li><code className="text-white font-bold">ip_address</code>: Client IP (Proxy aware)</li>
                <li><code className="text-white font-bold">device_info</code>: Browser User-Agent header</li>
                <li><code className="text-white font-bold">logged_at</code>: Exact timestamp</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Authentication & Cryptography */}
        <div className="bg-[#0F172A]/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>2. Strict Password Hashing & Verification</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              <strong>Password kabhi bhi plain text mein save nahi hota!</strong> Hamne industry-standard Python security library <code className="text-emerald-400 font-mono font-semibold">werkzeug.security</code> use ki hay:
            </p>
            <div className="p-3.5 bg-[#0A0F1D] rounded-2xl border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
              <div className="text-emerald-400 font-bold">&bull; generate_password_hash(password)</div>
              <p className="text-[10px] text-slate-400">
                PBKDF2:SHA256 algorithm ke sath har user ke liye aik unique random cryptographic salt generate karta hay. Rainbow table attacks impossible hain.
              </p>
            </div>
            <div className="p-3.5 bg-[#0A0F1D] rounded-2xl border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
              <div className="text-cyan-400 font-bold">&bull; verifyWerkzeugHash / check_password_hash</div>
              <p className="text-[10px] text-slate-400">
                Salt ko extract kar ke constant-time byte comparison karta hay. Agar password 1 letter bhi ghalat ho to login foran block hota hay aur WRONG_PASSWORD event save hota hay.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Secure Deletion & Purging */}
        <div className="bg-[#0F172A]/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>3. Secure Database Record Delete Feature</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              Aap ke demand ke mutabiq 3 types ki secure database deletion provide ki gayi hay:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span><strong className="text-white">Single Record Trash:</strong> Table ke andar har row ke agay trash icon hay jis se specific record delete ho sakta hay.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span><strong className="text-amber-400">Purge Audit Logs:</strong> Sirf activity records wipe karta hay jabke registered users safe rehte hain.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span><strong className="text-rose-400">Full Factory Wipe:</strong> Database ko 100% clean karta hay (requires typing "DELETE" to prevent mistakes).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 4. API Endpoints & CSV Export */}
        <div className="bg-[#0F172A]/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>4. API Endpoints & Routes</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-2.5 bg-[#0A0F1D] rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold">GET /</span> &rarr; Home dashboard + live SQLite tables viewer
              </div>
              <div className="p-2.5 bg-[#0A0F1D] rounded-xl border border-slate-800">
                <span className="text-cyan-400 font-bold">POST /signup</span> &rarr; Input validation, PBKDF2 hash, user insert, audit log
              </div>
              <div className="p-2.5 bg-[#0A0F1D] rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold">POST /login</span> &rarr; Strict hash comparison, session auth, audit log
              </div>
              <div className="p-2.5 bg-[#0A0F1D] rounded-xl border border-slate-800">
                <span className="text-rose-400 font-bold">POST /wipe-database</span> &rarr; Secure full reset of database records
              </div>
              <div className="p-2.5 bg-[#0A0F1D] rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold">GET /export-records</span> &rarr; Streams dynamic RFC 4180 CSV file
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
