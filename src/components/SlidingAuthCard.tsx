import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { validateUserInput } from '../utils/cryptoSim';

interface SlidingAuthCardProps {
  onLogin: (email: string, pass: string) => { success: boolean; message: string };
  onSignup: (name: string, email: string, pass: string) => { success: boolean; message: string };
}

export const SlidingAuthCard: React.FC<SlidingAuthCardProps> = ({ onLogin, onSignup }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  // Sign In inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up inputs
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Feedback notification
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
      // Slide over to login panel
      setIsSignUp(false);
    } else {
      setFeedback({ type: 'warning', text: res.message });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4">
      {/* Feedback Alert if any */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs mb-4 flex items-start gap-3 transition-all duration-300 shadow-lg ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
              : feedback.type === 'error'
              ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
              : 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{feedback.text}</span>
        </div>
      )}

      {/* Main Card with Sliding Overlay Architecture */}
      <div className="relative bg-[#0F172A]/90 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden min-h-[520px]">
        
        {/* Mobile View Toggle Bar */}
        <div className="md:hidden p-3 bg-slate-900 border-b border-slate-800 flex">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setFeedback(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              !isSignUp
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setFeedback(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              isSignUp
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* 2-Column Forms Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 h-full text-slate-100">

          {/* SIGN IN FORM (Left Column) */}
          <div className={`p-8 sm:p-10 flex flex-col justify-center transition-all duration-500 ${
            isSignUp ? 'hidden md:flex md:opacity-30 md:pointer-events-none' : 'flex'
          }`}>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 text-[11px] font-semibold mb-2">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>M.J.R Secure Portal</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Sign In to Account</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your verified email & password to access the system</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
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
                    className="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 shadow-lg shadow-cyan-500/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In Securely</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Audit logging active</span>
              </span>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setFeedback(null); }}
                className="text-cyan-400 hover:underline font-semibold md:hidden"
              >
                Create account &rarr;
              </button>
            </div>
          </div>

          {/* SIGN UP FORM (Right Column) */}
          <div className={`p-8 sm:p-10 flex flex-col justify-center transition-all duration-500 ${
            !isSignUp ? 'hidden md:flex md:opacity-30 md:pointer-events-none' : 'flex'
          }`}>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/80 text-indigo-400 text-[11px] font-semibold mb-2">
                <UserPlus className="w-3 h-3 text-indigo-400" />
                <span>New Registration</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-400 mt-1">Join M.J.R Auth System with salted PBKDF2 password security</p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Muhammad Raza"
                    className="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="raza@company.com"
                    className="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Create Password</label>
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
                    className="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5"
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create M.J.R Account</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>Werkzeug salt hashing</span>
              </span>
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setFeedback(null); }}
                className="text-cyan-400 hover:underline font-semibold md:hidden"
              >
                Existing user? Sign In &rarr;
              </button>
            </div>
          </div>

        </div>

        {/* SLIDING OVERLAY PANEL */}
        <div
          className={`hidden md:block absolute top-0 bottom-0 w-1/2 transition-transform duration-700 ease-in-out z-20 pointer-events-auto ${
            isSignUp ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 text-white p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl border-l border-cyan-500/30">
            
            {/* Glowing neon orbs */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Logo Monogram */}
            <div className="relative z-10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center font-black text-xs text-cyan-300">
                MJR
              </div>
              <span className="font-bold text-sm tracking-tight text-white">M.J.R Auth System</span>
            </div>

            {/* Center Dynamic Content */}
            <div className="relative z-10 space-y-4 my-auto">
              {!isSignUp ? (
                <div className="space-y-3 animate-fadeIn">
                  <h3 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
                    Hello, Friend!
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                    Enter your details to begin registration. All credentials are encrypted with salted PBKDF2 cryptography and live record tracking.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(true); setFeedback(null); }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-cyan-300 border-2 border-cyan-400/80 hover:bg-cyan-400 hover:text-slate-950 transition-all duration-300 shadow-lg cursor-pointer"
                    >
                      <span>Sign Up Here</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <h3 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
                    Welcome Back!
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                    To keep connected with your personal audit records and verified credentials, please sign in with your email and password.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(false); setFeedback(null); }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-cyan-300 border-2 border-cyan-400/80 hover:bg-cyan-400 hover:text-slate-950 transition-all duration-300 shadow-lg cursor-pointer"
                    >
                      <span>&larr;</span>
                      <span>Sign In Here</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Security Assurance */}
            <div className="relative z-10 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-4">
              <span>Zero Dummy Data &bull; Live DB</span>
              <span className="font-mono text-[10px] text-cyan-400">auth_database.db</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
