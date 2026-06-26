<script setup lang="ts">
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
</script>

<template>
  <SidebarProvider>
    <AdminSidebar />
    <SidebarInset class="min-h-svh">
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
