<script setup lang="ts">
import { Badge } from "@/components/ui/badge";

const props = defineProps<{
  status: string;
  type?: "order" | "payment" | "default";
}>();

const config = computed(() => {
  const orderMap = {
    NEW: { label: "Новый", variant: "secondary" as const },
    CONFIRMED: { label: "Подтверждён", variant: "default" as const },
    PROCESSING: { label: "В обработке", variant: "default" as const },
    SHIPPED: { label: "Отправлен", variant: "default" as const },
    COMPLETED: { label: "Завершён", variant: "outline" as const },
    CANCELLED: { label: "Отменён", variant: "destructive" as const },
  };

  const paymentMap = {
    PENDING: { label: "Ожидает", variant: "secondary" as const },
    UPON_RECEIPT: { label: "При получении", variant: "outline" as const },
    PAID: { label: "Оплачен", variant: "default" as const },
    CANCELLED: { label: "Отменён", variant: "destructive" as const },
  };

  const map = props.type === "payment" ? paymentMap : orderMap;
  return map[props.status as keyof typeof orderMap] ?? { label: props.status, variant: "secondary" as const };
});
</script>

<template>
  <Badge :variant="config.variant">{{ config.label }}</Badge>
</template>
