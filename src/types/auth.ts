// src/types/auth.ts
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  roles: string[];
}

export interface LoginCredentials {
  username: string;
  pswd: string;
}

export interface LoginResult {
  access_token: string | ""; // Token akses, opsional
  refresh_token: string | ""; // Token refresh, opsional
  token_type?: string | null; // Jenis token, opsional
  expires_in?: number | null; // Durasi kedaluwarsa dalam detik, opsional
  csrf_token?: string | null; // Token CSRF, opsional
  needs_password_change?: boolean | null; // Apakah pengguna perlu mengganti kata sandi, opsional
  two_factor_enabled?: boolean | null; // Apakah autentikasi dua faktor diaktifkan, opsional
  status_code: number; // Kode status HTTP, default 200
  success: boolean | false; // Apakah operasi berhasil, default false
  info?: string | null; // Informasi tambahan, opsional
  message?: string | null; // Pesan respons, opsional
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginResult: LoginResult | null;
  redirectPath: string | null;
}
