<script setup lang="ts">
import { Moon, Sun } from "@lucide/vue";

const { theme, toggleTheme } = useAdminTheme();

const isDark = computed(() => theme.value === "dark");
</script>

<template>
  <button type="button" :title="isDark ? 'Включить светлую тему' : 'Включить темную тему'"
    :aria-label="isDark ? 'Включить светлую тему' : 'Включить темную тему'" @click="toggleTheme">
    <Moon v-if="!isDark" />
    <Sun v-else />
  </button>
</template>
