export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/admin/login") {
    return;
  }

  const auth = useAuthStore();

  if (!auth.initialized) {
    await auth.fetchSession();
  }

  if (!auth.isAuthenticated || !auth.isAdmin) {
    return navigateTo({
      path: "/admin/login",
      query: to.fullPath !== "/admin" ? { redirect: to.fullPath } : undefined,
    });
  }
});
