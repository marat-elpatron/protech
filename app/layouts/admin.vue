<script setup lang="ts">
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
</script>

<template>
  <SidebarProvider>
    <AdminSidebar />
    <SidebarInset class="min-h-svh admin-page-bg">
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
