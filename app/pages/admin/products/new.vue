<script setup lang="ts">
import { toast } from "vue-sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import AdminProductForm from "@/components/admin/AdminProductForm.vue";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const router = useRouter();
const loading = ref(false);

const { data: categories, pending: categoriesPending } = await useAsyncData(
  "admin-categories",
  () => api.getCategories(),
);

const { data: attributes, pending: attributesPending } = await useAsyncData(
  "admin-attributes",
  () => api.getAttributes(),
);

const formPending = computed(() => categoriesPending.value || attributesPending.value);

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
    <AdminHeader title="Новый товар" description="Добавление товара в каталог" :breadcrumbs="[
      { label: 'Admin', href: '/admin' },
      { label: 'Товары', href: '/admin/products' },
      { label: 'Новый' },
    ]" />

    <div class="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <Alert v-if="!formPending && !categories?.length">
        <AlertTitle>Нет категорий</AlertTitle>
        <AlertDescription>
          Сначала создайте категорию в разделе «Категории», затем добавьте товар.
        </AlertDescription>
      </Alert>

      <div v-if="formPending" class="space-y-4">
        <Skeleton class="h-64 rounded-xl" />
        <Skeleton class="h-64 rounded-xl" />
      </div>

      <AdminProductForm v-else :categories="categories ?? []" :attribute-items="attributes ?? []" :loading="loading"
        @submit="handleSubmit" />
    </div>
  </div>
</template>
