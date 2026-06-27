<script setup lang="ts">
import { toast } from "vue-sonner";
import { ImagePlus, Loader2, Trash2 } from "@lucide/vue";

const props = defineProps<{
  modelValue: { url: string }[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: { url: string }[]];
}>();

const api = useAdminApi();
const fileInput = ref<HTMLInputElement>();
const uploading = ref(false);
const isDragging = ref(false);

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

async function uploadFiles(files: FileList | File[]) {
  const list = Array.from(files).filter(validateFile);
  if (!list.length) return;

  uploading.value = true;
  const uploaded: { url: string }[] = [];

  try {
    for (const file of list) {
      const { url } = await api.uploadImage(file);
      uploaded.push({ url });
    }
    emit("update:modelValue", [...props.modelValue, ...uploaded]);
    toast.success(
      uploaded.length === 1
        ? "Изображение добавлено"
        : `Добавлено изображений: ${uploaded.length}`,
    );
  } catch {
    toast.error("Не удалось загрузить изображения");
  } finally {
    uploading.value = false;
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) uploadFiles(input.files);
  input.value = "";
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files?.length) uploadFiles(event.dataTransfer.files);
}

function removeImage(index: number) {
  const next = [...props.modelValue];
  next.splice(index, 1);
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="modelValue.length"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
    >
      <div
        v-for="(image, index) in modelValue"
        :key="`${image.url}-${index}`"
        class="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-sm"
      >
        <img :src="image.url" alt="" class="size-full object-cover" />
        <button
          type="button"
          class="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-destructive group-hover:opacity-100"
          @click="removeImage(index)"
        >
          <Trash2 class="size-4" />
        </button>
      </div>
    </div>

    <div
      class="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-all duration-200"
      :class="[
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
        class="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
      >
        <Loader2 v-if="uploading" class="size-5 animate-spin" />
        <ImagePlus v-else class="size-5" />
      </div>
      <p class="text-sm font-medium">
        {{ uploading ? "Загрузка..." : "Добавить изображения в галерею" }}
      </p>
      <p class="mt-1 text-xs text-muted-foreground">
        Можно выбрать несколько файлов · JPEG, PNG, WebP, GIF · до 5 МБ
      </p>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="ACCEPT"
      multiple
      class="hidden"
      @change="onFileChange"
    />
  </div>
</template>
