<script setup lang="ts">
import { toast } from "vue-sonner";
import type { AttributeItem, CategoryItem } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const saving = ref(false);

const { data: categories } = await useAsyncData("admin-new-product-categories", () => api.getCategories(), {
  default: () => [] as CategoryItem[],
});
const { data: attributes } = await useAsyncData("admin-new-product-attributes", () => api.getAttributes(), {
  default: () => [] as AttributeItem[],
});

async function submit(payload: Record<string, unknown>) {
  saving.value = true;
  try {
    const result = await api.createProduct(payload);
    toast.success("Товар создан");
    await navigateTo(`/admin/products/${result.product.id}`);
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось создать товар");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader kicker="Catalog" title="Новый товар"
      description="Создайте карточку товара, категорию и атрибуты за один проход" />

    <div>
      <AdminProductForm :attributes="attributes" :categories="categories" :loading="saving" @submit="submit" />
    </div>
  </div>
</template>
