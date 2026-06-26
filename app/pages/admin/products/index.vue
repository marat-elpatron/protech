<script setup lang="ts">
import { toast } from "vue-sonner";
import { Plus, Search, Pencil, Trash2, Package } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();

const search = ref("");
const statusFilter = ref<string>("all");
const page = ref(1);
const deleteId = ref<number | null>(null);
const deleting = ref(false);

const { data: categories } = await useAsyncData("categories", () => api.getCategories());

const { data, pending, refresh } = await useAsyncData(
  "admin-products",
  () =>
    api.getProducts({
      page: page.value,
      search: search.value || undefined,
      isActive: statusFilter.value === "all" ? undefined : statusFilter.value === "active",
    }),
  { watch: [page, search, statusFilter] },
);

let searchTimeout: ReturnType<typeof setTimeout>;
function onSearchInput(value: string) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    search.value = value;
    page.value = 1;
  }, 300);
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(Number(value));
}

async function confirmDelete() {
  if (!deleteId.value) return;
  deleting.value = true;
  try {
    await api.deleteProduct(deleteId.value);
    toast.success("Товар удалён");
    deleteId.value = null;
    await refresh();
  } catch {
    toast.error("Не удалось удалить товар");
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div>
    <AdminHeader
      title="Товары"
      description="Управление каталогом продукции"
      :breadcrumbs="[{ label: 'Admin', href: '/admin' }, { label: 'Товары' }]"
    >
      <template #actions>
        <Button as-child>
          <NuxtLink to="/admin/products/new">
            <Plus class="size-4" />
            Добавить товар
          </NuxtLink>
        </Button>
      </template>
    </AdminHeader>

    <div class="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            class="pl-9"
            placeholder="Поиск по названию или артикулу..."
            @input="onSearchInput(($event.target as HTMLInputElement).value)"
          />
        </div>
        <Select v-model="statusFilter">
          <SelectTrigger class="w-full sm:w-44">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="inactive">Неактивные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent class="p-0">
          <div v-if="pending" class="space-y-3 p-4">
            <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
          </div>

          <Table v-else-if="data?.items.length">
            <TableHeader>
              <TableRow>
                <TableHead class="w-16">Фото</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead class="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="product in data.items" :key="product.id">
                <TableCell>
                  <img
                    :src="product.mainImage"
                    :alt="product.name"
                    class="size-10 rounded-md object-cover"
                  />
                </TableCell>
                <TableCell class="font-medium">{{ product.name }}</TableCell>
                <TableCell class="text-muted-foreground">{{ product.article }}</TableCell>
                <TableCell>{{ product.category.name }}</TableCell>
                <TableCell>{{ formatPrice(product.currentPrice) }}</TableCell>
                <TableCell>
                  <span :class="(product.productStocks[0]?.quantity ?? 0) <= 5 ? 'font-medium text-destructive' : ''">
                    {{ product.productStocks[0]?.quantity ?? 0 }}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge :variant="product.isActive ? 'default' : 'secondary'">
                    {{ product.isActive ? "Активен" : "Скрыт" }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="icon" as-child>
                      <NuxtLink :to="`/admin/products/${product.id}`">
                        <Pencil class="size-4" />
                      </NuxtLink>
                    </Button>
                    <Button variant="ghost" size="icon" @click="deleteId = product.id">
                      <Trash2 class="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div v-else class="flex flex-col items-center gap-3 py-16 text-center">
            <Package class="size-12 text-muted-foreground/40" />
            <p class="text-muted-foreground">Товары не найдены</p>
            <Button as-child variant="outline">
              <NuxtLink to="/admin/products/new">Добавить первый товар</NuxtLink>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div v-if="data && data.pagination.pages > 1" class="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="page <= 1"
          @click="page--"
        >
          Назад
        </Button>
        <span class="flex items-center px-3 text-sm text-muted-foreground">
          {{ page }} / {{ data.pagination.pages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="page >= data.pagination.pages"
          @click="page++"
        >
          Далее
        </Button>
      </div>
    </div>

    <AlertDialog :open="!!deleteId" @update:open="deleteId = null">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
          <AlertDialogDescription>
            Это действие необратимо. Товар будет удалён из каталога.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="confirmDelete">
            {{ deleting ? "Удаление..." : "Удалить" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
