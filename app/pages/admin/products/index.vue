<script setup lang="ts">
import { Edit3, Plus, Trash2 } from "@lucide/vue";
import { toast } from "vue-sonner";
import { formatPrice } from "@/utils/adminFormat";
import type { CategoryItem, ProductListItem } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const search = ref("");
const categoryId = ref("all");
const isActive = ref("all");
const page = ref(1);

const activityOptions = [
  { value: "all", label: "Все статусы" },
  { value: "true", label: "Активные" },
  { value: "false", label: "Скрытые" },
];

const productQuery = computed(() => ({
  page: page.value,
  search: search.value,
  categoryId: categoryId.value === "all" ? undefined : Number(categoryId.value),
  isActive: isActive.value === "all" ? undefined : isActive.value,
}));

watch([search, categoryId, isActive], () => {
  page.value = 1;
});

const { data: categories } = await useAsyncData("admin-products-categories", () => api.getCategories(), {
  default: () => [] as CategoryItem[],
});
const categoryOptions = computed(() => [
  { value: "all", label: "Все категории" },
  ...categories.value.map((category) => ({
    value: String(category.id),
    label: category.name,
  })),
]);

const {
  data: products,
  pending,
  refresh,
} = await useAsyncData("admin-products", () => api.getProducts(productQuery.value), {
  watch: [productQuery],
});

function stockOf(product: ProductListItem) {
  return product.productStocks[0]?.quantity ?? 0;
}

async function deleteProduct(product: ProductListItem) {
  if (!confirm(`Удалить товар "${product.name}"?`)) return;

  try {
    await api.deleteProduct(product.id);
    await refresh();
    toast.success("Товар удален");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось удалить товар");
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader kicker="Catalog" title="Товары"
      description="Управление каталогом, ценами, изображениями и характеристиками">
      <template #actions>
        <NuxtLink to="/admin/products/new">
          <Plus />
          Новый товар
        </NuxtLink>
      </template>
    </AdminHeader>

    <div class="admin-stack">
      <section class="admin-filter-bar">
        <div class="admin-filter-grid">
            <AdminSearchInput v-model="search" placeholder="Поиск по названию или артикулу" />
            <div class="min-w-0">
              <AdminSelect v-model="categoryId" :options="categoryOptions" placeholder="Категория" />
            </div>
            <div class="min-w-0">
              <AdminSelect v-model="isActive" :options="activityOptions" placeholder="Статус" />
            </div>
        </div>
      </section>

      <section class="admin-card">
        <div class="admin-card-header">
          <div>
            <h2 class="admin-card-heading">Каталог</h2>
            <p class="admin-card-copy">
              {{ products?.pagination.total ?? 0 }} товаров найдено
            </p>
          </div>
        </div>
        <div>
          <div v-if="pending" class="admin-loading">Загружаю товары...</div>
          <div v-else-if="products?.items.length">
            <div class="admin-data-list">
              <div
                class="admin-data-header lg:grid-cols-[minmax(260px,2fr)_minmax(130px,1fr)_minmax(120px,0.9fr)_minmax(90px,0.7fr)_minmax(105px,0.8fr)_minmax(72px,0.6fr)_minmax(96px,0.7fr)]">
                <span>Товар</span>
                <span>Категория</span>
                <span>Цена</span>
                <span>Остаток</span>
                <span>Статус</span>
                <span>Заказы</span>
                <span>Действия</span>
              </div>
              <article v-for="product in products.items" :key="product.id"
                class="admin-data-row lg:grid-cols-[minmax(260px,2fr)_minmax(130px,1fr)_minmax(120px,0.9fr)_minmax(90px,0.7fr)_minmax(105px,0.8fr)_minmax(72px,0.6fr)_minmax(96px,0.7fr)]">
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Товар</div>
                  <div class="admin-product-cell">
                    <img class="admin-product-image" :src="product.mainImage" :alt="product.name" />
                    <div class="min-w-0">
                      <p class="admin-product-name">{{ product.name }}</p>
                      <p class="admin-product-meta">{{ product.article }} · {{ product._count.reviews }} отзывов</p>
                    </div>
                  </div>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Категория</div>
                  <div class="admin-cell-value truncate">{{ product.category.name }}</div>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Цена</div>
                  <strong class="text-sm text-stone-950 dark:text-white">{{ formatPrice(product.currentPrice) }}</strong>
                  <div v-if="product.oldPrice" class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    было {{ formatPrice(product.oldPrice) }}
                  </div>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Остаток</div>
                  <span :class="stockOf(product) <= 5 ? 'badge-amber' : 'badge-green'">
                    {{ stockOf(product) }} шт.
                  </span>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Статус</div>
                  <AdminStatusBadge :status="product.isActive" type="activity" />
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Заказы</div>
                  <div class="admin-cell-value">{{ product._count.orderItems }}</div>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Действия</div>
                  <div class="admin-actions-row">
                    <NuxtLink class="admin-icon-action" :to="`/admin/products/${product.id}`" title="Редактировать">
                      <Edit3 />
                    </NuxtLink>
                    <button class="admin-icon-danger" type="button" title="Удалить" @click="deleteProduct(product)">
                      <Trash2 />
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div v-else class="admin-empty">Товары не найдены</div>

          <div v-if="products?.pagination.pages && products.pagination.pages > 1" class="admin-pagination">
            <button class="admin-button-secondary" type="button" :disabled="page <= 1" @click="page--">Назад</button>
            <span>Страница {{ products.pagination.page }} из {{ products.pagination.pages }}</span>
            <button class="admin-button-secondary" type="button" :disabled="page >= products.pagination.pages"
              @click="page++">Вперед</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
