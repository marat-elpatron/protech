<script setup lang="ts">
import { Banknote, Clock3, Plus } from "@lucide/vue";
import { toast } from "vue-sonner";
import { formatDate, formatPrice } from "@/utils/adminFormat";
import type { AttributeItem, CategoryItem } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const route = useRoute();
const api = useAdminApi();
const productId = computed(() => Number(route.params.id));
const saving = ref(false);
const addingPrice = ref(false);
const newPrice = ref<number | null>(null);

const {
  data: product,
  pending: productPending,
  refresh: refreshProduct,
} = await useAsyncData(`admin-product-${productId.value}`, () => api.getProduct(productId.value));

const { data: categories } = await useAsyncData("admin-edit-product-categories", () => api.getCategories(), {
  default: () => [] as CategoryItem[],
});
const { data: attributes } = await useAsyncData("admin-edit-product-attributes", () => api.getAttributes(), {
  default: () => [] as AttributeItem[],
});

async function submit(payload: Record<string, unknown>) {
  saving.value = true;
  try {
    await api.updateProduct(productId.value, payload);
    await refreshProduct();
    toast.success("Товар сохранен");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось сохранить товар");
  } finally {
    saving.value = false;
  }
}

async function addPrice() {
  const value = Number(newPrice.value);
  if (!value || value <= 0) {
    toast.error("Введите корректную цену");
    return;
  }

  addingPrice.value = true;
  try {
    await api.addPrice(productId.value, value);
    newPrice.value = null;
    await refreshProduct();
    toast.success("Новая цена добавлена");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось добавить цену");
  } finally {
    addingPrice.value = false;
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader kicker="Catalog" :title="product?.name || 'Редактирование товара'"
      :description="product ? `Артикул ${product.article}` : 'Загрузка карточки товара'">
      <template #actions>
        <NuxtLink to="/admin/products">К списку</NuxtLink>
      </template>
    </AdminHeader>

    <div class="admin-stack">
      <div v-if="productPending" class="admin-loading">Загружаю товар...</div>

      <template v-else-if="product">
        <section class="admin-card">
          <div class="admin-card-header">
            <div>
              <h2 class="admin-card-heading">Управление ценой</h2>
              <p class="admin-card-copy">Новая цена автоматически станет текущей и попадет в историю</p>
            </div>
            <Banknote />
          </div>
          <div class="space-y-5">
            <div class="admin-stats-strip">
              <div class="admin-stat">
                <p class="admin-stat-label">Текущая цена</p>
                <p class="admin-stat-value">{{ formatPrice(product.currentPrice) }}</p>
              </div>
              <div class="admin-stat">
                <p class="admin-stat-label">Предыдущая цена</p>
                <p class="admin-stat-value">{{ product.oldPrice ? formatPrice(product.oldPrice) : "—" }}</p>
              </div>
              <div class="admin-stat">
                <p class="admin-stat-label">Остаток</p>
                <p class="admin-stat-value">{{ product.productStocks[0]?.quantity ?? 0 }} шт.</p>
              </div>
              <div class="admin-stat">
                <p class="admin-stat-label">Обновлен</p>
                <p class="admin-stat-value">{{ formatDate(product.updatedAt) }}</p>
              </div>
            </div>

            <form class="grid gap-3 sm:grid-cols-[minmax(180px,320px)_auto] sm:items-end" @submit.prevent="addPrice">
              <div class="admin-field">
                <label for="new-price">Новая цена</label>
                <input id="new-price" v-model.number="newPrice" min="0" step="0.01" type="number" placeholder="99000" />
              </div>
              <button class="admin-button-primary" type="submit" :disabled="addingPrice">
                <Plus />
                {{ addingPrice ? "Добавление..." : "Добавить цену" }}
              </button>
            </form>

            <div v-if="product.productPrices?.length" class="admin-data-list">
              <div class="admin-data-header lg:grid-cols-[minmax(130px,0.5fr)_minmax(180px,1fr)]">
                <span>Цена</span>
                <span>Дата</span>
              </div>
              <article v-for="price in product.productPrices" :key="price.id"
                class="admin-data-row lg:grid-cols-[minmax(130px,0.5fr)_minmax(180px,1fr)]">
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Цена</div>
                  <strong class="text-sm text-stone-950 dark:text-white">{{ formatPrice(price.value) }}</strong>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Дата</div>
                  <div class="admin-actions-row text-sm text-stone-600 dark:text-stone-300">
                    <Clock3 class="size-4 text-emerald-600 dark:text-emerald-300" />
                    {{ formatDate(price.createdAt) }}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <AdminProductForm :attributes="attributes" :categories="categories" :initial="product" :loading="saving"
          @submit="submit" />
      </template>

      <div v-else class="admin-empty">Товар не найден</div>
    </div>
  </div>
</template>
