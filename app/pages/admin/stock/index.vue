<script setup lang="ts">
import { PackagePlus, Truck, Warehouse } from "@lucide/vue";
import { toast } from "vue-sonner";
import { formatDate } from "@/utils/adminFormat";
import type { StockItem } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const search = ref("");
const deliveries = reactive<Record<number, number | null>>({});
const exact = reactive<Record<number, number | null>>({});
const updating = ref<number | null>(null);
const bulkSubmitting = ref(false);
const bulkDelivery = ref<{ reset: () => void } | null>(null);

const { data: stocks, pending, refresh } = await useAsyncData("admin-stock", () => api.getStock(), {
  default: () => [] as StockItem[],
});

const filteredStocks = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return stocks.value;

  return stocks.value.filter((item) => {
    return (
      item.product.name.toLowerCase().includes(term) ||
      item.product.article.toLowerCase().includes(term)
    );
  });
});

async function addDelivery(item: StockItem) {
  const amount = Number(deliveries[item.product.id] ?? 0);
  if (!Number.isInteger(amount) || amount <= 0) {
    toast.error("Введите положительное целое количество поставки");
    return;
  }

  updating.value = item.product.id;
  try {
    await api.updateStock(item.product.id, item.quantity + amount);
    deliveries[item.product.id] = null;
    await refresh();
    toast.success(`Поставка +${amount} шт. добавлена`);
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось добавить поставку");
  } finally {
    updating.value = null;
  }
}

async function setExactQuantity(item: StockItem) {
  const quantity = Number(exact[item.product.id]);
  if (!Number.isInteger(quantity) || quantity < 0) {
    toast.error("Введите корректный остаток");
    return;
  }

  updating.value = item.product.id;
  try {
    await api.updateStock(item.product.id, quantity);
    exact[item.product.id] = null;
    await refresh();
    toast.success("Остаток обновлен");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось обновить остаток");
  } finally {
    updating.value = null;
  }
}

async function submitBulkDelivery(rows: { productId: number; quantity: number }[]) {
  const stockByProductId = new Map(stocks.value.map((item) => [item.product.id, item]));

  bulkSubmitting.value = true;
  try {
    await Promise.all(
      rows.map((row) => {
        const stock = stockByProductId.get(row.productId);
        return api.updateStock(row.productId, (stock?.quantity ?? 0) + row.quantity);
      }),
    );
    bulkDelivery.value?.reset();
    await refresh();
    toast.success(`Поставка загружена: ${rows.length} товаров`);
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось загрузить массовую поставку");
  } finally {
    bulkSubmitting.value = false;
  }
}
</script>

<template>
  <div>
    <AdminHeader
      kicker="Inventory"
      title="Склад и поставки"
      description="Добавляйте приходы товаров и корректируйте фактические остатки"
    />

    <div class="admin-content stack-lg">
      <section class="metrics-grid">
        <AdminMetricCard
          title="Склад"
          :value="stocks.length"
          description="Позиций на складе"
          :icon="Warehouse"
        />
        <AdminMetricCard
          title="Низкий остаток"
          :value="stocks.filter((item) => item.quantity <= 5).length"
          description="Товаров нужно пополнить"
          :icon="PackagePlus"
          tone="amber"
        />
        <AdminMetricCard
          title="Всего единиц"
          :value="stocks.reduce((sum, item) => sum + item.quantity, 0)"
          description="Единиц товара"
          :icon="Truck"
          tone="teal"
        />
      </section>

      <AdminBulkStockDelivery
        ref="bulkDelivery"
        :stocks="stocks"
        :submitting="bulkSubmitting"
        @submit="submitBulkDelivery"
      />

      <section class="panel">
        <div class="panel-body">
          <AdminSearchInput v-model="search" placeholder="Поиск по товару или артикулу" />
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Остатки</h2>
            <p class="panel-description">Поставка прибавляется к текущему остатку</p>
          </div>
        </div>
        <div class="panel-body">
          <div v-if="pending" class="empty-state">Загружаю склад...</div>
          <div v-else-if="filteredStocks.length" class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Текущий остаток</th>
                  <th>Добавить поставку</th>
                  <th>Установить остаток</th>
                  <th>Обновлено</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredStocks" :key="item.id">
                  <td>
                    <div>
                      <p class="entity-title">{{ item.product.name }}</p>
                      <p class="entity-meta">{{ item.product.article }}</p>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="item.quantity <= 5 ? 'badge-amber' : 'badge-green'">
                      {{ item.quantity }} шт.
                    </span>
                  </td>
                  <td>
                    <form class="toolbar" style="justify-content: flex-start" @submit.prevent="addDelivery(item)">
                      <input v-model.number="deliveries[item.product.id]" class="input compact" min="1" step="1" style="width: 120px" type="number" placeholder="+ шт." />
                      <button class="btn btn-soft" type="submit" :disabled="updating === item.product.id">
                        <Truck />
                        Приход
                      </button>
                    </form>
                  </td>
                  <td>
                    <form class="toolbar" style="justify-content: flex-start" @submit.prevent="setExactQuantity(item)">
                      <input v-model.number="exact[item.product.id]" class="input compact" min="0" step="1" style="width: 120px" type="number" placeholder="остаток" />
                      <button class="btn btn-secondary" type="submit" :disabled="updating === item.product.id">Сохранить</button>
                    </form>
                  </td>
                  <td>{{ formatDate(item.updatedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">Товары на складе не найдены</div>
        </div>
      </section>
    </div>
  </div>
</template>
