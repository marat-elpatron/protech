<script setup lang="ts">
defineProps<{
  kicker?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <header class="admin-header">
    <div>
      <div v-if="kicker" class="admin-kicker">{{ kicker }}</div>
      <h1 class="admin-title">{{ title }}</h1>
      <p v-if="description" class="admin-description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="admin-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>
