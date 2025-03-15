<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h1>Login</h1>

      <div class="form-group">
        <label for="username">Username</label>
        <input
          type="text"
          id="username"
          v-model="credentials.username"
          required
          autocomplete="username"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="credentials.pswd"
          required
          autocomplete="current-password"
        />
      </div>

      <div v-if="authStore.error" class="error-message">{{ authStore.error }}</div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="login-button"
      >{{ authStore.loading ? 'Logging in...' : 'Login' }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import type { LoginCredentials } from "../types/auth";

// Router and store initialization
const router = useRouter();
const authStore = useAuthStore();

// Reactive state for form credentials
const credentials = reactive<LoginCredentials>({
  username: "jay",
  pswd: "3"
});

// Handle login logic
const handleLogin = async () => {
  console.log('credentials', credentials)
  const success = await authStore.login(credentials);
  if (success) {
    //
    // redirectPath disimpan oleh router.beforeEach lihat (/src/router/index.ts)
    // supaya bisa setelah login masuk ke page yang sama
    //
    router.push(authStore.redirectPath || "/dashboard");
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #4338ca;
}

.login-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #fee2e2;
  border-radius: 4px;
}
</style>