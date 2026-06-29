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
    <AdminHeader kicker="Catalog" :title="product?.name || 'Редактирование товара'"
      :description="product ? `Артикул ${product.article}` : 'Загрузка карточки товара'">
      <template #actions>
        <NuxtLink to="/admin/products">К списку</NuxtLink>
      </template>
    </AdminHeader>

    <div>
      <div v-if="productPending">Загружаю товар...</div>

      <template v-else-if="product">
        <section>
          <div>
            <div>
              <h2>Управление ценой</h2>
              <p>Новая цена автоматически станет текущей и попадет в историю</p>
            </div>
            <Banknote />
          </div>
          <div>
            <div>
              <div>
                <p>Текущая цена</p>
                <p>{{ formatPrice(product.currentPrice) }}</p>
              </div>
              <div>
                <p>Предыдущая цена</p>
                <p>{{ product.oldPrice ? formatPrice(product.oldPrice) : "—" }}</p>
              </div>
              <div>
                <p>Остаток</p>
                <p>{{ product.productStocks[0]?.quantity ?? 0 }} шт.</p>
              </div>
              <div>
                <p>Обновлен</p>
                <p>{{ formatDate(product.updatedAt) }}</p>
              </div>
            </div>

            <form @submit.prevent="addPrice">
              <div>
                <label for="new-price">Новая цена</label>
                <input id="new-price" v-model.number="newPrice" min="0" step="0.01" type="number" placeholder="99000" />
              </div>
              <button type="submit" :disabled="addingPrice">
                <Plus />
                {{ addingPrice ? "Добавление..." : "Добавить цену" }}
              </button>
            </form>

            <div v-if="product.productPrices?.length">
              <table>
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
                      <Clock3 />
                      {{ formatDate(price.createdAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <AdminProductForm :attributes="attributes" :categories="categories" :initial="product" :loading="saving"
          @submit="submit" />
      </template>

      <div v-else>Товар не найден</div>
    </div>
  </div>
</template>
