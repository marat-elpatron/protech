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
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="toolbar">
      <slot name="actions" />
    </div>
  </header>
</template>
