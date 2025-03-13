// src/main.ts
import router from "../router";
import axios from "axios";
import { useAuthStore } from "./auth";
export function initApp() {
  const authStore = useAuthStore();
  authStore.setAxiosHeader(true);

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
