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
  <div>
    <AdminHeader
      kicker="Catalog"
      title="Товары"
      description="Управление каталогом, ценами, изображениями и характеристиками"
    >
      <template #actions>
        <NuxtLink class="btn btn-primary" to="/admin/products/new">
          <Plus />
          Новый товар
        </NuxtLink>
      </template>
    </AdminHeader>

    <div class="admin-content stack-lg">
      <section class="panel">
        <div class="panel-body toolbar">
          <div class="filters">
            <AdminSearchInput v-model="search" placeholder="Поиск по названию или артикулу" />
            <div style="width: 240px">
              <AdminSelect v-model="categoryId" :options="categoryOptions" placeholder="Категория" />
            </div>
            <div style="width: 190px">
              <AdminSelect v-model="isActive" :options="activityOptions" placeholder="Статус" />
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Каталог</h2>
            <p class="panel-description">
              {{ products?.pagination.total ?? 0 }} товаров найдено
            </p>
          </div>
        </div>
        <div class="panel-body">
          <div v-if="pending" class="empty-state">Загружаю товары...</div>
          <div v-else-if="products?.items.length" class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Статус</th>
                  <th>Заказы</th>
                  <th style="width: 170px">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products.items" :key="product.id">
                  <td>
                    <div class="entity-cell">
                      <img class="thumb" :src="product.mainImage" :alt="product.name" />
                      <div>
                        <p class="entity-title">{{ product.name }}</p>
                        <p class="entity-meta">{{ product.article }} · {{ product._count.reviews }} отзывов</p>
                      </div>
                    </div>
                  </td>
                  <td>{{ product.category.name }}</td>
                  <td>
                    <strong>{{ formatPrice(product.currentPrice) }}</strong>
                    <div v-if="product.oldPrice" class="entity-meta">было {{ formatPrice(product.oldPrice) }}</div>
                  </td>
                  <td>
                    <span class="badge" :class="stockOf(product) <= 5 ? 'badge-amber' : 'badge-green'">
                      {{ stockOf(product) }} шт.
                    </span>
                  </td>
                  <td><AdminStatusBadge :status="product.isActive" type="activity" /></td>
                  <td>{{ product._count.orderItems }}</td>
                  <td>
                    <div class="toolbar" style="justify-content: flex-start">
                      <NuxtLink class="btn btn-secondary btn-icon" :to="`/admin/products/${product.id}`" title="Редактировать">
                        <Edit3 />
                      </NuxtLink>
                      <button class="btn btn-danger btn-icon" type="button" title="Удалить" @click="deleteProduct(product)">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">Товары не найдены</div>

          <div v-if="products?.pagination.pages && products.pagination.pages > 1" class="pagination">
            <button class="btn btn-secondary" type="button" :disabled="page <= 1" @click="page--">Назад</button>
            <span class="muted">Страница {{ products.pagination.page }} из {{ products.pagination.pages }}</span>
            <button class="btn btn-secondary" type="button" :disabled="page >= products.pagination.pages" @click="page++">Вперед</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
