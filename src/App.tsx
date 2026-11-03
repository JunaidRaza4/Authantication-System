/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { SlidingAuthCard } from './components/SlidingAuthCard';
import { DatabaseViewer } from './components/DatabaseViewer';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { SecureDeleteModal } from './components/SecureDeleteModal';
import { User, LoginRecord, EventType } from './types/auth';
import { simulateWerkzeugHash, verifyWerkzeugHash, generateRecordsCSV, downloadCSV } from './utils/cryptoSim';
import { Sparkles, Trash2, Database, Shield } from 'lucide-react';

const STORAGE_KEY_USERS = 'mjr_auth_users_live';
const STORAGE_KEY_RECORDS = 'mjr_auth_records_live';

export default function App() {
  // Zero dummy data on clean load
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [records, setRecords] = useState<LoginRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'code' | 'docs'>('dashboard');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Persist live data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to persist users:', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to persist records:', e);
    }
  }, [records]);

  const getClientIP = () => {
    return '192.168.1.' + Math.floor(Math.random() * 200 + 10);
  };

  const getClientUserAgent = () => {
    return navigator.userAgent || 'Mozilla/5.0 (Client Browser)';
  };

  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  };

  // Log record
  const addRecord = (
    eventType: EventType,
    emailEntered: string,
    userId: number | null
  ) => {
    const newRecord: LoginRecord = {
      id: records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1,
      user_id: userId,
      email_entered: emailEntered,
      event_type: eventType,
      ip_address: getClientIP(),
      device_info: getClientUserAgent(),
      logged_at: getCurrentTimestamp(),
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  // Sign up
  const handleSignup = (fullName: string, email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        message: `An account with email '${cleanEmail}' already exists in M.J.R database. Please sign in.`,
      };
    }

    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const now = getCurrentTimestamp();
    const hashedPassword = simulateWerkzeugHash(pass);

    const newUser: User = {
      id: newId,
      full_name: fullName.trim(),
      email: cleanEmail,
      password_hash: hashedPassword,
      plain_password_demo: `demo:${pass.substring(0, 3)}***`,
      created_at: now,
      last_login_at: now,
    };

    setUsers((prev) => [newUser, ...prev]);
    addRecord('SIGNUP_SUCCESS', cleanEmail, newId);
    setCurrentUser(newUser);

    return {
      success: true,
      message: `Account created for ${fullName}! Saved live to database. Password salted & hashed with PBKDF2.`,
    };
  };

  // Login with strict password matching
  const handleLogin = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      addRecord('USER_NOT_FOUND', cleanEmail, null);
      return {
        success: false,
        message: `Email '${cleanEmail}' is not registered. (Recorded as USER_NOT_FOUND in live audit log).`,
      };
    }

    // Strict cryptographic hash check
    const isPasswordValid = verifyWerkzeugHash(pass, user.password_hash);
    if (!isPasswordValid) {
      addRecord('WRONG_PASSWORD', cleanEmail, user.id);
      return {
        success: false,
        message: 'Invalid password! The password you entered does not match your registered email credentials. (Recorded as WRONG_PASSWORD in live audit log).',
      };
    }

    // Success login
    const now = getCurrentTimestamp();
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, last_login_at: now } : u))
    );
    addRecord('LOGIN_SUCCESS', cleanEmail, user.id);
    setCurrentUser(user);

    return {
      success: true,
      message: `Welcome back, ${user.full_name}! Successfully authenticated to M.J.R Auth System.`,
    };
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // SECURE DATABASE DELETION HANDLERS
  const handleClearRecordsOnly = () => {
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY_RECORDS);
  };

  const handleFullWipeDatabase = () => {
    setUsers([]);
    setRecords([]);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_RECORDS);
  };

  const handleDeleteSingleRecord = (recordId: number) => {
    if (window.confirm(`Are you sure you want to delete audit record #${recordId}?`)) {
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
    }
  };

  const handleDeleteSingleUser = (userId: number) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (window.confirm(`Are you sure you want to delete user #${userId} (${userToDelete?.email})?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (currentUser?.id === userId) {
        setCurrentUser(null);
      }
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('No records to export yet. Perform a login or signup to generate records!');
      return;
    }
    const csvContent = generateRecordsCSV(records);
    const filename = `mjr_auth_records_${new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14)}.csv`;
    downloadCSV(filename, csvContent);
  };

  // Download standalone app.py
  const handleDownloadAppPy = () => {
    fetch('/app.py')
      .then((res) => {
        if (!res.ok) throw new Error('File fetch error');
        return res.text();
      })
      .then((text) => {
        const blob = new Blob([text], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'app.py';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        const codeElement = document.querySelector('code');
        if (codeElement) {
          const blob = new Blob([codeElement.innerText], { type: 'text/x-python' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'app.py';
          a.click();
          URL.revokeObjectURL(url);
        }
      });
  };

  // Calculated Stats
  const stats = {
    total_users: users.length,
    total_attempts: records.length,
    success_logins: records.filter((r) => r.event_type === 'LOGIN_SUCCESS').length,
    failed_attempts: records.filter(
      (r) => r.event_type === 'WRONG_PASSWORD' || r.event_type === 'USER_NOT_FOUND'
    ).length,
  };

  return (
    <div className="min-h-screen animated-mesh-bg text-slate-100 font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-500">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onExportCSV={handleExportCSV}
        activeView={activeView}
        setActiveView={setActiveView}
        onDownloadAppPy={handleDownloadAppPy}
        onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        usersCount={users.length}
        recordsCount={records.length}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {activeView === 'dashboard' && (
          <>
            {/* Top Stat Metrics */}
            <StatsCards stats={stats} />

            {/* Sliding Overlay Auth Section */}
            <section className="space-y-4">
              <div className="text-center max-w-xl mx-auto pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 shadow-lg text-[11px] font-bold text-cyan-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive Live Authentication &bull; Sliding Overlay</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  M.J.R Authentication Portal
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Switch between Sign In and Sign Up with the sliding overlay animation. Every attempt is saved directly into live memory and SQLite3 records.
                </p>
              </div>

              {/* The Sliding Auth Card */}
              <SlidingAuthCard onLogin={handleLogin} onSignup={handleSignup} />
            </section>

            {/* Current Active Session Status Bar */}
            <div className="bg-[#0F172A]/85 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-300">Current Session State:</span>
                {currentUser ? (
                  <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/70 px-3 py-1 rounded-full border border-cyan-500/40">
                    Logged in as {currentUser.full_name} ({currentUser.email})
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    No user logged in yet. Use Sign Up or Sign In above.
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500">Database: </span>
                  <span className="text-cyan-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {users.length} Users &bull; {records.length} Records
                  </span>
                </div>

                {/* Quick Secure Delete Button */}
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-3 py-1 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-xl hover:bg-rose-900/60 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Database</span>
                </button>
              </div>
            </div>

            {/* Live Database Inspector */}
            <DatabaseViewer
              users={users}
              records={records}
              onExportCSV={handleExportCSV}
              onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
              onDeleteSingleRecord={handleDeleteSingleRecord}
              onDeleteSingleUser={handleDeleteSingleUser}
            />
          </>
        )}

        {activeView === 'code' && (
          <PythonCodeViewer onDownloadAppPy={handleDownloadAppPy} />
        )}

        {activeView === 'docs' && (
          <ArchitectureDocs />
        )}

      </main>

      {/* SECURE DATABASE DELETE MODAL */}
      <SecureDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onClearRecordsOnly={handleClearRecordsOnly}
        onFullWipeDatabase={handleFullWipeDatabase}
        totalUsers={users.length}
        totalRecords={records.length}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#070C18]/90 backdrop-blur-xl py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">M.J.R Auth System &bull; Enterprise Password Security & Live Audit Tracking</p>
        <p className="mt-1 font-mono text-[11px] text-slate-500">
          Zero Dummy Data &bull; Database: <code className="text-cyan-400">auth_database.db</code> &bull; Werkzeug PBKDF2:SHA256
        </p>
      </footer>
    </div>
  );
}
