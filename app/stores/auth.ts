import { defineStore } from "pinia";
import { authClient, type AuthUser } from "@/utils/auth-client";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  async function fetchSession() {
    loading.value = true;

    try {
      const adminData = await $fetch<{ user: AuthUser }>("/api/admin/me", {
        credentials: "include",
        headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      });
      user.value = adminData.user;
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
    const { data, error } = await authClient.signIn.email({ email, password });

    if (error) {
      throw new Error(error.message || "Ошибка входа");
    }

    await fetchSession();

    if (!isAdmin.value) {
      await signOut();
      throw new Error("Доступ только для администраторов");
    }

    return data;
  }

  async function signOut() {
    await authClient.signOut();
    user.value = null;
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
