// src/store/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import type { AuthState, LoginCredentials, User, LoginResult } from "../types/auth";
import { BrowserFingerprinter } from "./fingerprint";

// Determine API URL based on environment
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const csrfToken = ref<string | null>(null);
  const isAuthenticatedStatus = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loginResult = ref<LoginResult | null>(null);
  const redirectPath = ref<string | null>(null);
  const checkFirst = ref(false);
  const browserID = ref("");
  const refreshTokenInterval = ref<NodeJS.Timeout | null>(null);
  const token_expires_in = ref(0);

  // Getters
  const currentUser = computed(() => user.value);
  const userRoles = computed(() => user.value?.roles || []);
  const isAdmin = computed(() => user.value?.roles.includes("admin") || false);

  // Functions

  /**
   * Sets Axios headers for authentication
   */
  function setAxiosHeader(flagLoad: boolean) {
    if (flagLoad) {
      axios.defaults.headers.common["X-CSRF-Token"] = csrfToken.value;
    } else {
      delete axios.defaults.headers.common["X-CSRF-Token"];
    }
  }

  /**
   * Saves authentication tokens
   */
  function saveTokens(csrf_token?: string) {
    if (!csrf_token) {
      csrfToken.value = null;
    } else {
      csrfToken.value = csrf_token;
    }
    console.log("saveTokens");
    if (csrf_token) {
      console.log("   csrf_token", csrf_token.slice(0, 8) + "..." + csrf_token.slice(-12));
    }
    console.log("saveTokens");
  }

  /**
   * Clears refresh token timer
   */
  function clearRefreshTimer() {
    if (refreshTokenInterval.value) {
      clearInterval(refreshTokenInterval.value);
      refreshTokenInterval.value = null;
    }
  }

  /**
   * Refreshes authentication token
   */
  async function getRefreshToken() {
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/client/refreshtoken`);
      console.log("refresh_token", response);

      const res: LoginResult = response.data;
      if (res.success) {
        token_expires_in.value = res.expires_in;
        saveTokens(res.csrf_token);
        startRefreshTokenTimer();
      } else {
        saveTokens();
        clearRefreshTimer();
      }

      console.log("refreshToken successfully.");
      return res.success;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
    }
  }

  /**
   * Starts refresh token timer
   */
  function startRefreshTokenTimer() {
    // Clear existing timer if any
    clearRefreshTimer();

    // Calculate timeout (80% of token expiry time for safety)
    const timeOut = token_expires_in.value ? 0.8 * 1000 * token_expires_in.value : 60 * 1000;

    console.log(
      "RefreshTokenTimer, token_expires_in",
      token_expires_in.value,
      "ms=",
      token_expires_in.value / 1000,
      "sec=",
      token_expires_in.value / (60 * 1000),
      "mins (if zero, browser just refreshed)"
    );

    console.log("RefreshToken in ", timeOut, "ms=", timeOut / 1000, "sec=", timeOut / (60 * 1000), "mins");

    // Set interval for token refresh
    refreshTokenInterval.value = setInterval(async () => {
      const ok = await getRefreshToken();
      if (!ok) {
        clearRefreshTimer();
      }
    }, timeOut);
  }

  /**
   * Fetches user profile
   */
  async function getUserProfile(): Promise<void> {
    isAuthenticatedStatus.value = false;
    loading.value = true;

    try {
      const response = await axios.get(`${apiBaseUrl}/auth/client/profile`);

      const userProfile: User = response.data;
      user.value = userProfile;

      if (user.value) {
        user.value.roles = ["admin"]; // Set roles
        isAuthenticatedStatus.value = true;
      }
    } catch (error: any) {
      console.log("getUserProfile error", error);
      if (error.response?.status === 401) {
        // Token expired or invalid
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * Checks if user is authenticated
   */
  async function isAuthenticated(): Promise<boolean> {
    console.log("isAuthenticated");
    // If first check, try to get user profile
    if (!checkFirst.value) {
      checkFirst.value = true;
      await getUserProfile();

      if (isAuthenticatedStatus.value) {
        startRefreshTokenTimer();
        return true;
      }
    }

    return isAuthenticatedStatus.value;
  }

  /**
   * Logs in user
   */
  async function login(credentials: LoginCredentials): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${apiBaseUrl}/auth/client/login`, credentials);
      console.log("login.response.data", response.data);

      const res: LoginResult = response.data;
      token_expires_in.value = res.expires_in;
      loginResult.value = res;

      isAuthenticatedStatus.value = res.success;
      console.log("isAuthenticatedStatus.value#1", isAuthenticatedStatus.value);

      if (isAuthenticatedStatus.value) {
        saveTokens(res.csrf_token);
        startRefreshTokenTimer();
      } else {
        error.value = res.message || "";
      }
      console.log("isAuthenticatedStatus.value#2", isAuthenticatedStatus.value);
      return isAuthenticatedStatus.value;
    } catch (error: any) {
      console.error("Login error");
      error.value = error.response?.data?.message || "Login failed. Please try again.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Logs out user
   */
  async function logout(): Promise<void> {
    try {
      user.value = null;
      isAuthenticatedStatus.value = false;
      loginResult.value = null;
      await axios.post(`${apiBaseUrl}/auth/client/logout`);
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      saveTokens(); // Clear tokens
    }
  }

  /**
   * Checks if user has specific permission/role
   */
  function hasPermission(role: string): boolean {
    return user.value?.roles.includes(role) || false;
  }

  /**
   * Saves redirect path
   */
  function saveRedirectPath(path: string) {
    console.log("saveRedirectPath", path);
    redirectPath.value = path;
  }

  /**
   * Gets browser ID
   */
  function getBrowserI(): string {
    return browserID.value || "";
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    csrfToken,
    isAuthenticatedStatus,
    loading,
    error,
    loginResult,
    redirectPath,
    browserID,
    token_expires_in,

    // Getters
    currentUser,
    userRoles,
    isAdmin,

    // Actions
    isAuthenticated,
    login,
    logout,
    getUserProfile,
    getRefreshToken,
    startRefreshTokenTimer,
    clearRefreshTimer,
    setAxiosHeader,
    saveTokens,
    hasPermission,
    saveRedirectPath,
    getBrowserI,
  };
});
