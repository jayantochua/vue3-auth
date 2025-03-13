// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import axios from "axios";

// Configure axios with default headers and interceptors
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Axios response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

// Create app instance
const app = createApp(App);

// Plugins
app.use(createPinia());
app.use(router);

// Mount app
app.mount("#app");
