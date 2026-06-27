<script setup lang="ts">
import { toast } from "vue-sonner";
import { Eye, ShoppingCart } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderItem } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const statusFilter = ref("all");
const page = ref(1);
const selectedOrder = ref<OrderItem | null>(null);
const updating = ref(false);

const orderStatuses = ["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];
const paymentStatuses = ["PENDING", "UPON_RECEIPT", "PAID", "CANCELLED"];

const { data, pending, refresh } = await useAsyncData(
  "orders",
  () =>
    api.getOrders({
      page: page.value,
      status: statusFilter.value === "all" ? undefined : statusFilter.value,
    }),
  { watch: [page, statusFilter] },
);

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(Number(value));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

async function updateOrderStatus(orderId: number, orderStatus: string) {
  updating.value = true;
  try {
    await api.updateOrderStatus(orderId, orderStatus);
    toast.success("Статус заказа обновлён");
    await refresh();
    if (selectedOrder.value?.id === orderId) {
      selectedOrder.value = data.value?.items.find((o) => o.id === orderId) ?? null;
    }
  } catch {
    toast.error("Ошибка обновления");
  } finally {
    updating.value = false;
  }
}

async function updatePaymentStatus(orderId: number, paymentMethod: string) {
  updating.value = true;
  try {
    await api.updatePaymentStatus(orderId, paymentMethod);
    toast.success("Статус оплаты обновлён");
    await refresh();
    if (selectedOrder.value?.id === orderId) {
      selectedOrder.value = data.value?.items.find((o) => o.id === orderId) ?? null;
    }
  } catch {
    toast.error("Ошибка обновления");
  } finally {
    updating.value = false;
  }
}
</script>

<template>
  <div>
    <AdminHeader title="Заказы" description="Управление заказами и оплатой"
      :breadcrumbs="[{ label: 'Admin', href: '/admin' }, { label: 'Заказы' }]" />

    <div class="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <Select v-model="statusFilter">
        <SelectTrigger class="w-full sm:w-52">
          <SelectValue placeholder="Статус заказа" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem v-for="s in orderStatuses" :key="s" :value="s">{{ s }}</SelectItem>
        </SelectContent>
      </Select>

      <Card>
        <CardContent class="p-0">
          <div v-if="pending" class="space-y-3 p-4">
            <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
          </div>

          <Table v-else-if="data?.items.length">
            <TableHeader>
              <TableRow>
                <TableHead>№</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Оплата</TableHead>
                <TableHead>Доставка</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead class="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="order in data.items" :key="order.id">
                <TableCell class="font-medium">#{{ order.id }}</TableCell>
                <TableCell>{{ order.user?.name || order.user?.email || "Гость" }}</TableCell>
                <TableCell>{{ order.payment ? formatPrice(order.payment.amount) : "—" }}</TableCell>
                <TableCell>
                  <AdminStatusBadge v-if="order.payment" :status="order.payment.paymentStatus" type="payment" />
                </TableCell>
                <TableCell>{{ order.obtainingMethod === "DELIVERY" ? "Доставка" : "Самовывоз" }}</TableCell>
                <TableCell>
                  <AdminStatusBadge :status="order.orderStatus" type="order" />
                </TableCell>
                <TableCell class="text-sm text-muted-foreground">{{ formatDate(order.createdAt) }}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" @click="selectedOrder = order">
                    <Eye class="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div v-else class="flex flex-col items-center gap-3 py-16">
            <ShoppingCart class="size-12 text-muted-foreground/40" />
            <p class="text-muted-foreground">Заказов не найдено</p>
          </div>
        </CardContent>
      </Card>

      <div v-if="data && data.pagination.pages > 1" class="flex justify-center gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--">Назад</Button>
        <span class="flex items-center px-3 text-sm text-muted-foreground">{{ page }} / {{ data.pagination.pages
          }}</span>
        <Button variant="outline" size="sm" :disabled="page >= data.pagination.pages" @click="page++">Далее</Button>
      </div>
    </div>

    <Sheet :open="!!selectedOrder" @update:open="selectedOrder = null">
      <SheetContent class="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader v-if="selectedOrder">
          <SheetTitle>Заказ #{{ selectedOrder.id }}</SheetTitle>
        </SheetHeader>

        <div v-if="selectedOrder" class="mt-6 space-y-6">
          <div class="space-y-2 text-sm">
            <p><span class="text-muted-foreground">Клиент:</span> {{ selectedOrder.user?.name ||
              selectedOrder.user?.email }}</p>
            <p><span class="text-muted-foreground">Дата:</span> {{ formatDate(selectedOrder.createdAt) }}</p>
            <p><span class="text-muted-foreground">Способ получения:</span> {{ selectedOrder.obtainingMethod ===
              "DELIVERY" ? "Доставка" : "Самовывоз" }}</p>
            <p v-if="selectedOrder.delivery"><span class="text-muted-foreground">Адрес:</span> {{
              selectedOrder.delivery.address }}</p>
          </div>

          <Separator />

          <div>
            <h4 class="mb-3 text-sm font-medium">Товары</h4>
            <div class="space-y-3">
              <div v-for="item in selectedOrder.orderItems" :key="item.product.id" class="flex gap-3">
                <img :src="item.product.mainImage" class="size-12 rounded-md object-cover" />
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ item.product.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ item.quantity }} × {{ formatPrice(item.price) }}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div class="space-y-3">
            <div class="space-y-2">
              <Label>Статус заказа</Label>
              <Select :model-value="selectedOrder.orderStatus" :disabled="updating"
                @update:model-value="updateOrderStatus(selectedOrder!.id, $event as string)">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in orderStatuses" :key="s" :value="s">{{ s }}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="selectedOrder.payment" class="space-y-2">
              <Label>Статус оплаты</Label>
              <Select :model-value="selectedOrder.payment.paymentStatus" :disabled="updating"
                @update:model-value="updatePaymentStatus(selectedOrder!.id, $event as string)">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in paymentStatuses" :key="s" :value="s">{{ s }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div v-if="selectedOrder.payment" class="rounded-lg bg-muted p-4">
            <p class="text-sm text-muted-foreground">Итого</p>
            <p class="text-2xl font-bold">{{ formatPrice(selectedOrder.payment.amount) }}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
