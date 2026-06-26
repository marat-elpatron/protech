<script setup lang="ts">
import { toast } from "vue-sonner";
import { History, Plus } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

definePageMeta({ layout: "admin", middleware: "admin" });

const route = useRoute();
const api = useAdminApi();
const productId = Number(route.params.id);

const loading = ref(false);
const priceDialog = ref(false);
const newPrice = ref(0);
const priceLoading = ref(false);

const [{ data: product, refresh: refreshProduct }, { data: categories }, { data: attributes }, { data: prices, refresh: refreshPrices }] =
  await Promise.all([
    useAsyncData(`product-${productId}`, () => api.getProduct(productId)),
    useAsyncData("categories", () => api.getCategories()),
    useAsyncData("attributes", () => api.getAttributes()),
    useAsyncData(`prices-${productId}`, () => api.getPrices(productId)),
  ]);

async function handleSubmit(data: Record<string, unknown>) {
  loading.value = true;
  try {
    await api.updateProduct(productId, data);
    toast.success("Товар обновлён");
    await refreshProduct();
  } catch {
    toast.error("Не удалось обновить товар");
  } finally {
    loading.value = false;
  }
}

async function handleAddPrice() {
  if (newPrice.value <= 0) {
    toast.error("Укажите корректную цену");
    return;
  }
  priceLoading.value = true;
  try {
    await api.addPrice(productId, newPrice.value);
    toast.success("Цена обновлена");
    priceDialog.value = false;
    newPrice.value = 0;
    await Promise.all([refreshProduct(), refreshPrices()]);
  } catch {
    toast.error("Не удалось обновить цену");
  } finally {
    priceLoading.value = false;
  }
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(Number(value));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
</script>

<template>
  <div>
    <AdminHeader
      :title="product?.name ?? 'Редактирование'"
      description="Изменение данных товара"
      :breadcrumbs="[
        { label: 'Admin', href: '/admin' },
        { label: 'Товары', href: '/admin/products' },
        { label: product?.name ?? '...' },
      ]"
    />

    <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <ProductForm
        v-if="product"
        :initial="product"
        :categories="categories ?? []"
        :attributes="attributes ?? []"
        :loading="loading"
        @submit="handleSubmit"
      />

      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle class="flex items-center gap-2 text-base">
            <History class="size-4" />
            История цен
          </CardTitle>
          <Button size="sm" @click="priceDialog = true">
            <Plus class="size-4" />
            Новая цена
          </Button>
        </CardHeader>
        <CardContent>
          <Table v-if="prices?.length">
            <TableHeader>
              <TableRow>
                <TableHead>Цена</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="price in prices" :key="price.id">
                <TableCell class="font-medium">{{ formatPrice(price.value) }}</TableCell>
                <TableCell class="text-muted-foreground">{{ formatDate(price.createdAt) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p v-else class="text-sm text-muted-foreground">История цен пуста</p>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="priceDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Установить новую цену</DialogTitle>
        </DialogHeader>
        <div class="space-y-2 py-2">
          <Label for="newPrice">Новая цена (₽)</Label>
          <Input id="newPrice" v-model.number="newPrice" type="number" min="0" step="0.01" />
          <p class="text-xs text-muted-foreground">Текущая цена станет «старой»</p>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="priceDialog = false">Отмена</Button>
          <Button :disabled="priceLoading" @click="handleAddPrice">
            {{ priceLoading ? "Сохранение..." : "Сохранить" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
