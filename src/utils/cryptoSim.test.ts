import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUserInput, simulateWerkzeugHash, verifyWerkzeugHash, generateRecordsCSV } from './cryptoSim';
import { LoginRecord } from '../types/auth';

test('validateUserInput accepts valid inputs for signup and login', () => {
  const signupErrors = validateUserInput('test@example.com', 'secret123', 'John Doe');
  assert.equal(signupErrors.length, 0);

  const loginErrors = validateUserInput('test@example.com', 'secret123');
  assert.equal(loginErrors.length, 0);
});

test('validateUserInput rejects short passwords and invalid emails', () => {
  const errors = validateUserInput('bad-email', '123', 'A');
  assert.equal(errors.length, 3);
  assert.ok(errors[0].includes('Full name'));
  assert.ok(errors[1].includes('email'));
  assert.ok(errors[2].includes('Password'));
});

test('simulateWerkzeugHash matches pbkdf2 Werkzeug structure', () => {
  const hash = simulateWerkzeugHash('MySecurePass1!');
  assert.ok(hash.startsWith('pbkdf2:sha256:600000$'));
  const parts = hash.split('$');
  assert.equal(parts.length, 3);
  assert.equal(parts[1].length, 16); // 16-char salt
  assert.equal(parts[2].length, 64); // 64-char sha256 hex
});

test('verifyWerkzeugHash strictly accepts correct password and rejects wrong password', () => {
  const password = 'RazaPassword2026!';
  const hash = simulateWerkzeugHash(password);

  // Correct password must pass
  assert.equal(verifyWerkzeugHash(password, hash), true);

  // Wrong passwords MUST fail
  assert.equal(verifyWerkzeugHash('WrongPassword123', hash), false);
  assert.equal(verifyWerkzeugHash('razapassword2026!', hash), false); // Case-sensitivity test
  assert.equal(verifyWerkzeugHash('123456', hash), false);
  assert.equal(verifyWerkzeugHash('', hash), false);
});

test('generateRecordsCSV creates valid CSV string with headers', () => {
  const records: LoginRecord[] = [
    {
      id: 1,
      user_id: 10,
      email_entered: 'alice@wonderland.com',
      event_type: 'LOGIN_SUCCESS',
      ip_address: '192.168.1.1',
      device_info: 'Mozilla/5.0 Chrome/120.0',
      logged_at: '2026-11-02 21:00:00'
    }
  ];

  const csv = generateRecordsCSV(records);
  assert.ok(csv.includes('Record ID,Event Type,User ID,Email Entered'));
  assert.ok(csv.includes('LOGIN_SUCCESS'));
  assert.ok(csv.includes('alice@wonderland.com'));
});
