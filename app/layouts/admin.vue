<script setup lang="ts">
import {
  BarChart3,
  FolderTree,
  HelpCircle,
  LogOut,
  MessageSquare,
  Package,
  ShoppingCart,
  Tags,
  Warehouse,
  Zap,
} from "@lucide/vue";

const route = useRoute();
const auth = useAuthStore();
const { initTheme } = useAdminTheme();

const navItems = [
  { title: "Обзор", href: "/admin", icon: BarChart3 },
  { title: "Товары", href: "/admin/products", icon: Package },
  { title: "Склад", href: "/admin/stock", icon: Warehouse },
  { title: "Атрибуты", href: "/admin/attributes", icon: Tags },
  { title: "Категории", href: "/admin/categories", icon: FolderTree },
  { title: "Заказы", href: "/admin/orders", icon: ShoppingCart },
  { title: "Отзывы", href: "/admin/reviews", icon: MessageSquare },
  { title: "FAQ", href: "/admin/faq", icon: HelpCircle },
];

const initials = computed(() => {
  const source = auth.user?.name || auth.user?.email || "Admin";
  return source.slice(0, 2).toUpperCase();
});

function isActive(href: string) {
  if (href === "/admin") return route.path === href;
  return route.path.startsWith(href);
}

async function handleSignOut() {
  await auth.signOut();
  await navigateTo("/admin/login");
}

onMounted(() => {
  initTheme();
});
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-sidebar-header">
        <NuxtLink to="/admin" class="brand-mark" aria-label="Protech Admin">
          <Zap :size="21" />
        </NuxtLink>
        <div>
          <p class="brand-title">Protech</p>
          <p class="brand-subtitle">администрирование</p>
        </div>
        <div style="margin-left: auto">
          <AdminThemeToggle />
        </div>
      </div>

      <nav class="admin-nav" aria-label="Разделы админ-панели">
        <NuxtLink
          v-for="item in navItems"
          :key="item.href"
          :to="item.href"
          class="admin-nav-link"
          :class="{ 'is-active': isActive(item.href) }"
        >
          <component :is="item.icon" />
          <span>{{ item.title }}</span>
        </NuxtLink>
      </nav>

      <div class="admin-sidebar-footer">
        <div class="admin-user">
          <div class="admin-user-avatar">{{ initials }}</div>
          <div style="min-width: 0">
            <div class="admin-user-name">{{ auth.user?.name || "Администратор" }}</div>
            <div class="admin-user-email">{{ auth.user?.email }}</div>
          </div>
        </div>
        <div class="sidebar-actions">
          <AdminThemeToggle />
          <button class="btn sidebar-btn" type="button" @click="handleSignOut">
            <LogOut />
            Выйти
          </button>
        </div>
      </div>
    </aside>

    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>
