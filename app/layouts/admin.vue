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
  <div>
    <aside>
      <div>
        <NuxtLink to="/admin" aria-label="Protech Admin">
          <Zap :size="21" />
        </NuxtLink>
        <div>
          <p>Protech</p>
          <p>администрирование</p>
        </div>
        <div>
          <AdminThemeToggle />
        </div>
      </div>

      <nav aria-label="Разделы админ-панели">
        <NuxtLink v-for="item in navItems" :key="item.href" :to="item.href"
          :class="{ 'is-active': isActive(item.href) }">
          <component :is="item.icon" />
          <span>{{ item.title }}</span>
        </NuxtLink>
      </nav>

      <div>
        <div>
          <div>{{ initials }}</div>
          <div>
            <div>{{ auth.user?.name || "Администратор" }}</div>
            <div>{{ auth.user?.email }}</div>
          </div>
        </div>
        <div>
          <AdminThemeToggle />
          <button type="button" @click="handleSignOut">
            <LogOut />
            Выйти
          </button>
        </div>
      </div>
    </aside>

    <main>
      <slot />
    </main>
  </div>
</template>
