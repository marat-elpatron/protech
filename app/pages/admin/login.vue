<script setup lang="ts">
import { LockKeyhole, Mail, ShieldCheck, Zap } from "@lucide/vue";
import { toast } from "vue-sonner";

definePageMeta({ layout: false });

const auth = useAuthStore();
const email = ref("");
const password = ref("");
const loading = ref(false);

onMounted(async () => {
  if (!auth.initialized) {
    await auth.fetchSession();
  }

  if (auth.isAdmin) {
    await navigateTo("/admin");
  }
});

async function submit() {
  if (!email.value.trim() || !password.value) {
    toast.error("Введите email и пароль");
    return;
  }

  loading.value = true;
  try {
    await auth.signIn(email.value.trim(), password.value);
    await navigateTo("/admin");
  } catch (error: any) {
    toast.error(error?.message || "Не удалось войти");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-art">
      <NuxtLink to="/admin" class="brand-mark" aria-label="Protech">
        <Zap :size="22" />
      </NuxtLink>
      <div>
        <div class="admin-kicker" style="color: #82f7e4">Protech control room</div>
        <h1>Панель управления магазином</h1>
        <p>
          Каталог, склад, заказы, отзывы, FAQ и аналитика продаж собраны в одном рабочем интерфейсе.
        </p>
      </div>
      <div class="toolbar" style="justify-content: flex-start">
        <span class="badge badge-green">
          <ShieldCheck style="width: 14px; height: 14px; margin-right: 6px" />
          Только для администраторов
        </span>
      </div>
    </section>

    <section class="login-panel">
      <form class="login-card stack" @submit.prevent="submit">
        <div class="toolbar" style="align-items: flex-start">
          <div>
            <div class="admin-kicker">Вход</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 850">Добро пожаловать</h1>
            <p class="muted" style="margin: 8px 0 0">Используйте учетную запись администратора.</p>
          </div>
          <AdminThemeToggle />
        </div>

        <div class="field">
          <label for="login-email">Email</label>
          <div style="position: relative">
            <Mail style="position: absolute; left: 12px; top: 12px; width: 18px; height: 18px; color: var(--admin-muted)" />
            <input
              id="login-email"
              v-model="email"
              class="input"
              style="padding-left: 40px"
              autocomplete="email"
              placeholder="admin@protech.ru"
              type="email"
            />
          </div>
        </div>

        <div class="field">
          <label for="login-password">Пароль</label>
          <div style="position: relative">
            <LockKeyhole style="position: absolute; left: 12px; top: 12px; width: 18px; height: 18px; color: var(--admin-muted)" />
            <input
              id="login-password"
              v-model="password"
              class="input"
              style="padding-left: 40px"
              autocomplete="current-password"
              placeholder="••••••••"
              type="password"
            />
          </div>
        </div>

        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? "Проверяю доступ..." : "Войти в админку" }}
        </button>
      </form>
    </section>
  </main>
</template>
