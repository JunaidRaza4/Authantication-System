#!/usr/bin/env python3
"""
=============================================================================
M.J.R Auth System - Enterprise Authentication & Audit Record-Tracking Engine
=============================================================================
Architecture:
- Branding: M.J.R Auth System
- Backend: Python Flask with render_template_string (Single-File Self-Contained)
- Database: Built-in SQLite3 with persistent disk storage (auth_database.db)
  Starts with ZERO dummy data. Every live registration and login is saved directly to disk.
- Security: Werkzeug Cryptographic Password Hashing (PBKDF2/SHA256), Session Auth,
  Input Validation, SQL Injection Immunity (Parameterized Queries)
- Secure Deletion: Wipe database, purge audit records, delete individual rows.
- CSV Export: Streamed RFC 4180 CSV file download of all security audit records
- UI Design: Eye-catching obsidian & cyber dark theme featuring animated background
  ambient transition and the iconic sliding overlay Sign In / Sign Up container!

To run:
    pip install flask
    python app.py
"""

import os
import csv
import io
import re
import sqlite3
import secrets
from datetime import datetime
from flask import (
    Flask, request, session, redirect, url_for, flash,
    render_template_string, Response, jsonify
)
from werkzeug.security import generate_password_hash, check_password_hash

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
DB_NAME = "auth_database.db"
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# -----------------------------------------------------------------------------
# Database Layer (Modular SQLite3 Helper Functions - Zero Mock Data)
# -----------------------------------------------------------------------------
def get_db_connection():
    """Returns a connection to the SQLite database with Row factory enabled."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initializes tables on startup if they do not already exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            plain_password_demo TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login_at TIMESTAMP
        )
    """)

    # 2. Login Records Table (Tracks every single interaction)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            email_entered TEXT NOT NULL,
            event_type TEXT NOT NULL,
            ip_address TEXT,
            device_info TEXT,
            logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_event ON login_records(event_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_time ON login_records(logged_at DESC)")

    conn.commit()
    conn.close()

# -----------------------------------------------------------------------------
# Audit Logging Helper
# -----------------------------------------------------------------------------
def log_security_event(email_entered, event_type, user_id=None, req=None):
    """Persistently logs security events to login_records table."""
    if req is None:
        req = request

    forwarded_for = req.headers.get('X-Forwarded-For')
    if forwarded_for:
        ip_address = forwarded_for.split(',')[0].strip()
    else:
        ip_address = req.remote_addr or '127.0.0.1'

    user_agent = req.headers.get('User-Agent', 'Unknown Device')
    user_agent = (user_agent[:250] + '...') if len(user_agent) > 250 else user_agent

    try:
        conn = get_db_connection()
        conn.execute("""
            INSERT INTO login_records (user_id, email_entered, event_type, ip_address, device_info, logged_at)
            VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
        """, (user_id, email_entered.strip().lower(), event_type, ip_address, user_agent))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[SECURITY LOGGING ERROR]: {e}")

# -----------------------------------------------------------------------------
# Validation Helpers
# -----------------------------------------------------------------------------
EMAIL_REGEX = re.compile(r"^[\w\.-]+@([\w-]+\.)+[\w-]{2,8}$")

def validate_user_input(email, password, full_name=None):
    errors = []
    if full_name is not None:
        if not full_name or len(full_name.strip()) < 2:
            errors.append("Full name must be at least 2 characters long.")
    if not email or not EMAIL_REGEX.match(email.strip()):
        errors.append("Please provide a valid email address.")
    if not password or len(password) < 6:
        errors.append("Password must be at least 6 characters long.")
    return errors

# -----------------------------------------------------------------------------
# Embedded HTML Template (Rich Obsidian Cyber Dark Theme & Sliding Overlay)
# -----------------------------------------------------------------------------
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>M.J.R Auth System - Enterprise Authentication & Audit</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animated-mesh-bg {
            background-color: #0A0F1D;
            background-image: 
                radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.18) 0px, transparent 45%),
                radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.18) 0px, transparent 45%),
                radial-gradient(at 50% 100%, rgba(139, 92, 246, 0.14) 0px, transparent 50%),
                linear-gradient(-45deg, #0A0F1D, #0D1527, #0B1220, #0F172A);
            background-size: 200% 200%;
            animation: gradientShift 18s ease infinite;
        }
        .sliding-overlay {
            transition: transform 0.65s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .slide-right { transform: translateX(100%); }
        .slide-left { transform: translateX(0%); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0A0F1D; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #06B6D4; }
    </style>
</head>
<body class="animated-mesh-bg min-h-screen text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black">

    <!-- Header -->
    <header class="border-b border-slate-800/80 bg-[#0B1220]/85 backdrop-blur-xl sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 p-[2px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <div class="w-full h-full bg-[#0A0F1D] rounded-[14px] flex items-center justify-center flex-col">
                        <span class="text-[11px] font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            MJR
                        </span>
                        <div class="w-3 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 mt-0.5"></div>
                    </div>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-base sm:text-lg font-black tracking-tight text-white">
                            M.J.R <span class="text-cyan-400 font-extrabold">Auth System</span>
                        </span>
                        <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
                            SECURE LIVE
                        </span>
                    </div>
                    <p class="text-[11px] text-slate-400 hidden sm:block font-medium">Enterprise Identity & Audit Tracking &bull; Zero Mock Data</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3">
                <form action="/wipe-database" method="POST" onsubmit="return confirm('WARNING: Are you sure you want to permanently wipe the entire database?');">
                    <button type="submit" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-xl hover:bg-rose-900/60 transition shadow-sm cursor-pointer">
                        <svg class="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        <span class="hidden sm:inline">Delete DB</span>
                    </button>
                </form>

                <a href="/export-records" class="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-xl hover:bg-cyan-900/60 transition shadow-xs">
                    <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    <span>Export CSV</span>
                </a>

                {% if current_user %}
                <div class="flex items-center gap-2 pl-3 border-l border-slate-800">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-slate-950">
                        {{ current_user.full_name[0] | upper }}
                    </div>
                    <div class="hidden md:block text-left text-xs">
                        <div class="font-bold text-white">{{ current_user.full_name }}</div>
                        <div class="text-slate-400 text-[10px]">{{ current_user.email }}</div>
                    </div>
                    <a href="/logout" class="ml-2 text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 bg-rose-950/60 border border-rose-900/60 rounded-lg font-semibold transition">
                        Logout
                    </a>
                </div>
                {% else %}
                <span class="text-xs px-2.5 py-1 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 font-medium">
                    Guest Mode
                </span>
                {% endif %}
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                <div class="space-y-2">
                    {% for category, message in messages %}
                        <div class="p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-lg transition-all
                            {% if category == 'success' %} bg-emerald-950/80 border border-emerald-500/50 text-emerald-300
                            {% elif category == 'danger' or category == 'error' %} bg-rose-950/80 border border-rose-500/50 text-rose-300
                            {% elif category == 'warning' %} bg-amber-950/80 border border-amber-500/50 text-amber-300
                            {% else %} bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 {% endif %}">
                            <span>{{ message }}</span>
                        </div>
                    {% endfor %}
                </div>
            {% endif %}
        {% endwith %}

        <!-- Metrics Dashboard -->
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-cyan-500/50 transition">
                <span class="text-[11px] uppercase font-bold tracking-wider text-slate-400">Live Users</span>
                <div class="text-3xl font-extrabold text-white font-mono tracking-tight mt-1">{{ stats.total_users }}</div>
                <div class="text-[11px] text-cyan-400 font-medium mt-1">users table records</div>
            </div>

            <div class="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-indigo-500/50 transition">
                <span class="text-[11px] uppercase font-bold tracking-wider text-slate-400">Total Attempts</span>
                <div class="text-3xl font-extrabold text-white font-mono tracking-tight mt-1">{{ stats.total_attempts }}</div>
                <div class="text-[11px] text-indigo-400 font-medium mt-1">login_records logged</div>
            </div>

            <div class="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-emerald-500/50 transition">
                <span class="text-[11px] uppercase font-bold tracking-wider text-slate-400">Successful Logins</span>
                <div class="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight mt-1">{{ stats.success_logins }}</div>
                <div class="text-[11px] text-emerald-400 font-medium mt-1">LOGIN_SUCCESS</div>
            </div>

            <div class="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-rose-500/50 transition">
                <span class="text-[11px] uppercase font-bold tracking-wider text-slate-400">Failed / Blocked</span>
                <div class="text-3xl font-extrabold text-rose-400 font-mono tracking-tight mt-1">{{ stats.failed_attempts }}</div>
                <div class="text-[11px] text-rose-400 font-medium mt-1">WRONG_PASS / UNKNOWN</div>
            </div>
        </section>

        <!-- SLIDING OVERLAY AUTH CONTAINER -->
        <section class="w-full max-w-4xl mx-auto my-4">
            <div class="relative bg-[#0F172A]/90 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden min-h-[520px]">
                
                <div class="md:hidden p-3 bg-slate-900 border-b border-slate-800 flex">
                    <button type="button" id="mobile-signin-btn" onclick="setSlideMode(false)" class="flex-1 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm">
                        Sign In
                    </button>
                    <button type="button" id="mobile-signup-btn" onclick="setSlideMode(true)" class="flex-1 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200">
                        Sign Up
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 h-full text-slate-100">

                    <!-- SIGN IN FORM (Left Column) -->
                    <div id="signin-col" class="p-8 sm:p-10 flex flex-col justify-center">
                        <div class="mb-6">
                            <span class="inline-block px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 text-[11px] font-semibold mb-2">
                                M.J.R Secure Portal
                            </span>
                            <h2 class="text-2xl font-black text-white tracking-tight">Sign In to Account</h2>
                            <p class="text-xs text-slate-400 mt-1">Enter your registered email & password</p>
                        </div>

                        <form action="/login" method="POST" class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                                <input type="email" name="email" required placeholder="user@company.com"
                                    class="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                                <input type="password" name="password" required placeholder="••••••••"
                                    class="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition">
                            </div>

                            <button type="submit"
                                class="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 shadow-lg shadow-cyan-500/25 transition cursor-pointer">
                                Sign In Securely
                            </button>
                        </form>
                    </div>

                    <!-- SIGN UP FORM (Right Column) -->
                    <div id="signup-col" class="p-8 sm:p-10 flex flex-col justify-center">
                        <div class="mb-6">
                            <span class="inline-block px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/80 text-indigo-400 text-[11px] font-semibold mb-2">
                                New Registration
                            </span>
                            <h2 class="text-2xl font-black text-white tracking-tight">Create Account</h2>
                            <p class="text-xs text-slate-400 mt-1">Join M.J.R Auth System with salted PBKDF2 hashing</p>
                        </div>

                        <form action="/signup" method="POST" class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                                <input type="text" name="full_name" required placeholder="Muhammad Raza"
                                    class="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                                <input type="email" name="email" required placeholder="raza@company.com"
                                    class="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                                <input type="password" name="password" required placeholder="••••••••" minlength="6"
                                    class="w-full bg-[#0A0F1D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition">
                            </div>

                            <button type="submit"
                                class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 transition cursor-pointer">
                                Create M.J.R Account
                            </button>
                        </form>
                    </div>

                </div>

                <!-- SLIDING OVERLAY PANEL (DESKTOP) -->
                <div id="sliding-overlay-panel"
                    class="hidden md:block absolute top-0 bottom-0 w-1/2 sliding-overlay slide-right z-20 pointer-events-auto">
                    <div class="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 text-white p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl border-l border-cyan-500/30">
                        
                        <div class="relative z-10 flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center font-black text-xs text-cyan-300">
                                MJR
                            </div>
                            <span class="font-bold text-sm tracking-tight text-white">M.J.R Auth System</span>
                        </div>

                        <div id="overlay-content" class="relative z-10 space-y-4 my-auto">
                            <!-- Dynamic Content -->
                        </div>

                        <div class="relative z-10 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-4">
                            <span>Zero Dummy Data &bull; Live DB</span>
                            <span class="font-mono text-[10px] text-cyan-400">auth_database.db</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>

        <!-- LIVE DATABASE VIEWER SECTION -->
        <section class="space-y-4 pt-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <h2 class="text-xl font-black text-white tracking-tight">Live Database Inspector (SQLite3)</h2>
                    <p class="text-xs text-slate-400 font-mono">auth_database.db &bull; All interactions saved permanently</p>
                </div>

                <div class="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                    <button type="button" id="tab-records-btn" onclick="switchDbTable('records')"
                        class="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md transition">
                        login_records ({{ records | length }})
                    </button>
                    <button type="button" id="tab-users-btn" onclick="switchDbTable('users')"
                        class="px-4 py-1.5 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition">
                        users ({{ users | length }})
                    </button>
                </div>
            </div>

            <!-- TABLE 1: login_records table -->
            <div id="table-records-container" class="bg-[#0F172A]/85 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs font-mono">
                        <thead class="bg-[#0A0F1D] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                            <tr>
                                <th class="py-3 px-4 font-bold">#ID</th>
                                <th class="py-3 px-4 font-bold">Event Status</th>
                                <th class="py-3 px-4 font-bold">User ID</th>
                                <th class="py-3 px-4 font-bold">Email Entered</th>
                                <th class="py-3 px-4 font-bold">IP Address</th>
                                <th class="py-3 px-4 font-bold">Device / Browser Info</th>
                                <th class="py-3 px-4 font-bold whitespace-nowrap">Logged At</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60">
                            {% if records %}
                                {% for r in records %}
                                <tr class="hover:bg-slate-800/40 transition-colors">
                                    <td class="py-3 px-4 text-slate-500 font-semibold">#{% print(r['id']) %}</td>
                                    <td class="py-3 px-4">
                                        {% if r['event_type'] == 'LOGIN_SUCCESS' %}
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40">LOGIN_SUCCESS</span>
                                        {% elif r['event_type'] == 'SIGNUP_SUCCESS' %}
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/70 text-cyan-400 border border-cyan-500/40">SIGNUP_SUCCESS</span>
                                        {% elif r['event_type'] == 'WRONG_PASSWORD' %}
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/70 text-rose-400 border border-rose-500/40">WRONG_PASSWORD</span>
                                        {% elif r['event_type'] == 'USER_NOT_FOUND' %}
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/70 text-amber-400 border border-amber-500/40">USER_NOT_FOUND</span>
                                        {% endif %}
                                    </td>
                                    <td class="py-3 px-4">
                                        {% if r['user_id'] %}
                                        <span class="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/80">UID: {% print(r['user_id']) %}</span>
                                        {% else %}
                                        <span class="text-slate-600 italic">NULL</span>
                                        {% endif %}
                                    </td>
                                    <td class="py-3 px-4 font-semibold text-white">{% print(r['email_entered']) %}</td>
                                    <td class="py-3 px-4 text-cyan-300">{% print(r['ip_address'] or '127.0.0.1') %}</td>
                                    <td class="py-3 px-4 text-slate-400 truncate max-w-xs">{% print(r['device_info'] or 'Unknown') %}</td>
                                    <td class="py-3 px-4 text-slate-400 whitespace-nowrap">{% print(r['logged_at']) %}</td>
                                </tr>
                                {% endfor %}
                            {% else %}
                                <tr>
                                    <td colspan="7" class="py-16 text-center text-slate-500">
                                        <p class="font-bold text-slate-300 text-sm">No Activity Logs Found</p>
                                        <p class="text-xs text-slate-500 mt-1">Zero dummy data present. Use Sign In or Sign Up above to record your first live interaction!</p>
                                    </td>
                                </tr>
                            {% endif %}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TABLE 2: users table -->
            <div id="table-users-container" class="bg-[#0F172A]/85 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs font-mono">
                        <thead class="bg-[#0A0F1D] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                            <tr>
                                <th class="py-3 px-4 font-bold">ID</th>
                                <th class="py-3 px-4 font-bold">Full Name</th>
                                <th class="py-3 px-4 font-bold">Email</th>
                                <th class="py-3 px-4 font-bold">Salted Password Hash (Werkzeug PBKDF2)</th>
                                <th class="py-3 px-4 font-bold">Created At</th>
                                <th class="py-3 px-4 font-bold">Last Login</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60">
                            {% if users %}
                                {% for u in users %}
                                <tr class="hover:bg-slate-800/40 transition-colors">
                                    <td class="py-3 px-4 text-cyan-400 font-bold">#{% print(u['id']) %}</td>
                                    <td class="py-3 px-4 font-sans font-bold text-white">{% print(u['full_name']) %}</td>
                                    <td class="py-3 px-4 text-cyan-300 font-semibold">{% print(u['email']) %}</td>
                                    <td class="py-3 px-4"><code class="px-2 py-0.5 rounded-lg bg-[#0A0F1D] text-slate-300 border border-slate-800 text-[10px]">{% print(u['password_hash']) %}</code></td>
                                    <td class="py-3 px-4 text-slate-400 whitespace-nowrap">{% print(u['created_at']) %}</td>
                                    <td class="py-3 px-4 text-slate-400 whitespace-nowrap">
                                        {% if u['last_login_at'] %}
                                        <span class="text-emerald-400 font-semibold">{% print(u['last_login_at']) %}</span>
                                        {% else %}
                                        <span class="text-slate-600 italic">Never</span>
                                        {% endif %}
                                    </td>
                                </tr>
                                {% endfor %}
                            {% else %}
                                <tr>
                                    <td colspan="6" class="py-16 text-center text-slate-500">
                                        <p class="font-bold text-slate-300 text-sm">No Users in Database</p>
                                        <p class="text-xs text-slate-500 mt-1">Zero dummy users. Create an account via the Sign Up form above to save live credentials.</p>
                                    </td>
                                </tr>
                            {% endif %}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

    </main>

    <footer class="mt-16 border-t border-slate-800 bg-[#070C18]/90 py-6 text-center text-xs text-slate-500">
        <p class="font-semibold text-slate-400">M.J.R Auth System &bull; Enterprise Password Security & Live Audit Tracking</p>
        <p class="mt-1 font-mono text-[11px] text-slate-500">
            Zero Dummy Data &bull; Database: <code class="text-cyan-400">auth_database.db</code> &bull; Werkzeug PBKDF2:SHA256
        </p>
    </footer>

    <script>
        let isSignUp = false;

        function renderOverlayContent() {
            const container = document.getElementById('overlay-content');
            if (!container) return;

            if (!isSignUp) {
                container.innerHTML = `
                    <div class="space-y-3">
                        <h3 class="text-3xl font-extrabold tracking-tight leading-tight text-white">Hello, Friend!</h3>
                        <p class="text-xs text-slate-300 leading-relaxed max-w-sm">
                            Enter your details to register a new user in M.J.R Auth System. Zero dummy data is kept on startup.
                        </p>
                        <div class="pt-2">
                            <button type="button" onclick="setSlideMode(true)"
                                class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-cyan-300 border-2 border-cyan-400/80 hover:bg-cyan-400 hover:text-slate-950 transition-all duration-300 shadow-lg cursor-pointer">
                                <span>Sign Up Here &rarr;</span>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="space-y-3">
                        <h3 class="text-3xl font-extrabold tracking-tight leading-tight text-white">Welcome Back!</h3>
                        <p class="text-xs text-slate-300 leading-relaxed max-w-sm">
                            Already registered? Sign in with your email and password to verify your session and generate audit trails.
                        </p>
                        <div class="pt-2">
                            <button type="button" onclick="setSlideMode(false)"
                                class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-cyan-300 border-2 border-cyan-400/80 hover:bg-cyan-400 hover:text-slate-950 transition-all duration-300 shadow-lg cursor-pointer">
                                <span>&larr; Sign In Here</span>
                            </button>
                        </div>
                    </div>
                `;
            }
        }

        function setSlideMode(signUpState) {
            isSignUp = signUpState;
            const panel = document.getElementById('sliding-overlay-panel');
            const signinCol = document.getElementById('signin-col');
            const signupCol = document.getElementById('signup-col');
            const mobSignIn = document.getElementById('mobile-signin-btn');
            const mobSignUp = document.getElementById('mobile-signup-btn');

            if (panel) {
                if (isSignUp) {
                    panel.classList.remove('slide-right');
                    panel.classList.add('slide-left');
                } else {
                    panel.classList.remove('slide-left');
                    panel.classList.add('slide-right');
                }
            }

            if (mobSignIn && mobSignUp) {
                if (isSignUp) {
                    mobSignUp.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm";
                    mobSignIn.className = "flex-1 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200";
                    signinCol.classList.add('hidden');
                    signupCol.classList.remove('hidden');
                } else {
                    mobSignIn.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm";
                    mobSignUp.className = "flex-1 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200";
                    signupCol.classList.add('hidden');
                    signinCol.classList.remove('hidden');
                }
            }

            renderOverlayContent();
        }

        function switchDbTable(table) {
            const recordsBtn = document.getElementById('tab-records-btn');
            const usersBtn = document.getElementById('tab-users-btn');
            const recordsContainer = document.getElementById('table-records-container');
            const usersContainer = document.getElementById('table-users-container');

            if (table === 'records') {
                recordsBtn.className = "px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md transition";
                usersBtn.className = "px-4 py-1.5 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition";
                recordsContainer.classList.remove('hidden');
                usersContainer.classList.add('hidden');
            } else {
                usersBtn.className = "px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md transition";
                recordsBtn.className = "px-4 py-1.5 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition";
                usersContainer.classList.remove('hidden');
                recordsContainer.classList.add('hidden');
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderOverlayContent();
        });
    </script>
</body>
</html>
"""

# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------
@app.route('/')
def home():
    conn = get_db_connection()
    users = conn.execute("SELECT * FROM users ORDER BY id DESC").fetchall()
    records = conn.execute("SELECT * FROM login_records ORDER BY id DESC LIMIT 100").fetchall()
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_attempts = conn.execute("SELECT COUNT(*) FROM login_records").fetchone()[0]
    success_logins = conn.execute("SELECT COUNT(*) FROM login_records WHERE event_type = 'LOGIN_SUCCESS'").fetchone()[0]
    failed_attempts = conn.execute("SELECT COUNT(*) FROM login_records WHERE event_type IN ('WRONG_PASSWORD', 'USER_NOT_FOUND')").fetchone()[0]
    current_user = None
    if 'user_id' in session:
        current_user = conn.execute("SELECT id, full_name, email FROM users WHERE id = ?", (session['user_id'],)).fetchone()
    conn.close()

    stats = {
        'total_users': total_users,
        'total_attempts': total_attempts,
        'success_logins': success_logins,
        'failed_attempts': failed_attempts
    }
    return render_template_string(HTML_TEMPLATE, users=users, records=records, stats=stats, current_user=current_user)

@app.route('/signup', methods=['POST'])
def signup():
    full_name = request.form.get('full_name', '').strip()
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    errors = validate_user_input(email, password, full_name)
    if errors:
        for err in errors: flash(err, 'danger')
        return redirect(url_for('home'))

    conn = get_db_connection()
    if conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone():
        conn.close()
        flash(f"An account with email '{email}' already exists in M.J.R system.", 'warning')
        return redirect(url_for('home'))

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (full_name, email, password_hash, plain_password_demo, created_at, last_login_at)
            VALUES (?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
        """, (full_name, email, hashed_password, f"demo:{password[:3]}***"))
        new_user_id = cursor.lastrowid
        conn.commit()
        conn.close()

        log_security_event(email, 'SIGNUP_SUCCESS', user_id=new_user_id)
        session['user_id'] = new_user_id
        session['user_name'] = full_name
        session['user_email'] = email
        flash(f"Account created successfully for {full_name}! Password salted and hashed.", 'success')
    except Exception as e:
        flash(f"Database error during registration: {str(e)}", 'danger')

    return redirect(url_for('home'))

@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    errors = validate_user_input(email, password)
    if errors:
        for err in errors: flash(err, 'danger')
        return redirect(url_for('home'))

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if not user:
        conn.close()
        log_security_event(email, 'USER_NOT_FOUND', user_id=None)
        flash("Invalid email or password. Please check credentials.", 'danger')
        return redirect(url_for('home'))

    # Strict Werkzeug hash verification
    if not check_password_hash(user['password_hash'], password):
        conn.close()
        log_security_event(email, 'WRONG_PASSWORD', user_id=user['id'])
        flash("Invalid email or password! Credentials do not match.", 'danger')
        return redirect(url_for('home'))

    conn.execute("UPDATE users SET last_login_at = datetime('now', 'localtime') WHERE id = ?", (user['id'],))
    conn.commit()
    conn.close()

    log_security_event(email, 'LOGIN_SUCCESS', user_id=user['id'])
    session['user_id'] = user['id']
    session['user_name'] = user['full_name']
    session['user_email'] = user['email']

    flash(f"Welcome back, {user['full_name']}! Authenticated successfully.", 'success')
    return redirect(url_for('home'))

@app.route('/logout')
def logout():
    user_name = session.get('user_name', 'User')
    session.clear()
    flash(f"Logged out successfully. Goodbye, {user_name}!", 'info')
    return redirect(url_for('home'))

# -----------------------------------------------------------------------------
# Secure Database Wipe / Delete Routes
# -----------------------------------------------------------------------------
@app.route('/wipe-database', methods=['POST'])
def wipe_database():
    """Securely wipes all users and activity records from auth_database.db."""
    conn = get_db_connection()
    conn.execute("DELETE FROM login_records")
    conn.execute("DELETE FROM users")
    conn.commit()
    conn.close()
    session.clear()
    flash("Database wiped successfully! All users and audit logs have been permanently erased.", 'warning')
    return redirect(url_for('home'))

@app.route('/clear-audit-records', methods=['POST'])
def clear_audit_records():
    """Clears all audit logs while keeping users intact."""
    conn = get_db_connection()
    conn.execute("DELETE FROM login_records")
    conn.commit()
    conn.close()
    flash("Audit records purged successfully. Registered users preserved.", 'info')
    return redirect(url_for('home'))

@app.route('/export-records')
def export_records():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.event_type, COALESCE(r.user_id, 'N/A') AS user_id, r.email_entered, r.ip_address, r.device_info, r.logged_at
        FROM login_records r ORDER BY r.id DESC
    """)
    records = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Record ID', 'Event Type', 'User ID', 'Email Entered', 'IP Address', 'Device / User Agent', 'Logged At'])
    for row in records:
        writer.writerow([row['id'], row['event_type'], row['user_id'], row['email_entered'], row['ip_address'], row['device_info'], row['logged_at']])

    csv_data = output.getvalue()
    output.close()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"mjr_audit_records_{timestamp}.csv"
    return Response(csv_data, mimetype="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})

if __name__ == '__main__':
    init_db()
    print("=" * 65)
    print("M.J.R Auth System - Server Running (Obsidian Dark Cyber Theme)")
    print(f"Database: {os.path.abspath(DB_NAME)}")
    print("Open browser at: http://127.0.0.1:5000")
    print("=" * 65)
    app.run(host='0.0.0.0', port=5000, debug=True)
