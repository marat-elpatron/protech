export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();

  if (!auth.initialized) {
    await auth.fetchSession();
  }

  if (!auth.isAdmin) {
    return navigateTo("/admin/login");
  }
});
