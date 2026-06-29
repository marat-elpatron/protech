<script setup lang="ts">
import { ImagePlus, Loader2, X } from "@lucide/vue";
import { toast } from "vue-sonner";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    compact?: boolean;
  }>(),
  {
    label: "Изображение",
    compact: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const api = useAdminApi();
const uploading = ref(false);
const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

async function handleFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";

  if (!file) return;

  uploading.value = true;
  try {
    const result = await api.uploadImage(file);
    emit("update:modelValue", result.url);
    toast.success("Изображение загружено");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось загрузить изображение");
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div>
    <label v-if="label">{{ label }}</label>
    <div>
      <img v-if="modelValue" :src="modelValue" alt="" />
      <div v-else>
        <Loader2 v-if="uploading" />
        <ImagePlus v-else />
        <span>{{ uploading ? "Загрузка..." : "Перетащите или выберите файл" }}</span>
      </div>
      <input type="file" accept="image/*" :disabled="uploading" @change="handleFile" />
    </div>
    <div>
      <input v-model="inputValue" placeholder="/uploads/image.webp или https://..." />
      <button v-if="modelValue" type="button" title="Очистить" @click="emit('update:modelValue', '')">
        <X />
      </button>
    </div>
  </div>
</template>
