<script setup lang="ts">
import { Search } from "@lucide/vue";

withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
  }>(),
  {
    placeholder: "Поиск",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="admin-search">
    <Search />
    <input :value="modelValue" :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
  </div>
</template>
