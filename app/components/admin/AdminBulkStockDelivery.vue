<script setup lang="ts">
import { Plus, Trash2, Truck } from "@lucide/vue";
import { toast } from "vue-sonner";
import type { StockItem } from "@/composables/useAdminApi";

type BulkRow = {
  key: number;
  productId: string;
  quantity: number | null;
};

const props = withDefaults(
  defineProps<{
    stocks: StockItem[];
    submitting?: boolean;
  }>(),
  {
    submitting: false,
  },
);

const emit = defineEmits<{
  submit: [rows: { productId: number; quantity: number }[]];
}>();

let nextKey = 1;
const rows = ref<BulkRow[]>([createRow()]);

const stockByProductId = computed(() => {
  return new Map(props.stocks.map((item) => [String(item.product.id), item]));
});

const productOptions = computed(() => {
  return props.stocks.map((item) => ({
    value: String(item.product.id),
    label: item.product.name,
    description: `${item.product.article} · сейчас ${item.quantity} шт.`,
  }));
});

const selectedIds = computed(() => rows.value.map((row) => row.productId).filter(Boolean));
const totalQuantity = computed(() => {
  return rows.value.reduce((sum, row) => sum + Math.max(0, Number(row.quantity ?? 0)), 0);
});

function createRow(): BulkRow {
  return {
    key: nextKey++,
    productId: "",
    quantity: null,
  };
}

function addRow() {
  rows.value.push(createRow());
}

function removeRow(index: number) {
  rows.value.splice(index, 1);

  if (!rows.value.length) {
    addRow();
  }
}

function optionsFor(row: BulkRow) {
  const selectedInOtherRows = new Set(selectedIds.value.filter((id) => id !== row.productId));

  return productOptions.value.map((option) => ({
    ...option,
    disabled: selectedInOtherRows.has(option.value),
  }));
}

function submit() {
  const normalized = rows.value
    .filter((row) => row.productId || row.quantity)
    .map((row) => ({
      productId: Number(row.productId),
      quantity: Number(row.quantity),
    }));

  if (!normalized.length) {
    toast.error("Добавьте хотя бы один товар в поставку");
    return;
  }

  if (normalized.some((row) => !Number.isInteger(row.productId) || row.productId <= 0)) {
    toast.error("Выберите товар в каждой строке поставки");
    return;
  }

  if (normalized.some((row) => !Number.isInteger(row.quantity) || row.quantity <= 0)) {
    toast.error("Количество поставки должно быть положительным целым числом");
    return;
  }

  if (new Set(normalized.map((row) => row.productId)).size !== normalized.length) {
    toast.error("Один товар не должен повторяться в одной поставке");
    return;
  }

  emit("submit", normalized);
}

function reset() {
  rows.value = [createRow()];
}

defineExpose({ reset });
</script>

<template>
  <section class="admin-card">
    <div class="admin-card-header">
      <div>
        <h2 class="admin-card-heading">Массовая поставка</h2>
        <p class="admin-card-copy">Добавьте несколько товаров и примените приход одной операцией</p>
      </div>
      <Truck />
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-3">
        <div v-for="(row, index) in rows" :key="row.key" class="admin-bulk-row">
          <div class="admin-field">
            <label :for="`bulk-product-${row.key}`">Товар</label>
            <AdminSelect :model-value="row.productId" :options="optionsFor(row)" placeholder="Выберите товар"
              :aria-label="`Товар в строке поставки ${index + 1}`" @update:model-value="row.productId = $event" />
          </div>

          <div class="admin-field">
            <label :for="`bulk-quantity-${row.key}`">Количество</label>
            <input :id="`bulk-quantity-${row.key}`" v-model.number="row.quantity" min="1" step="1" type="number"
              placeholder="шт." />
          </div>

          <div class="admin-stat p-3">
            <span class="admin-stat-label">Сейчас</span>
            <strong class="admin-stat-value text-base">{{ stockByProductId.get(row.productId)?.quantity ?? "—" }}
              шт.</strong>
          </div>

          <button class="admin-icon-danger" type="button" title="Удалить строку" @click="removeRow(index)">
            <Trash2 />
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button class="admin-button-secondary" type="button" @click="addRow">
          <Plus />
          Добавить строку
        </button>

        <div class="flex flex-wrap gap-2 text-sm text-stone-500 dark:text-stone-400">
          <span>{{ rows.length }} строк</span>
          <span>{{ totalQuantity }} шт. в поставке</span>
        </div>

        <button class="admin-button-primary" type="submit" :disabled="submitting">
          <Truck />
          {{ submitting ? "Применяю..." : "Загрузить поставку" }}
        </button>
      </div>
    </form>
  </section>
</template>
