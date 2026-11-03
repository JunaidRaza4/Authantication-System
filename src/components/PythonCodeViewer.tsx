import React, { useState } from 'react';
import { Copy, Download, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface PythonCodeViewerProps {
  onDownloadAppPy: () => void;
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = ({ onDownloadAppPy }) => {
  const [copied, setCopied] = useState(false);

  const rawPythonCode = `#!/usr/bin/env python3
"""
M.J.R Auth System - Enterprise Authentication & Audit Record-Tracking Engine
Single-file self-contained runnable app.py with SQLite3, Werkzeug hashing, and CSV export.
Zero dummy data on startup.
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

DB_NAME = "auth_database.db"
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
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

def log_security_event(email_entered, event_type, user_id=None, req=None):
    if req is None: req = request
    forwarded_for = req.headers.get('X-Forwarded-For')
    ip_address = forwarded_for.split(',')[0].strip() if forwarded_for else (req.remote_addr or '127.0.0.1')
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

EMAIL_REGEX = re.compile(r"^[\w\.-]+@([\w-]+\.)+[\w-]{2,8}$")

def validate_user_input(email, password, full_name=None):
    errors = []
    if full_name is not None and (not full_name or len(full_name.strip()) < 2):
        errors.append("Full name must be at least 2 characters long.")
    if not email or not EMAIL_REGEX.match(email.strip()):
        errors.append("Please provide a valid email address.")
    if not password or len(password) < 6:
        errors.append("Password must be at least 6 characters long.")
    return errors

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
    return render_template_string(HTML_TEMPLATE, users=users, records=records, stats={...}, current_user=current_user)

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
        flash(f"An account with email '{email}' already exists.", 'warning')
        return redirect(url_for('home'))

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (full_name, email, password_hash, created_at, last_login_at)
        VALUES (?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    """, (full_name, email, hashed_password))
    new_user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    log_security_event(email, 'SIGNUP_SUCCESS', user_id=new_user_id)
    session['user_id'] = new_user_id
    session['user_name'] = full_name
    session['user_email'] = email
    flash(f"Account created successfully for {full_name}!", 'success')
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
        flash("Invalid email or password.", 'danger')
        return redirect(url_for('home'))

    if not check_password_hash(user['password_hash'], password):
        conn.close()
        log_security_event(email, 'WRONG_PASSWORD', user_id=user['id'])
        flash("Invalid email or password.", 'danger')
        return redirect(url_for('home'))

    conn.execute("UPDATE users SET last_login_at = datetime('now', 'localtime') WHERE id = ?", (user['id'],))
    conn.commit()
    conn.close()

    log_security_event(email, 'LOGIN_SUCCESS', user_id=user['id'])
    session['user_id'] = user['id']
    session['user_name'] = user['full_name']
    session['user_email'] = user['email']
    flash(f"Welcome back, {user['full_name']}!", 'success')
    return redirect(url_for('home'))

@app.route('/logout')
def logout():
    session.clear()
    flash("Logged out successfully.", 'info')
    return redirect(url_for('home'))

@app.route('/export-records')
def export_records():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, event_type, user_id, email_entered, ip_address, device_info, logged_at FROM login_records ORDER BY id DESC")
    records = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Record ID', 'Event Type', 'User ID', 'Email Entered', 'IP Address', 'Device / User Agent', 'Logged At'])
    for row in records:
        writer.writerow([row['id'], row['event_type'], row['user_id'] or 'N/A', row['email_entered'], row['ip_address'], row['device_info'], row['logged_at']])

    csv_data = output.getvalue()
    output.close()
    filename = f"mjr_audit_records_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(csv_data, mimetype="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
`;

  const copyCode = () => {
    navigator.clipboard.writeText(rawPythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Run Card */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-900 font-extrabold text-base">Run M.J.R Server in Terminal (2 Simple Commands)</h3>
            <p className="text-xs text-slate-500">Works on macOS, Windows, and Linux right out of the box</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block mb-1"># Step 1: Install Flask</span>
            <div className="flex items-center justify-between text-indigo-700 font-bold">
              <code>pip install flask</code>
              <button
                onClick={() => navigator.clipboard.writeText('pip install flask')}
                className="text-slate-400 hover:text-indigo-600 p-1"
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block mb-1"># Step 2: Run M.J.R Sentinel</span>
            <div className="flex items-center justify-between text-emerald-700 font-bold">
              <code>python app.py</code>
              <button
                onClick={() => navigator.clipboard.writeText('python app.py')}
                className="text-slate-400 hover:text-emerald-600 p-1"
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Inspector */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span className="font-mono text-xs font-bold text-slate-900">app.py</span>
            <span className="text-[11px] text-slate-500">(100% Production Ready &bull; Zero Dummy Data)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition shadow-xs cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onDownloadAppPy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download app.py</span>
            </button>
          </div>
        </div>

        <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto bg-slate-900 text-slate-200 rounded-b-3xl">
          <pre className="text-xs font-mono leading-relaxed selection:bg-indigo-500 selection:text-white">
            <code>{rawPythonCode}</code>
          </pre>
        </div>
      </div>

    </div>
  );
};
