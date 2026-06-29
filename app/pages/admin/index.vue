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
const revenueChartHeight = 240;
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
  const innerHeight = revenueChartHeight - chartPadding * 2;
  const count = Math.max(salesByDay.value.length - 1, 1);

  return salesByDay.value.map((item, index) => ({
    x: chartPadding + (index / count) * innerWidth,
    y: revenueChartHeight - chartPadding - (Number(item.revenue) / maxRevenue.value) * innerHeight,
  }));
});

const revenuePolyline = computed(() => revenuePoints.value.map((point) => `${point.x},${point.y}`).join(" "));
</script>

<template>
  <div class="admin-page">
    <AdminHeader kicker="Dashboard" title="Обзор магазина"
      description="Продажи, заказы, склад и коммуникации за выбранный период" />

    <div class="admin-stack">
      <div v-if="pending" class="admin-loading">Загружаю аналитику...</div>
      <div v-else-if="error" class="admin-error">
        <AlertTriangle />
        <strong>Не удалось загрузить дашборд</strong>
        <span>Проверьте подключение к базе данных или повторите запрос.</span>
        <button class="admin-button-danger" type="button" @click="refresh()">Повторить</button>
      </div>

      <template v-else-if="data">
        <section class="admin-metrics-grid">
          <AdminMetricCard title="Товары" :value="data.stats.productsActive"
            :description="`${data.stats.productsTotal} товаров всего`" :icon="Package" />
          <AdminMetricCard title="Заказы" :value="data.stats.ordersTotal"
            :description="`${data.stats.ordersNew} новых заказов`" :icon="ShoppingCart" tone="teal" />
          <AdminMetricCard title="Выручка" :value="formatPrice(data.stats.revenuePaid)" description="Оплаченная выручка"
            :icon="TrendingUp" tone="amber" />
          <AdminMetricCard title="Низкий остаток" :value="data.stats.lowStock" description="Товаров с остатком ≤ 5"
            :icon="AlertTriangle" tone="red" />
        </section>

        <section class="admin-card">
          <div class="admin-card-header">
            <div>
              <h2 class="admin-card-heading">Аналитика продаж</h2>
              <p class="admin-card-copy">
                {{ formatShortDate(data.analytics.period.startDate) }} -
                {{ formatShortDate(data.analytics.period.endDate) }}
              </p>
            </div>
            <BarChart3 />
          </div>
          <div class="space-y-5">
            <div class="admin-filter-grid">
              <AdminSelect v-model="period" :options="periodOptions" placeholder="Период" />
              <AdminSelect v-model="selectedProductId" :options="productOptions" placeholder="Товар" />
              <AdminSelect v-model="sortBy" :options="sortOptions" placeholder="Сортировка" />
            </div>

            <div v-if="period === 'custom'" class="admin-form-grid-2">
              <div class="admin-field">
                <label for="custom-start">Начало периода</label>
                <input id="custom-start" v-model="customStart" type="date" />
              </div>
              <div class="admin-field">
                <label for="custom-end">Конец периода</label>
                <input id="custom-end" v-model="customEnd" type="date" />
              </div>
            </div>

            <div class="admin-stats-strip">
              <div class="admin-stat">
                <p class="admin-stat-label">Товар</p>
                <p class="admin-stat-value">{{ selectedProductName }}</p>
              </div>
              <div class="admin-stat">
                <p class="admin-stat-label">Продано</p>
                <p class="admin-stat-value">{{ data.analytics.totals.quantity }} шт.</p>
              </div>
              <div class="admin-stat">
                <p class="admin-stat-label">Заказов</p>
                <p class="admin-stat-value">{{ data.analytics.totals.orders }}</p>
              </div>
              <div class="admin-stat">
                <p class="admin-stat-label">Средний чек</p>
                <p class="admin-stat-value">{{ formatPrice(data.analytics.totals.averageOrderValue) }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-two-column">
          <article class="admin-card">
            <div class="admin-card-header">
              <div>
                <h2 class="admin-card-heading">Количество продаж</h2>
                <p class="admin-card-copy">{{ selectedProductName }}</p>
              </div>
              <BarChart3 />
            </div>
            <div class="admin-chart-wrap">
              <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img">
                <line :x1="chartPadding" :x2="chartWidth - chartPadding" :y1="chartHeight - chartPadding"
                  :y2="chartHeight - chartPadding" stroke="#d9e2ec" />
                <g v-for="item in bars" :key="item.date">
                  <rect :x="item.x" :y="item.y" :width="item.width" :height="item.height" rx="4" fill="#10b981"
                    opacity="0.86" />
                  <text v-if="item.showLabel" :x="item.x + item.width / 2" :y="chartHeight - 8" text-anchor="middle"
                    fill="#667085" font-size="10">
                    {{ item.label }}
                  </text>
                </g>
              </svg>
            </div>
          </article>

          <article class="admin-card">
            <div class="admin-card-header">
              <div>
                <h2 class="admin-card-heading">Выручка по дням</h2>
                <p class="admin-card-copy">{{ formatPrice(data.analytics.totals.revenue) }} за период</p>
              </div>
              <LineChart />
            </div>
            <div class="admin-chart-wrap">
              <svg :viewBox="`0 0 ${chartWidth} ${revenueChartHeight}`" role="img">
                <line :x1="chartPadding" :x2="chartWidth - chartPadding" :y1="revenueChartHeight - chartPadding"
                  :y2="revenueChartHeight - chartPadding" stroke="#d9e2ec" />
                <polyline v-if="revenuePolyline" :points="revenuePolyline" fill="none" stroke="#0f9f8f" stroke-width="2"
                  stroke-linecap="round" />
                <circle v-for="(point, index) in revenuePoints" :key="index" :cx="point.x" :cy="point.y" r="0"
                  fill="#ffffff" stroke="#0f9f8f" stroke-width="2" />
                <text :x="chartPadding" y="18" fill="#667085" font-size="11">{{ formatPrice(maxRevenue) }}</text>
              </svg>
            </div>
          </article>
        </section>

        <section class="admin-card">
          <div class="admin-card-header">
            <div>
              <h2 class="admin-card-heading">Лучшие товары</h2>
              <p class="admin-card-copy">Рейтинг за выбранный период</p>
            </div>
            <PackageSearch />
          </div>
          <div v-if="data.analytics.productSales.length" class="admin-data-list">
            <div
              class="admin-data-header lg:grid-cols-[70px_minmax(260px,1.6fr)_minmax(120px,0.8fr)_minmax(100px,0.7fr)_minmax(90px,0.6fr)_minmax(130px,0.8fr)]">
              <span>#</span>
              <span>Товар</span>
              <span>Артикул</span>
              <span>Продано</span>
              <span>Заказы</span>
              <span>Выручка</span>
            </div>
            <article v-for="(product, index) in data.analytics.productSales" :key="product.productId"
              class="admin-data-row lg:grid-cols-[70px_minmax(260px,1.6fr)_minmax(120px,0.8fr)_minmax(100px,0.7fr)_minmax(90px,0.6fr)_minmax(130px,0.8fr)]">
              <div class="admin-data-cell">
                <div class="admin-cell-label">#</div>
                <span class="badge-green">{{ index + 1 }}</span>
              </div>
              <div class="admin-data-cell">
                <div class="admin-cell-label">Товар</div>
                <div class="admin-product-cell">
                  <img class="admin-product-image" :src="product.mainImage" :alt="product.name" />
                  <p class="admin-product-name">{{ product.name }}</p>
                </div>
              </div>
              <div class="admin-data-cell">
                <div class="admin-cell-label">Артикул</div>
                <div class="admin-cell-value">{{ product.article }}</div>
              </div>
              <div class="admin-data-cell">
                <div class="admin-cell-label">Продано</div>
                <div class="admin-cell-value">{{ product.quantity }} шт.</div>
              </div>
              <div class="admin-data-cell">
                <div class="admin-cell-label">Заказы</div>
                <div class="admin-cell-value">{{ product.orders }}</div>
              </div>
              <div class="admin-data-cell">
                <div class="admin-cell-label">Выручка</div>
                <strong class="text-sm text-stone-950 dark:text-white">{{ formatPrice(product.revenue) }}</strong>
              </div>
            </article>
          </div>
          <div v-else class="admin-empty">За выбранный период оплаченных продаж нет</div>
        </section>

        <section class="grid gap-4 md:grid-cols-2">
          <AdminMetricCard title="Отзывы" :value="data.stats.reviewsPending" description="Отзывы без ответа"
            :icon="MessageSquare" tone="amber" to="/admin/reviews?pending=true" />
          <AdminMetricCard title="FAQ" :value="data.stats.faqPending" description="Вопросы FAQ без ответа"
            :icon="HelpCircle" tone="teal" to="/admin/faq?pending=true" />
        </section>

        <section class="admin-card">
          <div class="admin-card-header">
            <div>
              <h2 class="admin-card-heading">Последние заказы</h2>
              <p class="admin-card-copy">Пять свежих заказов в системе</p>
            </div>
          </div>
          <div v-if="data.recentOrders.length" class="admin-data-list">
            <div
              class="admin-data-header lg:grid-cols-[100px_minmax(190px,1fr)_minmax(130px,0.8fr)_minmax(120px,0.8fr)_minmax(160px,0.9fr)]">
              <span>Заказ</span>
              <span>Клиент</span>
              <span>Сумма</span>
              <span>Статус</span>
              <span>Дата</span>
            </div>
            <article v-for="order in data.recentOrders" :key="order.id"
              class="admin-data-row lg:grid-cols-[100px_minmax(190px,1fr)_minmax(130px,0.8fr)_minmax(120px,0.8fr)_minmax(160px,0.9fr)]">
              <div class="admin-data-cell">
                <div class="admin-cell-label">Заказ</div>
                <strong class="text-sm text-stone-950 dark:text-white">#{{ order.id }}</strong>
              </div>
              <div class="admin-data-cell">
                <div class="admin-cell-label">Клиент</div>
                <div class="admin-cell-value truncate">{{ order.user?.name || order.user?.email || "Гость" }}</div>
              </div>
              <div class="admin-data-cell">
                <div class="admin-cell-label">Сумма</div>
                <div class="admin-cell-value">{{ order.payment ? formatPrice(order.payment.amount) : "—" }}</div>
              </div>
              <div class="admin-data-cell">
                <div class="admin-cell-label">Статус</div>
                <AdminStatusBadge :status="order.orderStatus" type="order" />
              </div>
              <div class="admin-data-cell">
                <div class="admin-cell-label">Дата</div>
                <div class="admin-cell-value">{{ formatDate(order.createdAt) }}</div>
              </div>
            </article>
          </div>
          <div v-else class="admin-empty">Заказов пока нет</div>
        </section>
      </template>
    </div>
  </div>
</template>
