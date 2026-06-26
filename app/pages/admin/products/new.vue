<script setup lang="ts">
import { toast } from "vue-sonner";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const router = useRouter();
const loading = ref(false);

const [{ data: categories }, { data: attributes }] = await Promise.all([
  useAsyncData("categories", () => api.getCategories()),
  useAsyncData("attributes", () => api.getAttributes()),
]);

async function handleSubmit(data: Record<string, unknown>) {
  loading.value = true;
  try {
    await api.createProduct(data);
    toast.success("Товар создан");
    await router.push("/admin/products");
  } catch {
    toast.error("Не удалось создать товар");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <AdminHeader
      title="Новый товар"
      description="Добавление товара в каталог"
      :breadcrumbs="[
        { label: 'Admin', href: '/admin' },
        { label: 'Товары', href: '/admin/products' },
        { label: 'Новый' },
      ]"
    />

    <div class="flex flex-1 flex-col p-4 md:p-6">
      <ProductForm
        :categories="categories ?? []"
        :attributes="attributes ?? []"
        :loading="loading"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>
