<script setup lang="ts">
import { toast } from "vue-sonner";
import { Plus, Trash2 } from "@lucide/vue";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryItem, ProductDetail } from "@/composables/useAdminApi";

const props = defineProps<{
  categories: CategoryItem[];
  attributes: { id: number; name: string; unit: string }[];
  initial?: ProductDetail | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: Record<string, unknown>];
}>();

const form = reactive({
  name: props.initial?.name ?? "",
  description: props.initial?.description ?? "",
  currentPrice: props.initial ? Number(props.initial.currentPrice) : 0,
  oldPrice: props.initial?.oldPrice ? Number(props.initial.oldPrice) : undefined as number | undefined,
  article: props.initial?.article ?? "",
  mainImage: props.initial?.mainImage ?? "",
  ozonLink: props.initial?.ozonLink ?? "",
  categoryId: props.initial?.category?.id ?? (props.categories[0]?.id ?? 0),
  isActive: props.initial?.isActive ?? true,
  productImages: props.initial?.productImages.map((i) => ({ url: i.url })) ?? [] as { url: string }[],
  productAttributes: props.initial?.productAttributes.map((a) => ({
    attributeId: (a as { attributeId?: number; attribute: { id: number } }).attributeId ?? a.attribute.id,
    value: a.value,
  })) ?? [] as { attributeId: number; value: string }[],
});

function addImage() {
  form.productImages.push({ url: "" });
}

function removeImage(index: number) {
  form.productImages.splice(index, 1);
}

function addAttribute() {
  form.productAttributes.push({
    attributeId: props.attributes[0]?.id ?? 0,
    value: "",
  });
}

function removeAttribute(index: number) {
  form.productAttributes.splice(index, 1);
}

function handleSubmit() {
  if (!form.name || !form.article || !form.categoryId) {
    toast.error("Заполните обязательные поля");
    return;
  }

  emit("submit", {
    ...form,
    oldPrice: form.oldPrice || undefined,
    ozonLink: form.ozonLink || undefined,
    productImages: form.productImages.filter((i) => i.url.trim()),
    productAttributes: form.productAttributes.filter((a) => a.value.trim()),
  });
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Основная информация</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Название *</Label>
            <Input id="name" v-model="form.name" placeholder="iPhone 15 Pro" required />
          </div>
          <div class="space-y-2">
            <Label for="article">Артикул *</Label>
            <Input id="article" v-model="form.article" placeholder="IP15P-256" required />
          </div>
          <div class="space-y-2">
            <Label for="description">Описание *</Label>
            <Textarea id="description" v-model="form.description" rows="4" required />
          </div>
          <div class="space-y-2">
            <Label>Категория *</Label>
            <Select v-model="form.categoryId">
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Активен</Label>
              <p class="text-xs text-muted-foreground">Отображается в каталоге</p>
            </div>
            <Switch v-model:checked="form.isActive" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Цены и ссылки</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="currentPrice">Текущая цена *</Label>
              <Input id="currentPrice" v-model.number="form.currentPrice" type="number" min="0" step="0.01" required />
            </div>
            <div class="space-y-2">
              <Label for="oldPrice">Старая цена</Label>
              <Input id="oldPrice" v-model.number="form.oldPrice" type="number" min="0" step="0.01" />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="mainImage">Главное изображение *</Label>
            <Input id="mainImage" v-model="form.mainImage" placeholder="https://..." required />
          </div>
          <div v-if="form.mainImage" class="overflow-hidden rounded-lg border">
            <img :src="form.mainImage" alt="Preview" class="h-40 w-full object-cover" />
          </div>
          <div class="space-y-2">
            <Label for="ozonLink">Ссылка Ozon</Label>
            <Input id="ozonLink" v-model="form.ozonLink" placeholder="https://ozon.ru/..." />
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle class="text-base">Дополнительные изображения</CardTitle>
        <Button type="button" variant="outline" size="sm" @click="addImage">
          <Plus class="size-4" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-for="(image, index) in form.productImages" :key="index" class="flex gap-2">
          <Input v-model="image.url" placeholder="URL изображения" class="flex-1" />
          <Button type="button" variant="ghost" size="icon" @click="removeImage(index)">
            <Trash2 class="size-4 text-destructive" />
          </Button>
        </div>
        <p v-if="!form.productImages.length" class="text-sm text-muted-foreground">Нет дополнительных изображений</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle class="text-base">Характеристики</CardTitle>
        <Button type="button" variant="outline" size="sm" @click="addAttribute">
          <Plus class="size-4" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent class="space-y-3">
        <div
          v-for="(attr, index) in form.productAttributes"
          :key="index"
          class="grid grid-cols-[1fr_1fr_auto] gap-2"
        >
          <Select v-model="attr.attributeId">
            <SelectTrigger>
              <SelectValue placeholder="Характеристика" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="a in attributes" :key="a.id" :value="a.id">
                {{ a.name }}{{ a.unit ? ` (${a.unit})` : "" }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Input v-model="attr.value" placeholder="Значение" />
          <Button type="button" variant="ghost" size="icon" @click="removeAttribute(index)">
            <Trash2 class="size-4 text-destructive" />
          </Button>
        </div>
        <p v-if="!form.productAttributes.length" class="text-sm text-muted-foreground">Нет характеристик</p>
      </CardContent>
    </Card>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="$router.back()">Отмена</Button>
      <Button type="submit" :disabled="loading">
        {{ loading ? "Сохранение..." : initial ? "Сохранить изменения" : "Создать товар" }}
      </Button>
    </div>
  </form>
</template>
