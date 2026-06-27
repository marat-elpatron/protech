<script setup lang="ts">
import {
  Package,
  ShoppingCart,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
} from "@lucide/vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
const { data, pending } = await useAsyncData("dashboard", () => api.getDashboard());

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
