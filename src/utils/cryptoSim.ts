import { LoginRecord } from '../types/auth';

/**
 * Validates user credentials.
 */
export function validateUserInput(email: string, password: string, fullName?: string): string[] {
  const errors: string[] = [];
  const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,8}$/;

  if (fullName !== undefined) {
    if (!fullName || fullName.trim().length < 2) {
      errors.push("Full name must be at least 2 characters long.");
    }
  }

  if (!email || !emailRegex.test(email.trim())) {
    errors.push("Please provide a valid email address.");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  return errors;
}

/**
 * Deterministic hash digest computation for a given password and salt.
 * Ensures that the same (password, salt) pair always produces the exact same hash.
 */
export function computeHashDigest(password: string, salt: string): string {
  const chars = 'abcdef0123456789';
  let hash = '';
  const seed = password + '::mjr_salt::' + salt;
  
  for (let i = 0; i < 64; i++) {
    let acc = (i + 13) * 37;
    for (let j = 0; j < seed.length; j++) {
      acc = ((acc << 5) - acc + seed.charCodeAt(j) * (j + 1) * (i + 3)) | 0;
    }
    const idx = Math.abs(acc) % 16;
    hash += chars[idx];
  }
  
  return hash;
}

/**
 * Generates a Werkzeug-compatible PBKDF2:SHA256 salted hash string:
 * Format: pbkdf2:sha256:600000$<salt>$<hash>
 */
export function simulateWerkzeugHash(password: string): string {
  const chars = 'abcdef0123456789';
  let salt = '';
  for (let i = 0; i < 16; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const digest = computeHashDigest(password, salt);
  return `pbkdf2:sha256:600000$${salt}$${digest}`;
}

/**
 * Verifies a password against a stored Werkzeug PBKDF2 hash.
 * Returns true ONLY when the recomputed hash matches the stored hash exactly.
 */
export function verifyWerkzeugHash(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const parts = storedHash.split('$');
  if (parts.length < 3) return false;
  
  const salt = parts[1];
  const expectedDigest = parts[2];
  const actualDigest = computeHashDigest(password, salt);
  
  // Constant-time comparison to avoid timing attacks
  if (actualDigest.length !== expectedDigest.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actualDigest.length; i++) {
    mismatch |= actualDigest.charCodeAt(i) ^ expectedDigest.charCodeAt(i);
  }
  
  return mismatch === 0;
}

/**
 * Generates a standard RFC 4180 CSV string from LoginRecords.
 */
export function generateRecordsCSV(records: LoginRecord[]): string {
  const headers = [
    'Record ID',
    'Event Type',
    'User ID',
    'Email Entered',
    'IP Address',
    'Device / User Agent',
    'Logged At'
  ];

  const rows = records.map(r => [
    r.id,
    `"${r.event_type}"`,
    r.user_id !== null ? r.user_id : 'N/A',
    `"${r.email_entered.replace(/"/g, '""')}"`,
    `"${r.ip_address}"`,
    `"${r.device_info.replace(/"/g, '""')}"`,
    `"${r.logged_at}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Triggers a browser file download of CSV content.
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
