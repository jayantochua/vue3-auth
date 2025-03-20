// src/main.ts
import router from "../router";
import axios from "axios";
import { useAuthStore } from "./auth";
import { BrowserFingerprinter } from "./fingerprint";
export function initApp() {
  //
  // function dipanggil dari main.ts
  //
  axios.defaults.withCredentials = true;
  // Generate browser fingerprint if not present
  let browserID: string;
  try {
    browserID = new BrowserFingerprinter().getFingerprint();
  } catch (error) {
    // Fallback: Check localStorage for existing browserID
    const storedBrowserID = localStorage.getItem("bid");
    if (storedBrowserID) {
      // Use existing browserID from localStorage
      browserID = storedBrowserID;
    } else {
      // Generate new random 16-digit hex string
      browserID = generateRandomHex(16);
      // Save new browserID to localStorage
      localStorage.setItem("bid", browserID);
    }
  }
  axios.defaults.headers.common["Device-Id"] = browserID;
  ///
  ///
  ///
  const authStore = useAuthStore();

  authStore.setAxiosHeader(true);
  authStore.browserID = browserID;

  // Axios response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        //
        // Clear token and redirect to login
        //
        authStore.saveTokens(); // tanpa parameter remove all
        router.push("/login");
      }
      return Promise.reject(error);
    }
  );
}

// Helper function to generate a random hex string of specified length
function generateRandomHex(length: number): string {
  const hexChars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
  }
  return result;
}
