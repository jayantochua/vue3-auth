<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <nav>
        <router-link to="/profile">Profile</router-link>
        <button @click="handleLogout" class="logout-button">Logout</button>
      </nav>
    </header>

    <main class="dashboard-content">
      <h2>Welcome, {{ authStore.user?.full_name }}!</h2>

      <div class="dashboard-info">
        <p>Your roles: {{ authStore.userRoles.join(', ') || 'No roles assigned' }}</p>
        <p v-if="authStore.isAdmin">You have admin privileges</p>
      </div>

      <div class="loading-indicator" v-if="loading">Loading content...</div>

      <div class="dashboard-cards" v-else>
        <!-- Dashboard content here -->
        <div class="card" v-for="i in 4" :key="i">
          <h3>Card {{ i }}</h3>
          <p>This is a sample dashboard card.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineOptions } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

// Setup
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);

onMounted(async () => {
  // Simulate loading dashboard data
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
};

defineOptions({
  name: "DashboardView"
});
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

nav a {
  color: #4f46e5;
  text-decoration: none;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dashboard-content {
  margin-top: 2rem;
}

.dashboard-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 6px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  padding: 1.5rem;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-indicator {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}
</style>