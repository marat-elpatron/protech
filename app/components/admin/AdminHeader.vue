<script setup lang="ts">
defineProps<{
  kicker?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <header>
    <div>
      <div v-if="kicker">{{ kicker }}</div>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions">
      <slot name="actions" />
    </div>
  </header>
</template>
