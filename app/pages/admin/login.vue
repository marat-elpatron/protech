<script setup lang="ts">
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Loader2 } from "@lucide/vue";

definePageMeta({ layout: false });

const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

onMounted(async () => {
  await auth.fetchSession();
  if (auth.isAdmin) {
    await navigateTo((route.query.redirect as string) || "/admin");
  }
});

async function handleSubmit() {
  error.value = "";
  loading.value = true;

  try {
    await auth.signIn(email.value, password.value);
    toast.success("Добро пожаловать!");
    await navigateTo((route.query.redirect as string) || "/admin");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Ошибка входа";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-4">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.52_0.19_255/0.12),transparent_50%)]" />

    <Card class="relative z-10 w-full max-w-md border-border/60 shadow-xl">
      <CardHeader class="space-y-3 text-center">
        <div class="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Zap class="size-6" />
        </div>
        <CardTitle class="text-2xl font-bold">Protech Admin</CardTitle>
        <CardDescription>Войдите в панель управления магазином</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <Alert v-if="error" variant="destructive">
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="admin@protech.ru"
              required
              autocomplete="email"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Пароль</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            <Loader2 v-if="loading" class="size-4 animate-spin" />
            {{ loading ? "Вход..." : "Войти" }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
