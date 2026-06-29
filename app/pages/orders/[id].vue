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
  <main>
    <div>
      <NuxtLink to="/">
        <ArrowLeft aria-hidden="true" />
        На главную
      </NuxtLink>

      <section v-if="pending">
        <RefreshCcw aria-hidden="true" />
        Загружаем заказ
      </section>

      <section v-else-if="error">
        <ReceiptText aria-hidden="true" />
        <h1>Заказ не найден</h1>
        <button type="button" @click="refresh()">
          <RefreshCcw aria-hidden="true" />
          Обновить
        </button>
      </section>

      <template v-else-if="order">
        <header>
          <div>
            <p>Заказ от {{ formatDate(order.createdAt) }}</p>
            <h1>Заказ #{{ order.id }}</h1>
          </div>
          <span :class="statusTone">
            {{ order.payment ? paymentStatusLabels[order.payment.paymentStatus] : orderStatusLabels[order.orderStatus]
            }}
          </span>
        </header>

        <section>
          <div>
            <Wallet aria-hidden="true" />
            <div>
              <span>Оплата</span>
              <strong>{{ order.paymentMethod === "ONLINE" ? "Онлайн" : "При получении" }}</strong>
            </div>
          </div>
          <div>
            <Package aria-hidden="true" />
            <div>
              <span>Статус заказа</span>
              <strong>{{ orderStatusLabels[order.orderStatus] }}</strong>
            </div>
          </div>
          <div>
            <Truck aria-hidden="true" />
            <div>
              <span>Получение</span>
              <strong>{{ order.obtainingMethod === "DELIVERY" ? "Доставка" : "Самовывоз" }}</strong>
            </div>
          </div>
        </section>

        <section>
          <div>
            <h2>Состав заказа</h2>
            <strong>{{ formatPrice(total) }}</strong>
          </div>

          <div>
            <article v-for="item in order.orderItems" :key="item.id">
              <img :src="item.product.mainImage" :alt="item.product.name">
              <div>
                <h3>{{ item.product.name }}</h3>
                <p>{{ item.quantity }} шт. × {{ formatPrice(item.price) }}</p>
              </div>
              <strong>{{ formatPrice(Number(item.price) * item.quantity) }}</strong>
            </article>
          </div>
        </section>

        <section v-if="order.delivery">
          <div>
            <h2>Доставка</h2>
          </div>
          <p>
            {{ order.delivery.address }}
            <span v-if="order.delivery.apartment">, кв. {{ order.delivery.apartment }}</span>
            <span v-if="order.delivery.entrance">, подъезд {{ order.delivery.entrance }}</span>
            <span v-if="order.delivery.floor">, этаж {{ order.delivery.floor }}</span>
          </p>
          <p v-if="order.delivery.comment">{{ order.delivery.comment }}</p>
        </section>
      </template>
    </div>
  </main>
</template>
