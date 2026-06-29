<script setup lang="ts">
import { ShoppingCart } from "@lucide/vue";
import { toast } from "vue-sonner";
import {
  formatDate,
  formatPrice,
  orderStatusOptions,
  paymentStatusOptions,
} from "@/utils/adminFormat";
import type { OrderItem, OrderStatus, PaymentStatus } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const status = ref("all");
const page = ref(1);
const updating = ref<string | null>(null);
const orderFilterOptions = [
  { value: "all", label: "Все статусы заказов" },
  ...orderStatusOptions,
];

const orderQuery = computed(() => ({
  page: page.value,
  status: status.value === "all" ? undefined : status.value,
}));

watch(status, () => {
  page.value = 1;
});

const { data: orders, pending, refresh } = await useAsyncData("admin-orders", () => api.getOrders(orderQuery.value), {
  watch: [orderQuery],
});

function orderTotal(order: OrderItem) {
  if (order.payment) return Number(order.payment.amount);
  return order.orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
}

async function changeOrderStatus(orderId: number, value: string) {
  updating.value = `order-${orderId}`;
  try {
    await api.updateOrderStatus(orderId, value as OrderStatus);
    await refresh();
    toast.success("Статус заказа обновлен");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось обновить статус заказа");
  } finally {
    updating.value = null;
  }
}

async function changePaymentStatus(orderId: number, value: string) {
  updating.value = `payment-${orderId}`;
  try {
    await api.updatePaymentStatus(orderId, value as PaymentStatus);
    await refresh();
    toast.success("Статус оплаты обновлен");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось обновить статус оплаты");
  } finally {
    updating.value = null;
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader kicker="Orders" title="Заказы"
      description="Просмотр состава заказа, доставки, оплаты и смена статусов" />

    <div class="admin-stack">
      <section class="admin-filter-bar">
        <div class="max-w-sm">
              <AdminSelect v-model="status" :options="orderFilterOptions" placeholder="Статус заказа" />
        </div>
      </section>

      <div v-if="pending" class="admin-loading">Загружаю заказы...</div>
      <div v-else-if="orders?.items.length" class="space-y-5">
        <article v-for="order in orders.items" :key="order.id" class="admin-order-card">
          <div class="admin-order-head">
            <div>
              <h2 class="admin-card-heading">Заказ #{{ order.id }}</h2>
              <p class="admin-card-copy">
                {{ order.user?.name || order.user?.email || "Гость" }} · {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <div class="admin-actions-row">
              <AdminStatusBadge :status="order.orderStatus" type="order" />
              <AdminStatusBadge v-if="order.payment" :status="order.payment.paymentStatus" type="payment" />
            </div>
          </div>

          <div class="admin-order-body">
            <div class="admin-stats-strip">
              <div class="admin-stat">
                <p class="admin-stat-label">Сумма</p>
                <p class="admin-stat-value">{{ formatPrice(orderTotal(order)) }}</p>
              </div>
              <div class="admin-stat">
                <p class="admin-stat-label">Получение</p>
                <p class="admin-stat-value">{{ order.obtainingMethod === "PICKUP" ? "Самовывоз" : "Доставка" }}</p>
              </div>
              <div class="admin-stat">
                <p class="admin-stat-label">Метод оплаты</p>
                <p class="admin-stat-value">{{ order.paymentMethod === "ONLINE" ? "Онлайн" : "Офлайн" }}</p>
              </div>
              <div class="admin-stat">
                <p class="admin-stat-label">Позиций</p>
                <p class="admin-stat-value">{{ order.orderItems.length }}</p>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="admin-field">
                <label :for="`order-status-${order.id}`">Статус заказа</label>
                <AdminSelect :model-value="order.orderStatus" :options="orderStatusOptions" placeholder="Статус заказа"
                  :aria-label="`Статус заказа ${order.id}`" :disabled="updating === `order-${order.id}`"
                  @update:model-value="changeOrderStatus(order.id, $event)" />
              </div>
              <div class="admin-field">
                <label :for="`payment-status-${order.id}`">Статус оплаты</label>
                <AdminSelect :model-value="order.payment?.paymentStatus || ''" :options="paymentStatusOptions"
                  placeholder="Статус оплаты" :aria-label="`Статус оплаты заказа ${order.id}`"
                  :disabled="!order.payment || updating === `payment-${order.id}`"
                  @update:model-value="changePaymentStatus(order.id, $event)" />
              </div>
            </div>

            <div v-if="order.delivery" class="admin-note">
              <strong>Доставка:</strong>
              {{ order.delivery.address }}
              <span v-if="order.delivery.apartment">, кв. {{ order.delivery.apartment }}</span>
              <span v-if="order.delivery.entrance">, подъезд {{ order.delivery.entrance }}</span>
              <span v-if="order.delivery.floor">, этаж {{ order.delivery.floor }}</span>
              <div v-if="order.delivery.comment">{{ order.delivery.comment }}</div>
            </div>

            <div class="admin-data-list">
              <div class="admin-data-header lg:grid-cols-[minmax(240px,1.5fr)_minmax(100px,0.6fr)_minmax(110px,0.6fr)_minmax(120px,0.7fr)]">
                <span>Товар</span>
                <span>Количество</span>
                <span>Цена</span>
                <span>Сумма</span>
              </div>
              <article v-for="item in order.orderItems" :key="item.product.id"
                class="admin-data-row lg:grid-cols-[minmax(240px,1.5fr)_minmax(100px,0.6fr)_minmax(110px,0.6fr)_minmax(120px,0.7fr)]">
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Товар</div>
                  <div class="admin-product-cell">
                    <img class="admin-product-image" :src="item.product.mainImage" :alt="item.product.name" />
                    <p class="admin-product-name">{{ item.product.name }}</p>
                  </div>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Количество</div>
                  <div class="admin-cell-value">{{ item.quantity }} шт.</div>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Цена</div>
                  <div class="admin-cell-value">{{ formatPrice(item.price) }}</div>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Сумма</div>
                  <strong class="text-sm text-stone-950 dark:text-white">
                    {{ formatPrice(Number(item.price) * item.quantity) }}
                  </strong>
                </div>
              </article>
            </div>
          </div>
        </article>

        <div v-if="orders.pagination.pages > 1" class="admin-pagination">
          <button class="admin-button-secondary" type="button" :disabled="page <= 1" @click="page--">Назад</button>
          <span>Страница {{ orders.pagination.page }} из {{ orders.pagination.pages }}</span>
          <button class="admin-button-secondary" type="button" :disabled="page >= orders.pagination.pages"
            @click="page++">Вперед</button>
        </div>
      </div>

      <div v-else class="admin-empty">
        <ShoppingCart />
        Заказов пока нет
      </div>
    </div>
  </div>
</template>
