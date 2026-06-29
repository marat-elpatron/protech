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
  <div class="image-uploader">
    <label v-if="label" class="field-label">{{ label }}</label>
    <div class="image-drop" :style="{ minHeight: compact ? '132px' : undefined }">
      <img v-if="modelValue" class="image-preview" :src="modelValue" alt="" />
      <div v-else class="upload-placeholder">
        <Loader2 v-if="uploading" class="animate-spin" />
        <ImagePlus v-else />
        <span>{{ uploading ? "Загрузка..." : "Перетащите или выберите файл" }}</span>
      </div>
      <input type="file" accept="image/*" :disabled="uploading" @change="handleFile" />
    </div>
    <div class="toolbar">
      <input v-model="inputValue" class="input compact" placeholder="/uploads/image.webp или https://..." />
      <button v-if="modelValue" class="btn btn-secondary btn-icon" type="button" title="Очистить" @click="emit('update:modelValue', '')">
        <X />
      </button>
    </div>
  </div>
</template>
