// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { initApp } from "./store/initApp";

// Create app instance
const app = createApp(App);

// Plugins
app.use(createPinia());
app.use(router);
//
initApp(); // init axios interceptor
// Mount app
app.mount("#app");
