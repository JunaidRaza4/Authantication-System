import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateUserInput } from '../utils/cryptoSim';

interface AuthTabsProps {
  onLogin: (email: string, pass: string) => { success: boolean; message: string };
  onSignup: (name: string, email: string, pass: string) => { success: boolean; message: string };
}

export const AuthTabs: React.FC<AuthTabsProps> = ({ onLogin, onSignup }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateUserInput(loginEmail, loginPassword);
    if (errors.length > 0) {
      setFeedback({ type: 'error', text: errors[0] });
      return;
    }

    const res = onLogin(loginEmail, loginPassword);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setLoginPassword('');
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateUserInput(signupEmail, signupPassword, signupName);
    if (errors.length > 0) {
      setFeedback({ type: 'error', text: errors[0] });
      return;
    }

    const res = onSignup(signupName, signupEmail, signupPassword);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setActiveTab('login');
    } else {
      setFeedback({ type: 'warning', text: res.message });
    }
  };

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Tabs Header */}
      <div className="flex p-1 bg-[#070C18] rounded-xl mb-6 border border-slate-800">
        <button
          type="button"
          onClick={() => { setActiveTab('login'); setFeedback(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'login'
              ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Log In</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('signup'); setFeedback(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'signup'
              ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Sign Up</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs mb-5 flex items-start gap-2.5 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
              : feedback.type === 'error'
              ? 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
              : 'bg-amber-950/70 border border-amber-500/40 text-amber-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* LOGIN FORM */}
      {activeTab === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-[#070C18] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <span className="text-[11px] text-slate-500 font-mono">min. 6 chars</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showLoginPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070C18] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 p-1"
                aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-lg shadow-cyan-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Secure Log In</span>
          </button>

          <div className="p-3 bg-[#070C18] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-medium">Automatic Audit Trigger:</div>
            <div className="font-mono text-[10px] space-y-0.5">
              <div>&bull; Correct Pass &rarr; <span className="text-emerald-400">LOGIN_SUCCESS</span></div>
              <div>&bull; Wrong Pass &rarr; <span className="text-rose-400">WRONG_PASSWORD</span></div>
              <div>&bull; Unknown Email &rarr; <span className="text-amber-400">USER_NOT_FOUND</span></div>
            </div>
          </div>
        </form>
      ) : (
        /* SIGN UP FORM */
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Muhammad Tariq"
                className="w-full bg-[#070C18] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="tariq@enterprise.com"
                className="w-full bg-[#070C18] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <span className="text-[11px] text-slate-500 font-mono">min. 6 chars</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showSignupPassword ? 'text' : 'password'}
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070C18] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
                className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 p-1"
                aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
              >
                {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account & Hash Password</span>
          </button>

          <p className="text-center text-[11px] text-slate-400 pt-1">
            Hashes password via <code className="text-cyan-400 font-mono text-[10px]">werkzeug.security</code> with random cryptographic salt.
          </p>
        </form>
      )}
    </div>
  );
};
