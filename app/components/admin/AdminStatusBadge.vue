<script setup lang="ts">
import { getOrderStatusLabel, getPaymentStatusLabel, getStatusTone } from "@/utils/adminFormat";

const props = withDefaults(
  defineProps<{
    status: string | boolean | null | undefined;
    type?: "order" | "payment" | "activity" | "answer" | "plain";
  }>(),
  { type: "plain" },
);

const normalized = computed(() => String(props.status ?? ""));
const label = computed(() => {
  if (props.type === "order") return getOrderStatusLabel(normalized.value);
  if (props.type === "payment") return getPaymentStatusLabel(normalized.value);
  if (props.type === "activity") return props.status ? "Активен" : "Скрыт";
  if (props.type === "answer") return props.status ? "Отвечено" : "Ждет ответа";
  return normalized.value || "—";
});

const tone = computed(() => {
  if (props.type === "activity") return props.status ? "green" : "gray";
  if (props.type === "answer") return props.status ? "green" : "amber";
  return getStatusTone(normalized.value);
});
</script>

<template>
  <span class="badge" :class="`badge-${tone}`">{{ label }}</span>
</template>
