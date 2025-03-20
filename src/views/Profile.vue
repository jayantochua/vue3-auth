<template>
  <div class="profile-container">
    <h1>User Profile</h1>

    <div v-if="loading" class="loading">Loading profile information...</div>

    <div v-else-if="authStore.user" class="profile-content">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar">{{ getInitials(authStore.user.username) }}</div>
          <h2>{{ authStore.user.username }}</h2>
        </div>

        <div class="profile-details">
          <div class="detail-row">
            <span class="label">Email:</span>
            <span class="value">{{ authStore.user.email }}</span>
          </div>

          <div class="detail-row">
            <span class="label">User ID:</span>
            <span class="value">{{ authStore.user.id }}</span>
          </div>

          <div class="detail-row">
            <span class="label">Roles:</span>
            <span class="value">
              <span
                v-for="(role, index) in authStore.userRoles"
                :key="role"
                class="role-badge"
              >{{ role }}{{ (index < (authStore.userRoles.length - 1)) ? ', ' : '' }}</span>
              <span v-if="!authStore.userRoles.length">No roles assigned</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <router-link to="/dashboard" class="back-link">Back to Dashboard</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineOptions } from "vue";
import { useAuthStore } from "../store/auth";

// Setup
const authStore = useAuthStore();
const loading = ref(true);

onMounted(async () => {
  try {
    if (!authStore.user) {
      await authStore.getUserProfile();
    }
  } finally {
    loading.value = false;
  }
});

// Helper function to get user initials for avatar
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

defineOptions({
  name: "ProfileView"
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.profile-content {
  margin-top: 2rem;
}

.profile-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.avatar {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4f46e5;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.profile-details {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.label {
  width: 120px;
  font-weight: 600;
  color: #4b5563;
}

.value {
  flex: 1;
}

.role-badge {
  display: inline-block;
  color: #4f46e5;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.back-link {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.back-link:hover {
  background-color: #e5e7eb;
}
</style>