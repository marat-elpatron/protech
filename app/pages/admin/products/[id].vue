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
  <div>
    <AdminHeader
      kicker="Catalog"
      :title="product?.name || 'Редактирование товара'"
      :description="product ? `Артикул ${product.article}` : 'Загрузка карточки товара'"
    >
      <template #actions>
        <NuxtLink class="btn btn-secondary" to="/admin/products">К списку</NuxtLink>
      </template>
    </AdminHeader>

    <div class="admin-content stack-lg">
      <div v-if="productPending" class="empty-state">Загружаю товар...</div>

      <template v-else-if="product">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Управление ценой</h2>
              <p class="panel-description">Новая цена автоматически станет текущей и попадет в историю</p>
            </div>
            <Banknote style="color: var(--admin-primary)" />
          </div>
          <div class="panel-body stack">
            <div class="mini-stat-grid">
              <div class="mini-stat">
                <p class="mini-stat-label">Текущая цена</p>
                <p class="mini-stat-value">{{ formatPrice(product.currentPrice) }}</p>
              </div>
              <div class="mini-stat">
                <p class="mini-stat-label">Предыдущая цена</p>
                <p class="mini-stat-value">{{ product.oldPrice ? formatPrice(product.oldPrice) : "—" }}</p>
              </div>
              <div class="mini-stat">
                <p class="mini-stat-label">Остаток</p>
                <p class="mini-stat-value">{{ product.productStocks[0]?.quantity ?? 0 }} шт.</p>
              </div>
              <div class="mini-stat">
                <p class="mini-stat-label">Обновлен</p>
                <p class="mini-stat-value" style="font-size: 15px">{{ formatDate(product.updatedAt) }}</p>
              </div>
            </div>

            <form class="toolbar" @submit.prevent="addPrice">
              <div class="field" style="width: min(360px, 100%)">
                <label for="new-price">Новая цена</label>
                <input id="new-price" v-model.number="newPrice" class="input" min="0" step="0.01" type="number" placeholder="99000" />
              </div>
              <button class="btn btn-primary" type="submit" :disabled="addingPrice">
                <Plus />
                {{ addingPrice ? "Добавление..." : "Добавить цену" }}
              </button>
            </form>

            <div v-if="product.productPrices?.length" class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Цена</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="price in product.productPrices" :key="price.id">
                    <td><strong>{{ formatPrice(price.value) }}</strong></td>
                    <td>
                      <Clock3 style="display: inline; width: 15px; height: 15px; margin-right: 6px; vertical-align: -2px; color: var(--admin-muted)" />
                      {{ formatDate(price.createdAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <AdminProductForm
          :attributes="attributes"
          :categories="categories"
          :initial="product"
          :loading="saving"
          @submit="submit"
        />
      </template>

      <div v-else class="empty-state">Товар не найден</div>
    </div>
  </div>
</template>
