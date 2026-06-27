<script setup lang="ts">
import { toast } from "vue-sonner";
import { CloudUpload, Loader2, Trash2, Upload } from "@lucide/vue";
import { Button } from "@/components/ui/button";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    hint?: string;
    aspect?: "square" | "video" | "wide";
  }>(),
  {
    label: "Изображение",
    hint: "JPEG, PNG, WebP или GIF · до 5 МБ",
    aspect: "video",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const api = useAdminApi();
const fileInput = ref<HTMLInputElement>();
const uploading = ref(false);
const isDragging = ref(false);

const aspectClass = computed(() => {
  if (props.aspect === "square") return "aspect-square";
  if (props.aspect === "wide") return "aspect-[21/9]";
  return "aspect-video";
});

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function validateFile(file: File): boolean {
  if (!file.type.startsWith("image/")) {
    toast.error("Выберите файл изображения");
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Файл слишком большой. Максимум — 5 МБ");
    return false;
  }
  return true;
}

async function uploadFile(file: File) {
  if (!validateFile(file)) return;

  uploading.value = true;
  try {
    const { url } = await api.uploadImage(file);
    emit("update:modelValue", url);
    toast.success("Изображение загружено");
  } catch {
    toast.error("Не удалось загрузить изображение");
  } finally {
    uploading.value = false;
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) uploadFile(file);
  input.value = "";
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) uploadFile(file);
}

function removeImage() {
  emit("update:modelValue", "");
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="label" class="flex items-center justify-between">
      <p class="text-sm font-medium">{{ label }}</p>
      <p v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</p>
    </div>

    <div
      v-if="modelValue"
      class="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-sm"
      :class="aspectClass"
    >
      <img :src="modelValue" alt="Preview" class="size-full object-cover" />
      <div
        class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Button
          type="button"
          size="sm"
          variant="secondary"
          :disabled="uploading"
          @click="fileInput?.click()"
        >
          <Upload class="size-4" />
          Заменить
        </Button>
        <Button type="button" size="sm" variant="destructive" @click="removeImage">
          <Trash2 class="size-4" />
          Удалить
        </Button>
      </div>
    </div>

    <div
      v-else
      class="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-200"
      :class="[
        aspectClass,
        isDragging
          ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_oklch(0.52_0.19_255/0.12)]'
          : 'border-border/70 bg-gradient-to-br from-muted/40 to-muted/10 hover:border-primary/40 hover:bg-primary/[0.03]',
        uploading ? 'pointer-events-none opacity-70' : '',
      ]"
      @click="fileInput?.click()"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <div
        class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20"
      >
        <Loader2 v-if="uploading" class="size-6 animate-spin" />
        <CloudUpload v-else class="size-6" />
      </div>
      <p class="text-sm font-medium">
        {{ uploading ? "Загрузка..." : "Перетащите изображение или нажмите для выбора" }}
      </p>
      <p class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="ACCEPT"
      class="hidden"
      @change="onFileChange"
    />
  </div>
</template>
