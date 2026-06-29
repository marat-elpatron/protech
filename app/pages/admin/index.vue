<script setup lang="ts">
import {
  AlertTriangle,
  BarChart3,
  HelpCircle,
  LineChart,
  MessageSquare,
  Package,
  PackageSearch,
  ShoppingCart,
  TrendingUp,
} from "@lucide/vue";
import { formatDate, formatPrice, formatShortDate } from "@/utils/adminFormat";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const period = ref("30");
const customStart = ref("");
const customEnd = ref("");
const selectedProductId = ref("all");
const sortBy = ref<"quantity" | "revenue" | "orders">("quantity");

const periodOptions = [
  { value: "7", label: "7 дней" },
  { value: "30", label: "30 дней" },
  { value: "90", label: "90 дней" },
  { value: "custom", label: "Свой период" },
];

const sortOptions = [
  { value: "quantity", label: "По количеству" },
  { value: "revenue", label: "По выручке" },
  { value: "orders", label: "По заказам" },
];

const dashboardQuery = computed(() => ({
  period: period.value,
  sortBy: sortBy.value,
  productId: selectedProductId.value === "all" ? undefined : Number(selectedProductId.value),
  startDate: period.value === "custom" ? customStart.value : undefined,
  endDate: period.value === "custom" ? customEnd.value : undefined,
}));

const { data, pending, error, refresh } = await useAsyncData(
  "admin-dashboard",
  () => api.getDashboard(dashboardQuery.value),
  { watch: [dashboardQuery] },
);

const chartWidth = 760;
const chartHeight = 240;
const chartPadding = 30;

const salesByDay = computed(() => data.value?.analytics.salesByDay ?? []);
const maxQuantity = computed(() => Math.max(1, ...salesByDay.value.map((item) => item.quantity)));
const maxRevenue = computed(() => Math.max(1, ...salesByDay.value.map((item) => Number(item.revenue))));
const selectedProductName = computed(() => {
  if (selectedProductId.value === "all") return "Все товары";
  return (
    data.value?.analytics.productOptions.find((item) => String(item.id) === selectedProductId.value)?.name ??
    "Выбранный товар"
  );
});
const productOptions = computed(() => [
  { value: "all", label: "Все товары" },
  ...(data.value?.analytics.productOptions.map((product) => ({
    value: String(product.id),
    label: product.name,
    description: product.article,
  })) ?? []),
]);

const bars = computed(() => {
  const innerWidth = chartWidth - chartPadding * 2;
  const innerHeight = chartHeight - chartPadding * 2;
  const count = Math.max(salesByDay.value.length, 1);
  const slot = innerWidth / count;
  const labelEvery = Math.max(1, Math.ceil(count / 6));

  return salesByDay.value.map((item, index) => {
    const height = Math.max(2, (item.quantity / maxQuantity.value) * innerHeight);
    return {
      ...item,
      x: chartPadding + index * slot + slot * 0.18,
      y: chartHeight - chartPadding - height,
      width: Math.max(slot * 0.64, 3),
      height,
      showLabel: index === 0 || index === count - 1 || index % labelEvery === 0,
    };
  });
});

const revenuePoints = computed(() => {
  const innerWidth = chartWidth - chartPadding * 2;
  const innerHeight = chartHeight - chartPadding * 2;
  const count = Math.max(salesByDay.value.length - 1, 1);

  return salesByDay.value.map((item, index) => ({
    x: chartPadding + (index / count) * innerWidth,
    y: chartHeight - chartPadding - (Number(item.revenue) / maxRevenue.value) * innerHeight,
  }));
});

const revenuePolyline = computed(() => revenuePoints.value.map((point) => `${point.x},${point.y}`).join(" "));
</script>

<template>
  <div>
    <AdminHeader
      kicker="Dashboard"
      title="Обзор магазина"
      description="Продажи, заказы, склад и коммуникации за выбранный период"
    />

    <div class="admin-content stack-lg">
      <div v-if="pending" class="empty-state">Загружаю аналитику...</div>
      <div v-else-if="error" class="empty-state">
        <div class="empty-state-content">
          <AlertTriangle style="width: 32px; height: 32px; color: var(--admin-red)" />
          <strong>Не удалось загрузить дашборд</strong>
          <span>Проверьте подключение к базе данных или повторите запрос.</span>
          <button class="btn btn-secondary" type="button" @click="refresh()">Повторить</button>
        </div>
      </div>

      <template v-else-if="data">
        <section class="metrics-grid">
          <AdminMetricCard
            title="Товары"
            :value="data.stats.productsActive"
            :description="`${data.stats.productsTotal} товаров всего`"
            :icon="Package"
          />
          <AdminMetricCard
            title="Заказы"
            :value="data.stats.ordersTotal"
            :description="`${data.stats.ordersNew} новых заказов`"
            :icon="ShoppingCart"
            tone="teal"
          />
          <AdminMetricCard
            title="Выручка"
            :value="formatPrice(data.stats.revenuePaid)"
            description="Оплаченная выручка"
            :icon="TrendingUp"
            tone="amber"
          />
          <AdminMetricCard
            title="Низкий остаток"
            :value="data.stats.lowStock"
            description="Товаров с остатком ≤ 5"
            :icon="AlertTriangle"
            tone="red"
          />
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Аналитика продаж</h2>
              <p class="panel-description">
                {{ formatShortDate(data.analytics.period.startDate) }} - {{ formatShortDate(data.analytics.period.endDate) }}
              </p>
            </div>
            <BarChart3 style="color: var(--admin-primary)" />
          </div>
          <div class="panel-body stack">
            <div class="form-grid-3">
              <AdminSelect v-model="period" :options="periodOptions" placeholder="Период" />
              <AdminSelect v-model="selectedProductId" :options="productOptions" placeholder="Товар" />
              <AdminSelect v-model="sortBy" :options="sortOptions" placeholder="Сортировка" />
            </div>

            <div v-if="period === 'custom'" class="form-grid">
              <div class="field">
                <label for="custom-start">Начало периода</label>
                <input id="custom-start" v-model="customStart" class="input" type="date" />
              </div>
              <div class="field">
                <label for="custom-end">Конец периода</label>
                <input id="custom-end" v-model="customEnd" class="input" type="date" />
              </div>
            </div>

            <div class="mini-stat-grid">
              <div class="mini-stat">
                <p class="mini-stat-label">Товар</p>
                <p class="mini-stat-value" style="font-size: 16px">{{ selectedProductName }}</p>
              </div>
              <div class="mini-stat">
                <p class="mini-stat-label">Продано</p>
                <p class="mini-stat-value">{{ data.analytics.totals.quantity }} шт.</p>
              </div>
              <div class="mini-stat">
                <p class="mini-stat-label">Заказов</p>
                <p class="mini-stat-value">{{ data.analytics.totals.orders }}</p>
              </div>
              <div class="mini-stat">
                <p class="mini-stat-label">Средний чек</p>
                <p class="mini-stat-value">{{ formatPrice(data.analytics.totals.averageOrderValue) }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="chart-grid">
          <article class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Количество продаж</h2>
                <p class="panel-description">{{ selectedProductName }}</p>
              </div>
              <BarChart3 style="color: var(--admin-primary)" />
            </div>
            <div class="panel-body">
              <div class="chart-shell">
                <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img">
                  <line
                    :x1="chartPadding"
                    :x2="chartWidth - chartPadding"
                    :y1="chartHeight - chartPadding"
                    :y2="chartHeight - chartPadding"
                    stroke="#d9e2ec"
                  />
                  <g v-for="item in bars" :key="item.date">
                    <rect :x="item.x" :y="item.y" :width="item.width" :height="item.height" rx="4" fill="#0f6fff" opacity="0.82" />
                    <text v-if="item.showLabel" :x="item.x + item.width / 2" :y="chartHeight - 8" text-anchor="middle" fill="#667085" font-size="10">
                      {{ item.label }}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Выручка по дням</h2>
                <p class="panel-description">{{ formatPrice(data.analytics.totals.revenue) }} за период</p>
              </div>
              <LineChart style="color: var(--admin-teal)" />
            </div>
            <div class="panel-body">
              <div class="chart-shell">
                <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img">
                  <line
                    :x1="chartPadding"
                    :x2="chartWidth - chartPadding"
                    :y1="chartHeight - chartPadding"
                    :y2="chartHeight - chartPadding"
                    stroke="#d9e2ec"
                  />
                  <polyline v-if="revenuePolyline" :points="revenuePolyline" fill="none" stroke="#0f9f8f" stroke-width="4" stroke-linecap="round" />
                  <circle v-for="(point, index) in revenuePoints" :key="index" :cx="point.x" :cy="point.y" r="4" fill="#ffffff" stroke="#0f9f8f" stroke-width="3" />
                  <text :x="chartPadding" y="18" fill="#667085" font-size="11">{{ formatPrice(maxRevenue) }}</text>
                </svg>
              </div>
            </div>
          </article>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Лучшие товары</h2>
              <p class="panel-description">Рейтинг за выбранный период</p>
            </div>
            <PackageSearch style="color: var(--admin-lime)" />
          </div>
          <div class="panel-body">
            <div v-if="data.analytics.productSales.length" class="mobile-card-list">
              <article
                v-for="(product, index) in data.analytics.productSales"
                :key="product.productId"
                class="mobile-data-card"
              >
                <div class="entity-cell">
                  <img class="thumb" :src="product.mainImage" :alt="product.name" />
                  <div>
                    <p class="entity-title">{{ index + 1 }}. {{ product.name }}</p>
                    <p class="entity-meta">{{ product.article }}</p>
                  </div>
                </div>
                <div class="mobile-data-grid">
                  <span>Продано <strong>{{ product.quantity }} шт.</strong></span>
                  <span>Заказы <strong>{{ product.orders }}</strong></span>
                  <span>Выручка <strong>{{ formatPrice(product.revenue) }}</strong></span>
                </div>
              </article>
            </div>
            <div v-if="data.analytics.productSales.length" class="table-wrap desktop-table">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Товар</th>
                    <th>Артикул</th>
                    <th>Продано</th>
                    <th>Заказы</th>
                    <th>Выручка</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(product, index) in data.analytics.productSales" :key="product.productId">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div class="entity-cell">
                        <img class="thumb" :src="product.mainImage" :alt="product.name" />
                        <p class="entity-title">{{ product.name }}</p>
                      </div>
                    </td>
                    <td>{{ product.article }}</td>
                    <td>{{ product.quantity }} шт.</td>
                    <td>{{ product.orders }}</td>
                    <td>{{ formatPrice(product.revenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">За выбранный период оплаченных продаж нет</div>
          </div>
        </section>

        <section class="chart-grid">
          <AdminMetricCard
            title="Отзывы"
            :value="data.stats.reviewsPending"
            description="Отзывы без ответа"
            :icon="MessageSquare"
            tone="amber"
            to="/admin/reviews?pending=true"
          />
          <AdminMetricCard
            title="FAQ"
            :value="data.stats.faqPending"
            description="Вопросы FAQ без ответа"
            :icon="HelpCircle"
            tone="teal"
            to="/admin/faq?pending=true"
          />
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Последние заказы</h2>
              <p class="panel-description">Пять свежих заказов в системе</p>
            </div>
          </div>
          <div class="panel-body">
            <div v-if="data.recentOrders.length" class="mobile-card-list">
              <article v-for="order in data.recentOrders" :key="order.id" class="mobile-data-card">
                <div class="mobile-card-header">
                  <strong>Заказ #{{ order.id }}</strong>
                  <AdminStatusBadge :status="order.orderStatus" type="order" />
                </div>
                <p class="entity-meta">{{ order.user?.name || order.user?.email || "Гость" }}</p>
                <div class="mobile-data-grid">
                  <span>Сумма <strong>{{ order.payment ? formatPrice(order.payment.amount) : "—" }}</strong></span>
                  <span>Дата <strong>{{ formatDate(order.createdAt) }}</strong></span>
                </div>
              </article>
            </div>
            <div v-if="data.recentOrders.length" class="table-wrap desktop-table">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Заказ</th>
                    <th>Клиент</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in data.recentOrders" :key="order.id">
                    <td>#{{ order.id }}</td>
                    <td>{{ order.user?.name || order.user?.email || "Гость" }}</td>
                    <td>{{ order.payment ? formatPrice(order.payment.amount) : "—" }}</td>
                    <td><AdminStatusBadge :status="order.orderStatus" type="order" /></td>
                    <td>{{ formatDate(order.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">Заказов пока нет</div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
