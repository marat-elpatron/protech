<script setup lang="ts">
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

defineProps<{
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
}>();
</script>

<template>
  <header class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <SidebarTrigger class="-ml-1" />
    <Separator orientation="vertical" class="mr-2 h-4" />

    <div class="flex flex-1 items-center justify-between gap-4">
      <div class="min-w-0">
        <Breadcrumb v-if="breadcrumbs?.length" class="mb-0.5">
          <BreadcrumbList>
            <template v-for="(crumb, index) in breadcrumbs" :key="index">
              <BreadcrumbItem>
                <BreadcrumbLink v-if="crumb.href" as-child>
                  <NuxtLink :to="crumb.href">{{ crumb.label }}</NuxtLink>
                </BreadcrumbLink>
                <BreadcrumbPage v-else>{{ crumb.label }}</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
            </template>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 class="truncate text-lg font-semibold tracking-tight">{{ title }}</h1>
        <p v-if="description" class="truncate text-sm text-muted-foreground">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
