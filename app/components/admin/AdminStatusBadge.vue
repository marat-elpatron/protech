<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { getOrderStatusLabel, getPaymentStatusLabel } from "@/utils/adminStatus";

const props = defineProps<{
  status: string;
  type?: "order" | "payment" | "default";
}>();

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
type StatusConfig = { label: string; variant: BadgeVariant };

const config = computed<StatusConfig>(() => {
  const orderMap: Record<string, BadgeVariant> = {
    NEW: "secondary",
    CONFIRMED: "default",
    PROCESSING: "default",
    SHIPPED: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
  };

  const paymentMap: Record<string, BadgeVariant> = {
    PENDING: "secondary",
    UPON_RECEIPT: "outline",
    PAID: "default",
    CANCELLED: "destructive",
  };

  const map = props.type === "payment" ? paymentMap : orderMap;
  const label =
    props.type === "payment"
      ? getPaymentStatusLabel(props.status)
      : getOrderStatusLabel(props.status);

  return {
    label,
    variant: map[props.status] ?? "secondary",
  };
});
</script>

<template>
  <Badge :variant="config.variant">{{ config.label }}</Badge>
</template>
