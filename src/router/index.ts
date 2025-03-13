import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";

// Import components using relative paths
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Profile from "../views/Profile.vue";
import NotFound from "../views/NotFound.vue";
import ParamView from "@/views/ParamView.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/param/:id",
    name: "paramView",
    component: ParamView,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = await authStore.isAuthenticated(); // Pastikan status otentikasi tersedia
  // console.log("beforeEach: from", from, "to", to);
  //
  // If route requires authentication and user is not authenticated
  //
  if (requiresAuth && !isAuthenticated) {
    // console.log("beforeEach.BelumLogin");
    authStore.saveRedirectPath(to.fullPath); // digunakan dilogin form
    // const handleLogin = async () => {
    //   const success = await authStore.login(credentials);
    //   if (success) {
    //     //
    //     // redirectPath disimpan oleh router.beforeEach,
    //     // supaya bisa setelah login masuk ke page yang sama
    //     //
    //     router.push(authStore.redirectPath || "/dashboard");
    //   }
    // };
    next("/login");
    return;
  }
  //
  // If user is authenticated and trying to access login page
  //
  if (isAuthenticated && to.name === "Login") {
    next("/dashboard");
    return;
  }

  next();
});

export default router;
