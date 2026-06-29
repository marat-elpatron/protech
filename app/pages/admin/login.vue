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
  <main class="admin-login">
    <section class="admin-login-hero">
      <NuxtLink class="admin-logo" to="/admin" aria-label="Protech">
        <Zap :size="22" />
      </NuxtLink>
      <div class="admin-login-copy">
        <div>Protech control room</div>
        <h1>Панель управления магазином</h1>
        <p>
          Каталог, склад, заказы, отзывы, FAQ и аналитика продаж собраны в одном рабочем интерфейсе.
        </p>
      </div>
      <div>
        <span class="badge-green gap-2">
          <ShieldCheck />
          Только для администраторов
        </span>
      </div>
    </section>

    <section class="admin-login-panel">
      <form @submit.prevent="submit">
        <div class="admin-login-form-head">
          <div>
            <div class="admin-login-eyebrow">Вход</div>
            <h1>Добро пожаловать</h1>
            <p>Используйте учетную запись администратора.</p>
          </div>
          <AdminThemeToggle />
        </div>

        <div class="admin-field">
          <label for="login-email">Email</label>
          <div class="admin-login-input">
            <Mail />
            <input id="login-email" v-model="email" autocomplete="email" placeholder="admin@protech.ru" type="email" />
          </div>
        </div>

        <div class="admin-field">
          <label for="login-password">Пароль</label>
          <div class="admin-login-input">
            <LockKeyhole />
            <input id="login-password" v-model="password" autocomplete="current-password" placeholder="••••••••"
              type="password" />
          </div>
        </div>

        <button class="admin-button-primary w-full" type="submit" :disabled="loading">
          {{ loading ? "Проверяю доступ..." : "Войти в админку" }}
        </button>
      </form>
    </section>
  </main>
</template>
