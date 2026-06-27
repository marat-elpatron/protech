<script setup lang="ts">
import {
  Package,
  ShoppingCart,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  LineChart,
  PackageSearch,
} from "@lucide/vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const period = ref("30");
const customStart = ref("");
const customEnd = ref("");
const selectedProductId = ref("all");
const sortBy = ref<"quantity" | "revenue" | "orders">("quantity");

const dashboardQuery = computed(() => ({
  period: period.value,
  sortBy: sortBy.value,
  productId: selectedProductId.value === "all" ? undefined : Number(selectedProductId.value),
  startDate: period.value === "custom" ? customStart.value || undefined : undefined,
  endDate: period.value === "custom" ? customEnd.value || undefined : undefined,
}));

const { data, pending } = await useAsyncData(
  "dashboard",
  () => api.getDashboard(dashboardQuery.value),
  { watch: [period, customStart, customEnd, selectedProductId, sortBy] },
);

const chartWidth = 720;
const chartHeight = 220;
const chartPadding = 28;

const salesByDay = computed(() => data.value?.analytics.salesByDay ?? []);
const maxQuantity = computed(() => Math.max(...salesByDay.value.map((item) => item.quantity), 1));
const maxRevenue = computed(() => Math.max(...salesByDay.value.map((item) => Number(item.revenue)), 1));
const barChartItems = computed(() => {
  const innerWidth = chartWidth - chartPadding * 2;
  const innerHeight = chartHeight - chartPadding * 2;
  const count = Math.max(salesByDay.value.length, 1);
  const slotWidth = innerWidth / count;

  return salesByDay.value.map((item, index) => {
    const height = (item.quantity / maxQuantity.value) * innerHeight;

    return {
      ...item,
      x: chartPadding + index * slotWidth + slotWidth * 0.15,
      y: chartHeight - chartPadding - height,
      width: Math.max(slotWidth * 0.7, 2),
      height,
      showLabel: index === 0 || index === salesByDay.value.length - 1 || index % Math.ceil(count / 6) === 0,
    };
  });
});
const revenueLinePoints = computed(() => {
  const innerWidth = chartWidth - chartPadding * 2;
  const innerHeight = chartHeight - chartPadding * 2;
  const count = Math.max(salesByDay.value.length - 1, 1);

  return salesByDay.value
    .map((item, index) => {
      const x = chartPadding + (index / count) * innerWidth;
      const y = chartHeight - chartPadding - (Number(item.revenue) / maxRevenue.value) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
});
const selectedProductName = computed(() => {
  if (selectedProductId.value === "all") return "Все товары";

  return (
    data.value?.analytics.productOptions.find((item) => String(item.id) === selectedProductId.value)?.name ??
    "Выбранный товар"
  );
});

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}
</script>

<template>
  <div>
    <AdminHeader
      title="Обзор"
      description="Сводка по магазину Protech"
      :breadcrumbs="[{ label: 'Admin', href: '/admin' }, { label: 'Обзор' }]"
    />

    <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div v-if="pending" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="i in 4" :key="i" class="h-32 rounded-xl" />
      </div>

      <div v-else-if="data" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Товары"
          :value="data.stats.productsActive"
          :description="`${data.stats.productsTotal} всего`"
          :icon="Package"
        />
        <AdminStatCard
          title="Заказы"
          :value="data.stats.ordersTotal"
          :description="`${data.stats.ordersNew} новых`"
          :icon="ShoppingCart"
        />
        <AdminStatCard
          title="Выручка"
          :value="formatPrice(data.stats.revenuePaid)"
          description="Оплаченные заказы"
          :icon="TrendingUp"
        />
        <AdminStatCard
          title="Низкий остаток"
          :value="data.stats.lowStock"
          description="Товаров ≤ 5 шт."
          :icon="AlertTriangle"
        />
      </div>

      <Card v-if="data" class="admin-card">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <BarChart3 class="size-4 text-primary" />
            Аналитика продаж
          </CardTitle>
          <CardDescription>
            {{ formatShortDate(data.analytics.period.startDate) }} - {{ formatShortDate(data.analytics.period.endDate) }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="grid gap-3 lg:grid-cols-[180px_1fr_180px]">
            <Select v-model="period">
              <SelectTrigger>
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 дней</SelectItem>
                <SelectItem value="30">30 дней</SelectItem>
                <SelectItem value="90">90 дней</SelectItem>
                <SelectItem value="custom">Свой период</SelectItem>
              </SelectContent>
            </Select>

            <div class="grid gap-3 sm:grid-cols-2">
              <Input
                v-model="customStart"
                type="date"
                :disabled="period !== 'custom'"
                aria-label="Дата начала периода"
              />
              <Input
                v-model="customEnd"
                type="date"
                :disabled="period !== 'custom'"
                aria-label="Дата окончания периода"
              />
            </div>

            <Select v-model="sortBy">
              <SelectTrigger>
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity">По количеству</SelectItem>
                <SelectItem value="revenue">По выручке</SelectItem>
                <SelectItem value="orders">По заказам</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-3 lg:grid-cols-[1fr_220px_220px_220px]">
            <Select v-model="selectedProductId">
              <SelectTrigger>
                <SelectValue placeholder="Товар" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все товары</SelectItem>
                <SelectItem
                  v-for="product in data.analytics.productOptions"
                  :key="product.id"
                  :value="String(product.id)"
                >
                  {{ product.name }} · {{ product.article }}
                </SelectItem>
              </SelectContent>
            </Select>
            <div class="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p class="text-xs text-muted-foreground">Продано</p>
              <p class="text-xl font-semibold">{{ data.analytics.totals.quantity }} шт.</p>
            </div>
            <div class="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p class="text-xs text-muted-foreground">Заказов</p>
              <p class="text-xl font-semibold">{{ data.analytics.totals.orders }}</p>
            </div>
            <div class="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p class="text-xs text-muted-foreground">Выручка</p>
              <p class="text-xl font-semibold">{{ formatPrice(data.analytics.totals.revenue) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div v-if="data" class="grid gap-4 xl:grid-cols-2">
        <Card class="admin-card">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <BarChart3 class="size-4 text-primary" />
              Количество продаж
            </CardTitle>
            <CardDescription>{{ selectedProductName }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="h-72 w-full overflow-hidden">
              <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="size-full" role="img">
                <line
                  :x1="chartPadding"
                  :x2="chartWidth - chartPadding"
                  :y1="chartHeight - chartPadding"
                  :y2="chartHeight - chartPadding"
                  class="stroke-border"
                />
                <g v-for="item in barChartItems" :key="item.date">
                  <rect
                    :x="item.x"
                    :y="item.y"
                    :width="item.width"
                    :height="item.height"
                    rx="3"
                    class="fill-primary/75"
                  />
                  <text
                    v-if="item.showLabel"
                    :x="item.x + item.width / 2"
                    :y="chartHeight - 8"
                    text-anchor="middle"
                    class="fill-muted-foreground text-[10px]"
                  >
                    {{ item.label }}
                  </text>
                </g>
              </svg>
            </div>
            <p v-if="!data.analytics.totals.quantity" class="mt-3 text-center text-sm text-muted-foreground">
              За выбранный период продаж нет
            </p>
          </CardContent>
        </Card>

        <Card class="admin-card">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <LineChart class="size-4 text-primary" />
              Выручка по дням
            </CardTitle>
            <CardDescription>{{ selectedProductName }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="h-72 w-full overflow-hidden">
              <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="size-full" role="img">
                <line
                  :x1="chartPadding"
                  :x2="chartWidth - chartPadding"
                  :y1="chartHeight - chartPadding"
                  :y2="chartHeight - chartPadding"
                  class="stroke-border"
                />
                <polyline
                  v-if="salesByDay.length"
                  :points="revenueLinePoints"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  class="text-primary"
                />
                <circle
                  v-for="(point, index) in revenueLinePoints.split(' ').filter(Boolean)"
                  :key="`${point}-${index}`"
                  :cx="Number(point.split(',')[0])"
                  :cy="Number(point.split(',')[1])"
                  r="3"
                  class="fill-background stroke-primary"
                  stroke-width="2"
                />
                <text
                  :x="chartPadding"
                  y="16"
                  class="fill-muted-foreground text-[11px]"
                >
                  {{ formatPrice(maxRevenue) }}
                </text>
              </svg>
            </div>
            <p class="mt-3 text-sm text-muted-foreground">
              Средний чек: {{ formatPrice(data.analytics.totals.averageOrderValue) }}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card v-if="data" class="admin-card">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <PackageSearch class="size-4 text-primary" />
            Лучшие товары за период
          </CardTitle>
          <CardDescription>Сортировка применяется к выбранному периоду</CardDescription>
        </CardHeader>
        <CardContent>
          <Table v-if="data.analytics.productSales.length">
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">№</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Продано</TableHead>
                <TableHead>Заказов</TableHead>
                <TableHead>Выручка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(product, index) in data.analytics.productSales" :key="product.productId">
                <TableCell class="text-muted-foreground">{{ index + 1 }}</TableCell>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <img :src="product.mainImage" :alt="product.name" class="size-10 rounded-md object-cover" />
                    <span class="font-medium">{{ product.name }}</span>
                  </div>
                </TableCell>
                <TableCell class="text-muted-foreground">{{ product.article }}</TableCell>
                <TableCell>{{ product.quantity }} шт.</TableCell>
                <TableCell>{{ product.orders }}</TableCell>
                <TableCell>{{ formatPrice(product.revenue) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p v-else class="py-8 text-center text-sm text-muted-foreground">
            За выбранный период нет оплаченных продаж
          </p>
        </CardContent>
      </Card>

      <div v-if="data" class="grid gap-4 md:grid-cols-2">
        <Card class="admin-card">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <MessageSquare class="size-4 text-primary" />
              Отзывы без ответа
            </CardTitle>
            <CardDescription>Требуют внимания модератора</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">{{ data.stats.reviewsPending }}</div>
            <NuxtLink to="/admin/reviews?pending=true" class="mt-2 inline-block text-sm text-primary hover:underline">
              Перейти к отзывам →
            </NuxtLink>
          </CardContent>
        </Card>

        <Card class="admin-card">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <HelpCircle class="size-4 text-primary" />
              Вопросы FAQ
            </CardTitle>
            <CardDescription>Ожидают ответа</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">{{ data.stats.faqPending }}</div>
            <NuxtLink to="/admin/faq?pending=true" class="mt-2 inline-block text-sm text-primary hover:underline">
              Перейти к FAQ →
            </NuxtLink>
          </CardContent>
        </Card>
      </div>

      <Card class="admin-card">
        <CardHeader>
          <CardTitle>Последние заказы</CardTitle>
          <CardDescription>5 последних заказов в системе</CardDescription>
        </CardHeader>
        <CardContent>
          <Table v-if="data?.recentOrders.length">
            <TableHeader>
              <TableRow>
                <TableHead>№</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="order in data.recentOrders" :key="order.id">
                <TableCell class="font-medium">#{{ order.id }}</TableCell>
                <TableCell>{{ order.user?.name || order.user?.email || "—" }}</TableCell>
                <TableCell>{{ order.payment ? formatPrice(order.payment.amount) : "—" }}</TableCell>
                <TableCell>
                  <AdminStatusBadge :status="order.orderStatus" type="order" />
                </TableCell>
                <TableCell class="text-muted-foreground">{{ formatDate(order.createdAt) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p v-else class="py-8 text-center text-sm text-muted-foreground">Заказов пока нет</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
