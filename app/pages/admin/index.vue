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
    <AdminHeader kicker="Dashboard" title="Обзор магазина"
      description="Продажи, заказы, склад и коммуникации за выбранный период" />

    <div>
      <div v-if="pending">Загружаю аналитику...</div>
      <div v-else-if="error">
        <div>
          <AlertTriangle />
          <strong>Не удалось загрузить дашборд</strong>
          <span>Проверьте подключение к базе данных или повторите запрос.</span>
          <button type="button" @click="refresh()">Повторить</button>
        </div>
      </div>

      <template v-else-if="data">
        <section>
          <AdminMetricCard title="Товары" :value="data.stats.productsActive"
            :description="`${data.stats.productsTotal} товаров всего`" :icon="Package" />
          <AdminMetricCard title="Заказы" :value="data.stats.ordersTotal"
            :description="`${data.stats.ordersNew} новых заказов`" :icon="ShoppingCart" tone="teal" />
          <AdminMetricCard title="Выручка" :value="formatPrice(data.stats.revenuePaid)" description="Оплаченная выручка"
            :icon="TrendingUp" tone="amber" />
          <AdminMetricCard title="Низкий остаток" :value="data.stats.lowStock" description="Товаров с остатком ≤ 5"
            :icon="AlertTriangle" tone="red" />
        </section>

        <section>
          <div>
            <div>
              <h2>Аналитика продаж</h2>
              <p>
                {{ formatShortDate(data.analytics.period.startDate) }} - {{
                  formatShortDate(data.analytics.period.endDate) }}
              </p>
            </div>
            <BarChart3 />
          </div>
          <div>
            <div>
              <AdminSelect v-model="period" :options="periodOptions" placeholder="Период" />
              <AdminSelect v-model="selectedProductId" :options="productOptions" placeholder="Товар" />
              <AdminSelect v-model="sortBy" :options="sortOptions" placeholder="Сортировка" />
            </div>

            <div v-if="period === 'custom'">
              <div>
                <label for="custom-start">Начало периода</label>
                <input id="custom-start" v-model="customStart" type="date" />
              </div>
              <div>
                <label for="custom-end">Конец периода</label>
                <input id="custom-end" v-model="customEnd" type="date" />
              </div>
            </div>

            <div>
              <div>
                <p>Товар</p>
                <p>{{ selectedProductName }}</p>
              </div>
              <div>
                <p>Продано</p>
                <p>{{ data.analytics.totals.quantity }} шт.</p>
              </div>
              <div>
                <p>Заказов</p>
                <p>{{ data.analytics.totals.orders }}</p>
              </div>
              <div>
                <p>Средний чек</p>
                <p>{{ formatPrice(data.analytics.totals.averageOrderValue) }}</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <article>
            <div>
              <div>
                <h2>Количество продаж</h2>
                <p>{{ selectedProductName }}</p>
              </div>
              <BarChart3 />
            </div>
            <div>
              <div>
                <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img">
                  <line :x1="chartPadding" :x2="chartWidth - chartPadding" :y1="chartHeight - chartPadding"
                    :y2="chartHeight - chartPadding" stroke="#d9e2ec" />
                  <g v-for="item in bars" :key="item.date">
                    <rect :x="item.x" :y="item.y" :width="item.width" :height="item.height" rx="4" fill="#0f6fff"
                      opacity="0.82" />
                    <text v-if="item.showLabel" :x="item.x + item.width / 2" :y="chartHeight - 8" text-anchor="middle"
                      fill="#667085" font-size="10">
                      {{ item.label }}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </article>

          <article>
            <div>
              <div>
                <h2>Выручка по дням</h2>
                <p>{{ formatPrice(data.analytics.totals.revenue) }} за период</p>
              </div>
              <LineChart />
            </div>
            <div>
              <div>
                <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img">
                  <line :x1="chartPadding" :x2="chartWidth - chartPadding" :y1="chartHeight - chartPadding"
                    :y2="chartHeight - chartPadding" stroke="#d9e2ec" />
                  <polyline v-if="revenuePolyline" :points="revenuePolyline" fill="none" stroke="#0f9f8f"
                    stroke-width="4" stroke-linecap="round" />
                  <circle v-for="(point, index) in revenuePoints" :key="index" :cx="point.x" :cy="point.y" r="4"
                    fill="#ffffff" stroke="#0f9f8f" stroke-width="3" />
                  <text :x="chartPadding" y="18" fill="#667085" font-size="11">{{ formatPrice(maxRevenue) }}</text>
                </svg>
              </div>
            </div>
          </article>
        </section>

        <section>
          <div>
            <div>
              <h2>Лучшие товары</h2>
              <p>Рейтинг за выбранный период</p>
            </div>
            <PackageSearch />
          </div>
          <div>
            <div v-if="data.analytics.productSales.length">
              <article v-for="(product, index) in data.analytics.productSales" :key="product.productId">
                <div>
                  <img :src="product.mainImage" :alt="product.name" />
                  <div>
                    <p>{{ index + 1 }}. {{ product.name }}</p>
                    <p>{{ product.article }}</p>
                  </div>
                </div>
                <div>
                  <span>Продано <strong>{{ product.quantity }} шт.</strong></span>
                  <span>Заказы <strong>{{ product.orders }}</strong></span>
                  <span>Выручка <strong>{{ formatPrice(product.revenue) }}</strong></span>
                </div>
              </article>
            </div>
            <div v-if="data.analytics.productSales.length">
              <table>
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
                      <div>
                        <img :src="product.mainImage" :alt="product.name" />
                        <p>{{ product.name }}</p>
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
            <div v-else>За выбранный период оплаченных продаж нет</div>
          </div>
        </section>

        <section>
          <AdminMetricCard title="Отзывы" :value="data.stats.reviewsPending" description="Отзывы без ответа"
            :icon="MessageSquare" tone="amber" to="/admin/reviews?pending=true" />
          <AdminMetricCard title="FAQ" :value="data.stats.faqPending" description="Вопросы FAQ без ответа"
            :icon="HelpCircle" tone="teal" to="/admin/faq?pending=true" />
        </section>

        <section>
          <div>
            <div>
              <h2>Последние заказы</h2>
              <p>Пять свежих заказов в системе</p>
            </div>
          </div>
          <div>
            <div v-if="data.recentOrders.length">
              <article v-for="order in data.recentOrders" :key="order.id">
                <div>
                  <strong>Заказ #{{ order.id }}</strong>
                  <AdminStatusBadge :status="order.orderStatus" type="order" />
                </div>
                <p>{{ order.user?.name || order.user?.email || "Гость" }}</p>
                <div>
                  <span>Сумма <strong>{{ order.payment ? formatPrice(order.payment.amount) : "—" }}</strong></span>
                  <span>Дата <strong>{{ formatDate(order.createdAt) }}</strong></span>
                </div>
              </article>
            </div>
            <div v-if="data.recentOrders.length">
              <table>
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
                    <td>
                      <AdminStatusBadge :status="order.orderStatus" type="order" />
                    </td>
                    <td>{{ formatDate(order.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else>Заказов пока нет</div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
