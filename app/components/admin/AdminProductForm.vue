<script setup lang="ts">
import { toast } from "vue-sonner";
import {
  Plus,
  Trash2,
  Package,
  Banknote,
  ImageIcon,
  ListChecks,
  Sparkles,
} from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminImageUpload from "@/components/admin/AdminImageUpload.vue";
import AdminImageGallery from "@/components/admin/AdminImageGallery.vue";
import type { CategoryItem, ProductDetail } from "@/composables/useAdminApi";
import {
  buildProductFormState,
  productFormToPayload,
  type ProductFormState,
} from "@/utils/productForm";

const props = defineProps<{
  categories: CategoryItem[];
  attributeItems: { id: number; name: string; unit: string }[];
  initial?: ProductDetail | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: Record<string, unknown>];
}>();

const router = useRouter();
const form = reactive<ProductFormState>(
  buildProductFormState(props.initial, props.categories),
);

watch(
  () => [props.initial, props.categories] as const,
  ([initial, categories]) => {
    Object.assign(form, buildProductFormState(initial, categories));
  },
  { deep: true },
);

function addAttribute() {
  form.productAttributes.push({
    attributeId: props.attributeItems[0]?.id ?? 0,
    value: "",
  });
}

function removeAttribute(index: number) {
  form.productAttributes.splice(index, 1);
}

function handleSubmit() {
  if (!form.name.trim() || !form.article.trim() || !form.description.trim()) {
    toast.error("Заполните название, артикул и описание");
    return;
  }

  if (!form.mainImage.trim()) {
    toast.error("Загрузите главное изображение");
    return;
  }

  if (!form.categoryId) {
    toast.error("Выберите категорию");
    return;
  }

  if (form.currentPrice <= 0) {
    toast.error("Укажите корректную цену");
    return;
  }

  const attributeIds = form.productAttributes
    .filter((attribute) => attribute.attributeId > 0 && attribute.value.trim())
    .map((attribute) => attribute.attributeId);

  if (new Set(attributeIds).size !== attributeIds.length) {
    toast.error("Одна характеристика не может быть добавлена несколько раз");
    return;
  }

  emit("submit", productFormToPayload(form));
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div class="space-y-6">
        <Card class="admin-card overflow-hidden">
          <CardHeader class="border-b border-border/50 bg-muted/20 pb-4">
            <div class="flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package class="size-4" />
              </div>
              <div>
                <CardTitle class="text-base">Основная информация</CardTitle>
                <CardDescription>Название, артикул и описание товара</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4 pt-6">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2 sm:col-span-2">
                <Label for="name">Название *</Label>
                <Input id="name" v-model="form.name" placeholder="iPhone 15 Pro" required />
              </div>
              <div class="space-y-2">
                <Label for="article">Артикул *</Label>
                <Input id="article" v-model="form.article" placeholder="IP15P-256" required />
              </div>
              <div class="space-y-2">
                <Label>Категория *</Label>
                <Select
                  :model-value="form.categoryId ? String(form.categoryId) : undefined"
                  :disabled="!categories.length"
                  @update:model-value="form.categoryId = Number($event)"
                >
                  <SelectTrigger>
                    <SelectValue
                      :placeholder="categories.length ? 'Выберите категорию' : 'Сначала создайте категорию'"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="cat in categories" :key="cat.id" :value="String(cat.id)">
                      {{ cat.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="description">Описание *</Label>
              <Textarea id="description" v-model="form.description" rows="5" required />
            </div>
            <div
              class="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-4"
            >
              <div>
                <Label class="flex items-center gap-2">
                  <Sparkles class="size-3.5 text-primary" />
                  Активен в каталоге
                </Label>
                <p class="text-xs text-muted-foreground">Скрытые товары не видны покупателям</p>
              </div>
              <Switch v-model="form.isActive" />
            </div>
          </CardContent>
        </Card>

        <Card class="admin-card overflow-hidden">
          <CardHeader class="border-b border-border/50 bg-muted/20 pb-4">
            <div class="flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListChecks class="size-4" />
              </div>
              <div class="flex-1">
                <CardTitle class="text-base">Характеристики</CardTitle>
                <CardDescription>Технические параметры товара</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                :disabled="!attributeItems.length"
                @click="addAttribute"
              >
                <Plus class="size-4" />
                Добавить
              </Button>
            </div>
          </CardHeader>
          <CardContent class="space-y-3 pt-6">
            <div
              v-for="(attr, index) in form.productAttributes"
              :key="index"
              class="grid grid-cols-1 gap-2 rounded-xl border border-border/50 bg-muted/10 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Select
                :model-value="attr.attributeId ? String(attr.attributeId) : undefined"
                @update:model-value="attr.attributeId = Number($event)"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Характеристика" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="attribute in attributeItems"
                    :key="attribute.id"
                    :value="String(attribute.id)"
                  >
                    {{ attribute.name }}{{ attribute.unit ? ` (${attribute.unit})` : "" }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input v-model="attr.value" placeholder="Значение" />
              <Button type="button" variant="ghost" size="icon" @click="removeAttribute(index)">
                <Trash2 class="size-4 text-destructive" />
              </Button>
            </div>
            <p v-if="!form.productAttributes.length" class="py-4 text-center text-sm text-muted-foreground">
              Характеристики не добавлены
            </p>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-6">
        <Card class="admin-card overflow-hidden">
          <CardHeader class="border-b border-border/50 bg-muted/20 pb-4">
            <div class="flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ImageIcon class="size-4" />
              </div>
              <div>
                <CardTitle class="text-base">Главное фото *</CardTitle>
                <CardDescription>Отображается в каталоге и карточке</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="pt-6">
            <AdminImageUpload v-model="form.mainImage" :label="undefined" />
          </CardContent>
        </Card>

        <Card class="admin-card overflow-hidden">
          <CardHeader class="border-b border-border/50 bg-muted/20 pb-4">
            <div class="flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Banknote class="size-4" />
              </div>
              <div>
                <CardTitle class="text-base">Цены и ссылки</CardTitle>
                <CardDescription>Стоимость и внешние ссылки</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4 pt-6">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-2">
                <Label for="currentPrice">Цена *</Label>
                <Input
                  id="currentPrice"
                  v-model.number="form.currentPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div class="space-y-2">
                <Label for="oldPrice">Старая цена</Label>
                <Input
                  id="oldPrice"
                  v-model.number="form.oldPrice"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="ozonLink">Ссылка Ozon</Label>
              <Input id="ozonLink" v-model="form.ozonLink" placeholder="https://ozon.ru/..." />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <Card class="admin-card overflow-hidden">
      <CardHeader class="border-b border-border/50 bg-muted/20 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ImageIcon class="size-4" />
          </div>
          <div>
            <CardTitle class="text-base">Галерея изображений</CardTitle>
            <CardDescription>Дополнительные фото для карточки товара</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-6">
        <AdminImageGallery v-model="form.productImages" />
      </CardContent>
    </Card>

    <div
      class="sticky bottom-4 z-20 flex items-center justify-end gap-3 rounded-xl border border-border/60 bg-background/90 p-4 shadow-lg backdrop-blur-md"
    >
      <Button type="button" variant="outline" @click="router.back()">Отмена</Button>
      <Button type="submit" :disabled="loading" class="min-w-36 shadow-md shadow-primary/20">
        {{ loading ? "Сохранение..." : initial ? "Сохранить изменения" : "Создать товар" }}
      </Button>
    </div>
  </form>
</template>
