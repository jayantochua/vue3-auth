// src/store/auth.ts
import { defineStore } from "pinia";
import axios from "axios";
import type { AuthState, LoginCredentials, User, LoginResult } from "../types/auth";
import { BrowserFingerprinter } from "./fingerprint.ts";

// Determine API URL based on environment
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    csrfToken: localStorage.getItem("csrf_token"),
    isAuthenticatedStatus: false,
    loading: false,
    error: null,
    loginResult: null,
    redirectPath: null,
    checkFirst: false, // Variabel internal, hanya digunakan di dalam store
    browserID: "",
    refreshTokenInterval: null as NodeJS.Timeout | null,
  }),

  getters: {
    currentUser: (state) => state.user,
    userRoles: (state) => state.user?.roles || [],
    isAdmin: (state) => state.user?.roles.includes("admin") || false,
  },

  actions: {
    /**
     * Fungsi untuk memeriksa apakah pengguna sudah terotentikasi.
     * Juga memuat browserID jika belum ada.
     */
    async isAuthenticated(): Promise<boolean> {
      // Load browserID jika belum ada
      if (!this.browserID) {
        const fingerprinter = new BrowserFingerprinter();
        this.browserID = fingerprinter.getFingerprint();
        console.log("Generated browserID:", this.browserID);
        axios.defaults.headers.common["Device-Id"] = this.browserID;
      }

      // Jika checkFirst masih false, coba dapatkan profil pengguna
      if (!this.checkFirst) {
        // const ok = await this.getRefreshToken();
        // if (ok) {
        await this.getUserProfile();
        if (this.isAuthenticatedStatus) {
          this.checkFirst = true; // Set checkFirst menjadi true
          this.startRefreshTokenTimer();
          return true;
        }
        // }
        return this.isAuthenticatedStatus;
      }
      // Kembalikan status otentikasi
      return this.isAuthenticatedStatus;
    },
    /**
     * Inisialisasi store dan generate browserID
     */
    async login(credentials: LoginCredentials): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(`${apiBaseUrl}/auth/user/login`, credentials, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("login.response", response);
        const Res: LoginResult = response.data;
        console.log(Res);
        this.loginResult = Res;
        this.isAuthenticatedStatus = Res.success;
        if (this.isAuthenticatedStatus) {
          this.saveTokens(Res.access_token, Res.refresh_token, Res.csrf_token);
          //
          // Start refresh token interval
          //
          this.startRefreshTokenTimer();
        } else {
          this.error = Res.message ? Res.message : "";
        }
        return this.isAuthenticatedStatus;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Login failed. Please try again.";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async logout(): Promise<void> {
      try {
        // Optional: Call logout endpoint if your API requires it
        if (this.accessToken) {
          await axios.post(
            `${apiBaseUrl}/auth/user/logout`,
            {},
            {
              headers: { Authorization: `Bearer ${this.accessToken}` },
            }
          );
        }
      } catch (error) {
        console.error("Logout API error:", error);
      } finally {
        // Reset state regardless of API response
        this.saveTokens();
      }
    },

    async getUserProfile(): Promise<void> {
      if (!this.accessToken) return;
      this.loading = true;

      try {
        const response = await axios.get(`${apiBaseUrl}/auth/user/profile`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        // console.log(response);
        const user: User = response.data;
        this.user = user;
        this.user.roles = ["admin"];
        this.isAuthenticatedStatus = true; // Set authenticated to true jika fetch berhasil
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.logout();
        }
      } finally {
        this.loading = false;
      }
    },
    async getRefreshToken() {
      // console.log("startRefreshTokenTimer", `Bearer ${this.refreshToken}`);
      try {
        const response = await axios.post(
          `${apiBaseUrl}/auth/user/refreshtoken`,
          {},
          {
            headers: { Authorization: `Bearer ${this.refreshToken}` },
          }
        );
        console.log("refresh_token", response);
        const Res: LoginResult = response.data;
        if (Res.success) {
          this.saveTokens(Res.access_token, Res.refresh_token, Res.csrf_token);
        } else {
          this.saveTokens();
        }
        console.log("refreshToken successfully.");
        return Res.success;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        return false;
      }
    },
    /**
     * Memulai interval untuk refresh token setiap 15 menit
     */
    startRefreshTokenTimer() {
      // Bersihkan interval yang ada (jika ada)
      this.clearRefreshTimer();
      console.log("startRefreshTokenTimer");
      // Set interval untuk refresh token setiap 15 menit (900.000 ms)
      this.refreshTokenInterval = setInterval(async () => {
        const ok = await this.getRefreshToken();
        if (!ok) {
          this.clearRefreshTimer();
        }
      }, 15 * 60 * 1000); // 15 menit = 900.000 ms
    },
    /**
     * Membersihkan interval refresh token
     */
    clearRefreshTimer() {
      if (this.refreshTokenInterval) {
        clearInterval(this.refreshTokenInterval);
        this.refreshTokenInterval = null;
      }
    },
    setAxiosHeader(flagLoad: Boolean) {
      if (flagLoad) {
        //
        // Set default Authorization header for future requests
        //
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.accessToken}`;
        axios.defaults.headers.common["X-CSRF-Token"] = this.csrfToken;
      } else {
        delete axios.defaults.headers.common["Authorization"];
        delete axios.defaults.headers.common["X-CSRF-Token"];
      }
    },
    saveTokens(access_token?: string, refresh_token?: string, csrf_token?: string) {
      if (!access_token || !refresh_token || !csrf_token) {
        this.user = null;
        this.isAuthenticatedStatus = false;
        this.loginResult = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.csrfToken = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("csrf_token");
        //
        // Clear localStorage and axios headers
        //
        this.setAxiosHeader(false);
      } else {
        this.accessToken = access_token;
        this.refreshToken = refresh_token;
        this.csrfToken = csrf_token;
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        localStorage.setItem("csrf_token", csrf_token);

        //
        // Set default Authorization header for future requests
        //
        this.setAxiosHeader(true);
      }
      console.log("saveTokens");
      console.log("   access_token", access_token?.slice(0, 8) + "..." + access_token?.slice(-12));
      console.log("   refresh_token", refresh_token?.slice(0, 8) + "..." + refresh_token?.slice(-12));
      console.log("   csrf_token", csrf_token?.slice(0, 8) + "..." + csrf_token?.slice(-12));
      console.log("saveTokens");
    },
    // Check if the user has a specific permission/role
    hasPermission(role: string): boolean {
      return this.user?.roles.includes(role) || false;
    },
    saveRedirectPath(path: string) {
      console.log("saveRedirectPath", path);
      this.redirectPath = path;
    },
    getBrowserI(): string {
      return this.browserID ? this.browserID : "";
    },
  },
});
