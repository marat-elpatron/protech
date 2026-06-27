<script setup lang="ts">
import type { Component } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

defineProps<{
  title: string;
  value: string | number;
  description?: string;
  icon: Component;
  trend?: string;
}>();
</script>

<template>
  <Card class="admin-card group relative overflow-hidden">
    <div
      class="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-110"
    />
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <CardTitle class="text-sm font-medium text-muted-foreground">{{ title }}</CardTitle>
      <div class="rounded-lg bg-primary/10 p-2 text-primary">
        <component :is="icon" class="size-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold tracking-tight">{{ value }}</div>
      <p v-if="description" class="mt-1 text-xs text-muted-foreground">{{ description }}</p>
      <p v-if="trend" class="mt-1 text-xs font-medium text-emerald-600">{{ trend }}</p>
    </CardContent>
  </Card>
</template>
