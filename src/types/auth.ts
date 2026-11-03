export type EventType = 'SIGNUP_SUCCESS' | 'LOGIN_SUCCESS' | 'WRONG_PASSWORD' | 'USER_NOT_FOUND';

export interface User {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  plain_password_demo?: string;
  created_at: string;
  last_login_at?: string | null;
}

export interface LoginRecord {
  id: number;
  user_id: number | null;
  email_entered: string;
  event_type: EventType;
  ip_address: string;
  device_info: string;
  logged_at: string;
}

export interface SecurityStats {
  total_users: number;
  total_attempts: number;
  success_logins: number;
  failed_attempts: number;
}
