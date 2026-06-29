<script setup lang="ts">
import { ArrowLeft, Package, ReceiptText, RefreshCcw, Truck, Wallet } from "@lucide/vue";

type OrderResponse = {
  id: number;
  orderStatus: "NEW" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  paymentMethod: "OFFLINE" | "ONLINE";
  obtainingMethod: "DELIVERY" | "PICKUP";
  createdAt: string;
  payment: {
    amount: number | string;
    paymentStatus: "PENDING" | "UPON_RECEIPT" | "PAID" | "CANCELLED";
    paidAt: string | null;
  } | null;
  delivery: {
    address: string;
    apartment: string | null;
    entrance: string | null;
    floor: string | null;
    intercom: string | null;
    comment: string | null;
  } | null;
  orderItems: {
    id: number;
    quantity: number;
    price: number | string;
    product: {
      id: number;
      name: string;
      mainImage: string;
    };
  }[];
};

const route = useRoute();
const orderId = computed(() => String(route.params.id));

const { data: order, error, pending, refresh } = await useFetch<OrderResponse>(
  () => `/api/public/orders/${orderId.value}`,
  {
    credentials: "include"
  }
);

const orderStatusLabels: Record<OrderResponse["orderStatus"], string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  PROCESSING: "В сборке",
  SHIPPED: "Отправлен",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён"
};

const paymentStatusLabels: Record<NonNullable<OrderResponse["payment"]>["paymentStatus"], string> = {
  PENDING: "Ожидает оплаты",
  UPON_RECEIPT: "При получении",
  PAID: "Оплачен",
  CANCELLED: "Отменён"
};

const statusTone = computed(() => {
  const status = order.value?.payment?.paymentStatus ?? order.value?.orderStatus;
  if (status === "PAID" || status === "CONFIRMED" || status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "danger";
  return "pending";
});

const total = computed(() => {
  if (order.value?.payment) return Number(order.value.payment.amount);

  return order.value?.orderItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  ) ?? 0;
});

function formatPrice(value: number | string | null | undefined) {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(Number.isFinite(number) ? number : 0);
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

useHead(() => ({
  title: order.value ? `Заказ #${order.value.id}` : "Заказ"
}));
</script>

<template>
  <main class="order-page">
    <div class="order-shell">
      <NuxtLink class="back-link" to="/">
        <ArrowLeft aria-hidden="true" />
        На главную
      </NuxtLink>

      <section v-if="pending" class="state-box">
        <RefreshCcw class="spin" aria-hidden="true" />
        Загружаем заказ
      </section>

      <section v-else-if="error" class="state-box">
        <ReceiptText aria-hidden="true" />
        <h1>Заказ не найден</h1>
        <p>{{ error.statusCode === 401 ? "Войдите в аккаунт, чтобы посмотреть заказ." : "Проверьте номер заказа или обновите страницу." }}</p>
        <button class="order-button" type="button" @click="refresh()">
          <RefreshCcw aria-hidden="true" />
          Обновить
        </button>
      </section>

      <template v-else-if="order">
        <header class="order-header">
          <div>
            <p class="eyebrow">Заказ от {{ formatDate(order.createdAt) }}</p>
            <h1>Заказ #{{ order.id }}</h1>
          </div>
          <span class="status-pill" :class="statusTone">
            {{ order.payment ? paymentStatusLabels[order.payment.paymentStatus] : orderStatusLabels[order.orderStatus] }}
          </span>
        </header>

        <section class="summary-grid">
          <div class="summary-item">
            <Wallet aria-hidden="true" />
            <div>
              <span>Оплата</span>
              <strong>{{ order.paymentMethod === "ONLINE" ? "Онлайн" : "При получении" }}</strong>
            </div>
          </div>
          <div class="summary-item">
            <Package aria-hidden="true" />
            <div>
              <span>Статус заказа</span>
              <strong>{{ orderStatusLabels[order.orderStatus] }}</strong>
            </div>
          </div>
          <div class="summary-item">
            <Truck aria-hidden="true" />
            <div>
              <span>Получение</span>
              <strong>{{ order.obtainingMethod === "DELIVERY" ? "Доставка" : "Самовывоз" }}</strong>
            </div>
          </div>
        </section>

        <section class="order-section">
          <div class="section-heading">
            <h2>Состав заказа</h2>
            <strong>{{ formatPrice(total) }}</strong>
          </div>

          <div class="items-list">
            <article v-for="item in order.orderItems" :key="item.id" class="order-item">
              <img :src="item.product.mainImage" :alt="item.product.name">
              <div>
                <h3>{{ item.product.name }}</h3>
                <p>{{ item.quantity }} шт. × {{ formatPrice(item.price) }}</p>
              </div>
              <strong>{{ formatPrice(Number(item.price) * item.quantity) }}</strong>
            </article>
          </div>
        </section>

        <section v-if="order.delivery" class="order-section">
          <div class="section-heading">
            <h2>Доставка</h2>
          </div>
          <p class="delivery-text">
            {{ order.delivery.address }}
            <span v-if="order.delivery.apartment">, кв. {{ order.delivery.apartment }}</span>
            <span v-if="order.delivery.entrance">, подъезд {{ order.delivery.entrance }}</span>
            <span v-if="order.delivery.floor">, этаж {{ order.delivery.floor }}</span>
          </p>
          <p v-if="order.delivery.comment" class="muted">{{ order.delivery.comment }}</p>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.order-page {
  min-height: 100vh;
  padding: 32px 16px;
  background: var(--admin-bg);
}

.order-shell {
  width: min(920px, 100%);
  margin: 0 auto;
}

.back-link,
.order-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: var(--admin-surface);
  color: var(--admin-text);
  padding: 9px 12px;
  font-size: 14px;
  font-weight: 700;
}

.back-link svg,
.order-button svg,
.summary-item svg,
.state-box svg {
  width: 18px;
  height: 18px;
}

.order-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-top: 28px;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--admin-muted);
  font-size: 13px;
  font-weight: 700;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: 32px;
  line-height: 1.15;
}

h2 {
  font-size: 18px;
}

h3 {
  font-size: 15px;
}

.status-pill {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 800;
}

.status-pill.success {
  background: rgb(15 159 143 / 12%);
  color: var(--admin-teal);
}

.status-pill.pending {
  background: rgb(15 111 255 / 12%);
  color: var(--admin-primary-strong);
}

.status-pill.danger {
  background: rgb(217 45 32 / 12%);
  color: var(--admin-red);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item,
.order-section,
.state-box {
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-soft);
}

.summary-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 16px;
}

.summary-item svg {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--admin-bg-soft);
  color: var(--admin-primary);
  padding: 9px;
}

.summary-item span,
.muted {
  color: var(--admin-muted);
  font-size: 13px;
}

.summary-item strong {
  display: block;
  margin-top: 3px;
  font-size: 15px;
}

.order-section {
  margin-top: 16px;
  padding: 18px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.items-list {
  display: grid;
  gap: 10px;
}

.order-item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  border-top: 1px solid var(--admin-line);
  padding-top: 10px;
}

.order-item:first-child {
  border-top: 0;
  padding-top: 0;
}

.order-item img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--admin-bg-soft);
}

.order-item p,
.delivery-text {
  margin-top: 5px;
  color: var(--admin-muted);
}

.state-box {
  display: grid;
  place-items: center;
  gap: 10px;
  margin-top: 28px;
  padding: 36px 20px;
  text-align: center;
}

.spin {
  animation: spin 850ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .order-header,
  .section-heading {
    display: grid;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .order-item {
    grid-template-columns: 56px minmax(0, 1fr);
  }

  .order-item strong {
    grid-column: 2;
  }
}
</style>
