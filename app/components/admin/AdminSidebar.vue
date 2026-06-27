<script setup lang="ts">
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Tags,
  FolderTree,
  ShoppingCart,
  MessageSquare,
  HelpCircle,
  LogOut,
  ChevronUp,
  Zap,
} from "@lucide/vue";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const route = useRoute();
const auth = useAuthStore();

const navItems = [
  { title: "Обзор", href: "/admin", icon: LayoutDashboard },
  { title: "Товары", href: "/admin/products", icon: Package },
  { title: "Склад", href: "/admin/stock", icon: Warehouse },
  { title: "Характеристики", href: "/admin/attributes", icon: Tags },
  { title: "Категории", href: "/admin/categories", icon: FolderTree },
  { title: "Заказы", href: "/admin/orders", icon: ShoppingCart },
  { title: "Отзывы", href: "/admin/reviews", icon: MessageSquare },
  { title: "FAQ", href: "/admin/faq", icon: HelpCircle },
];

function isActive(href: string) {
  if (href === "/admin") return route.path === "/admin";
  return route.path.startsWith(href);
}

const initials = computed(() => {
  const name = auth.user?.name || auth.user?.email || "A";
  return name.slice(0, 2).toUpperCase();
});

async function handleSignOut() {
  await auth.signOut();
  await navigateTo("/admin/login");
}
</script>

<template>
  <Sidebar collapsible="icon" class="border-r-0 bg-sidebar">
    <SidebarHeader class="border-b border-sidebar-border/80 px-4 py-5">
      <NuxtLink to="/admin" class="flex items-center gap-3 transition-opacity hover:opacity-90">
        <div
          class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
        >
          <Zap class="size-5" />
        </div>
        <div class="flex flex-col group-data-[collapsible=icon]:hidden">
          <span class="text-sm font-semibold tracking-tight">Protech</span>
          <span class="text-xs text-sidebar-foreground/60">Admin Panel</span>
        </div>
      </NuxtLink>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Управление</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navItems" :key="item.href">
              <SidebarMenuButton as-child :is-active="isActive(item.href)" :tooltip="item.title">
                <NuxtLink :to="item.href">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar class="size-8 rounded-lg">
                  <AvatarFallback class="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                    {{ initials }}
                  </AvatarFallback>
                </Avatar>
                <div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span class="truncate font-medium">{{ auth.user?.name || "Админ" }}</span>
                  <span class="truncate text-xs text-sidebar-foreground/60">{{ auth.user?.email }}</span>
                </div>
                <ChevronUp class="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="top"
              align="end" :side-offset="4">
              <DropdownMenuItem class="text-destructive focus:text-destructive" @click="handleSignOut">
                <LogOut class="size-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
