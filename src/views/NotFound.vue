<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <router-link to="/">Go to Home</router-link>
  </div>
</template>

<script setup lang="ts">
import { defineOptions } from "vue";

// Using script setup - no need for defineComponent
defineOptions({
  name: "NotFoundView"
});
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.not-found a {
  margin-top: 1rem;
  color: #4f46e5;
  text-decoration: none;
}
</style>