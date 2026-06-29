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
  <component :is="to ? 'NuxtLink' : 'article'" class="admin-metric-card" :to="to">
    <div :class="['admin-metric-icon', `metric-${tone}`]">
      <component :is="icon" v-if="icon" />
    </div>
    <div>
      <p class="admin-metric-value">{{ value }}</p>
      <p class="admin-metric-label">{{ description || title }}</p>
    </div>
  </component>
</template>
