import { defineStore } from "pinia";
import { authClient, type AuthUser } from "@/utils/auth-client";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value));
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  async function fetchSession() {
    loading.value = true;

    try {
      const data = await $fetch<{ user: AuthUser }>("/api/admin/me", {
        credentials: "include",
        headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      });
      user.value = data.user;
      return user.value;
    } catch {
      user.value = null;
      return null;
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      throw new Error(error.message || "Не удалось войти");
    }

    await fetchSession();

    if (!isAdmin.value) {
      await signOut();
      throw new Error("Доступ разрешен только администраторам");
    }
  }

  async function signOut() {
    await authClient.signOut();
    user.value = null;
    initialized.value = true;
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    fetchSession,
    signIn,
    signOut,
  };
});
