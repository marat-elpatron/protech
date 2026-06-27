<script setup lang="ts">
import { Badge } from "@/components/ui/badge";

const props = defineProps<{
  status: string;
  type?: "order" | "payment" | "default";
}>();

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
type StatusConfig = { label: string; variant: BadgeVariant };

const config = computed<StatusConfig>(() => {
  const orderMap: Record<string, StatusConfig> = {
    NEW: { label: "Новый", variant: "secondary" },
    CONFIRMED: { label: "Подтверждён", variant: "default" },
    PROCESSING: { label: "В обработке", variant: "default" },
    SHIPPED: { label: "Отправлен", variant: "default" },
    COMPLETED: { label: "Завершён", variant: "outline" },
    CANCELLED: { label: "Отменён", variant: "destructive" },
  };

  const paymentMap: Record<string, StatusConfig> = {
    PENDING: { label: "Ожидает", variant: "secondary" },
    UPON_RECEIPT: { label: "При получении", variant: "outline" },
    PAID: { label: "Оплачен", variant: "default" },
    CANCELLED: { label: "Отменён", variant: "destructive" },
  };

  const map = props.type === "payment" ? paymentMap : orderMap;
  return map[props.status] ?? { label: props.status, variant: "secondary" };
});
</script>

<template>
  <Badge :variant="config.variant">{{ config.label }}</Badge>
</template>
