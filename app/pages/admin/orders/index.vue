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
  <div>
    <AdminHeader
      kicker="Orders"
      title="Заказы"
      description="Просмотр состава заказа, доставки, оплаты и смена статусов"
    />

    <div class="admin-content stack-lg">
      <section class="panel">
        <div class="panel-body toolbar">
          <div class="filters">
            <div style="width: 260px">
              <AdminSelect v-model="status" :options="orderFilterOptions" placeholder="Статус заказа" />
            </div>
          </div>
        </div>
      </section>

      <div v-if="pending" class="empty-state">Загружаю заказы...</div>
      <div v-else-if="orders?.items.length" class="order-grid">
        <article v-for="order in orders.items" :key="order.id" class="order-card">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Заказ #{{ order.id }}</h2>
              <p class="panel-description">
                {{ order.user?.name || order.user?.email || "Гость" }} · {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <div class="toolbar" style="justify-content: flex-end">
              <AdminStatusBadge :status="order.orderStatus" type="order" />
              <AdminStatusBadge v-if="order.payment" :status="order.payment.paymentStatus" type="payment" />
            </div>
          </div>

          <div class="order-card-body">
            <div class="mini-stat-grid">
              <div class="mini-stat">
                <p class="mini-stat-label">Сумма</p>
                <p class="mini-stat-value">{{ formatPrice(orderTotal(order)) }}</p>
              </div>
              <div class="mini-stat">
                <p class="mini-stat-label">Получение</p>
                <p class="mini-stat-value" style="font-size: 16px">{{ order.obtainingMethod === "PICKUP" ? "Самовывоз" : "Доставка" }}</p>
              </div>
              <div class="mini-stat">
                <p class="mini-stat-label">Метод оплаты</p>
                <p class="mini-stat-value" style="font-size: 16px">{{ order.paymentMethod === "ONLINE" ? "Онлайн" : "Офлайн" }}</p>
              </div>
              <div class="mini-stat">
                <p class="mini-stat-label">Позиций</p>
                <p class="mini-stat-value">{{ order.orderItems.length }}</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="field">
                <label :for="`order-status-${order.id}`">Статус заказа</label>
                <AdminSelect
                  :model-value="order.orderStatus"
                  :options="orderStatusOptions"
                  placeholder="Статус заказа"
                  :aria-label="`Статус заказа ${order.id}`"
                  :disabled="updating === `order-${order.id}`"
                  @update:model-value="changeOrderStatus(order.id, $event)"
                />
              </div>
              <div class="field">
                <label :for="`payment-status-${order.id}`">Статус оплаты</label>
                <AdminSelect
                  :model-value="order.payment?.paymentStatus || ''"
                  :options="paymentStatusOptions"
                  placeholder="Статус оплаты"
                  :aria-label="`Статус оплаты заказа ${order.id}`"
                  :disabled="!order.payment || updating === `payment-${order.id}`"
                  @update:model-value="changePaymentStatus(order.id, $event)"
                />
              </div>
            </div>

            <div v-if="order.delivery" class="answer-box">
              <strong>Доставка:</strong>
              {{ order.delivery.address }}
              <span v-if="order.delivery.apartment">, кв. {{ order.delivery.apartment }}</span>
              <span v-if="order.delivery.entrance">, подъезд {{ order.delivery.entrance }}</span>
              <span v-if="order.delivery.floor">, этаж {{ order.delivery.floor }}</span>
              <div v-if="order.delivery.comment" class="muted" style="margin-top: 6px">{{ order.delivery.comment }}</div>
            </div>

            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>Количество</th>
                    <th>Цена</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in order.orderItems" :key="item.product.id">
                    <td>
                      <div class="entity-cell">
                        <img class="thumb" :src="item.product.mainImage" :alt="item.product.name" />
                        <p class="entity-title">{{ item.product.name }}</p>
                      </div>
                    </td>
                    <td>{{ item.quantity }} шт.</td>
                    <td>{{ formatPrice(item.price) }}</td>
                    <td>{{ formatPrice(Number(item.price) * item.quantity) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <div v-if="orders.pagination.pages > 1" class="pagination">
          <button class="btn btn-secondary" type="button" :disabled="page <= 1" @click="page--">Назад</button>
          <span class="muted">Страница {{ orders.pagination.page }} из {{ orders.pagination.pages }}</span>
          <button class="btn btn-secondary" type="button" :disabled="page >= orders.pagination.pages" @click="page++">Вперед</button>
        </div>
      </div>

      <div v-else class="empty-state">
        <ShoppingCart style="width: 32px; height: 32px; margin-bottom: 8px" />
        Заказов пока нет
      </div>
    </div>
  </div>
</template>
