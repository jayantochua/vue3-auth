// src/types/auth.ts
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  roles: string[];
  pid: number | 0;
}

export interface LoginCredentials {
  username: string;
  pswd: string;
  need_cookies: boolean;
}

export interface LoginResult {
  access_token: string | ""; // Token akses, opsional
  refresh_token: string | ""; // Token refresh, opsional
  token_type: string | null; // Jenis token, opsional
  expires_in: number | 0; // Durasi kedaluwarsa dalam detik, opsional
  csrf_token: string | ""; // Token CSRF, opsional
  needs_password_change?: boolean | null; // Apakah pengguna perlu mengganti kata sandi, opsional
  requires_2fa?: boolean | null; // Apakah autentikasi dua faktor diaktifkan, opsional
  status_code: number; // Kode status HTTP, default 200
  success: boolean | false; // Apakah operasi berhasil, default false
  info?: string | null; // Informasi tambahan, opsional
  message?: string | null; // Pesan respons, opsional
  Profile: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  csrfToken: string | null;
  isAuthenticatedStatus: boolean;
  loading: boolean;
  error: string | null;
  loginResult: LoginResult | null;
  redirectPath: string | null;
  checkFirst: boolean | null; // Variabel internal, hanya digunakan di dalam store
  browserID: string | null;
  refreshTokenInterval: NodeJS.Timeout | null; // Tambahkan union type
  token_expires_in: number | 0;
}
