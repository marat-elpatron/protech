<script setup lang="ts">
import { toast } from "vue-sonner";
import { Warehouse, Save } from "@lucide/vue";
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
import { Skeleton } from "@/components/ui/skeleton";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const editing = ref<Record<number, number>>({});
const saving = ref<number | null>(null);

const { data, pending, refresh } = await useAsyncData("stock", () => api.getStock());

function startEdit(productId: number, quantity: number) {
  editing.value[productId] = quantity;
}

async function saveStock(productId: number) {
  const quantity = editing.value[productId];
  if (quantity === undefined || quantity < 0) {
    toast.error("Некорректное количество");
    return;
  }
  saving.value = productId;
  try {
    await api.updateStock(productId, quantity);
    toast.success("Остаток обновлён");
    delete editing.value[productId];
    await refresh();
  } catch {
    toast.error("Не удалось обновить остаток");
  } finally {
    saving.value = null;
  }
}
</script>

<template>
  <div>
    <AdminHeader title="Склад" description="Управление остатками товаров"
      :breadcrumbs="[{ label: 'Admin', href: '/admin' }, { label: 'Склад' }]" />

    <div class="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <Card>
        <CardContent class="p-0">
          <div v-if="pending" class="space-y-3 p-4">
            <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
          </div>

          <Table v-else-if="data?.length">
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Обновлён</TableHead>
                <TableHead class="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in data" :key="item.id">
                <TableCell class="font-medium">{{ item.product.name }}</TableCell>
                <TableCell class="text-muted-foreground">{{ item.product.article }}</TableCell>
                <TableCell>
                  <Badge :variant="item.product.isActive ? 'default' : 'secondary'">
                    {{ item.product.isActive ? "Активен" : "Скрыт" }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Input v-if="editing[item.product.id] !== undefined" v-model.number="editing[item.product.id]"
                    type="number" min="0" class="w-24" />
                  <span v-else :class="item.quantity <= 5 ? 'font-semibold text-destructive' : 'font-medium'">
                    {{ item.quantity }} шт.
                  </span>
                </TableCell>
                <TableCell class="text-sm text-muted-foreground">
                  {{ new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new
                    Date(item.updatedAt)) }}
                </TableCell>
                <TableCell>
                  <Button v-if="editing[item.product.id] !== undefined" size="sm" :disabled="saving === item.product.id"
                    @click="saveStock(item.product.id)">
                    <Save class="size-4" />
                    {{ saving === item.product.id ? "..." : "Сохранить" }}
                  </Button>
                  <Button v-else variant="outline" size="sm" @click="startEdit(item.product.id, item.quantity)">
                    Изменить
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div v-else class="flex flex-col items-center gap-3 py-16">
            <Warehouse class="size-12 text-muted-foreground/40" />
            <p class="text-muted-foreground">Нет данных по складу</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
