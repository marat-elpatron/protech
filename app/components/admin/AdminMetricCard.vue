<script setup lang="ts">
import type { Component } from "vue";

withDefaults(
  defineProps<{
    title: string;
    value: string | number;
    description?: string;
    icon?: Component;
    tone?: "blue" | "teal" | "amber" | "red" | "green";
    to?: string;
  }>(),
  {
    description: "",
    icon: undefined,
    tone: "blue",
    to: undefined,
  },
);
</script>

<template>
  <component :is="to ? 'NuxtLink' : 'article'" :to="to">
    <div :class="tone">
      <component :is="icon" v-if="icon" />
    </div>
    <div>
      <p>{{ value }}</p>
      <p>{{ description || title }}</p>
    </div>
  </component>
</template>
