<script setup lang="ts">
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";

const { initTheme } = useAdminTheme();

onMounted(() => {
  initTheme();
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster rich-colors close-button position="top-right" />
</template>
