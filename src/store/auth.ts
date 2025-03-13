// src/store/auth.ts
import { defineStore } from "pinia";
import axios from "axios";
import type { AuthState, LoginCredentials, User, LoginResult } from "../types/auth";
import { useRouter } from "vue-router";

// Determine API URL based on environment
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const router = useRouter();

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    loading: false,
    error: null,
    loginResult: null,
    redirectPath: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    userRoles: (state) => state.user?.roles || [],
    isAdmin: (state) => state.user?.roles.includes("admin") || false,
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(`${apiBaseUrl}/auth/user/login`, credentials, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("login.response", response);
        const loginResult: LoginResult = response.data;
        this.loginResult = loginResult;
        this.token = loginResult.access_token;
        this.isAuthenticated = loginResult.success;

        // Store token in localStorage
        localStorage.setItem("token", this.token);

        // Set default Authorization header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
        return this.isAuthenticated;
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
        if (this.token) {
          await axios.post(
            `${apiBaseUrl}/auth/user/logout`,
            {},
            {
              headers: { Authorization: `Bearer ${this.token}` },
            }
          );
        }
      } catch (error) {
        console.error("Logout API error:", error);
      } finally {
        // Reset state regardless of API response
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        this.loginResult = null;

        // Clear localStorage and axios headers
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      }
    },

    async fetchUserProfile(): Promise<void> {
      console.log("fetchUserProfile", this.token);
      if (!this.token) return;
      console.log("fetchUserProfile");
      this.loading = true;

      try {
        const response = await axios.get(`${apiBaseUrl}/auth/user/profile`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        console.log(response);
        const user: User = response.data;
        this.user = user;
        this.user.roles = ["admin"];
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.logout();
        }
      } finally {
        this.loading = false;
      }
    },

    // Check if the user has a specific permission/role
    hasPermission(role: string): boolean {
      return this.user?.roles.includes(role) || false;
    },
    setRedirectPath(path: string) {
      this.redirectPath = path;
    },
  },
});
