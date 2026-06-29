import type { OrderStatus, PaymentStatus } from "@/composables/useAdminApi";

export const orderStatusOptions: { value: OrderStatus; label: string }[] = [
  { value: "NEW", label: "Новый" },
  { value: "CONFIRMED", label: "Подтвержден" },
  { value: "PROCESSING", label: "В сборке" },
  { value: "SHIPPED", label: "Отправлен" },
  { value: "COMPLETED", label: "Завершен" },
  { value: "CANCELLED", label: "Отменен" },
];

export const paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
  { value: "PENDING", label: "Ожидает" },
  { value: "UPON_RECEIPT", label: "При получении" },
  { value: "PAID", label: "Оплачен" },
  { value: "CANCELLED", label: "Отменен" },
];

export function getOrderStatusLabel(status: string) {
  return orderStatusOptions.find((item) => item.value === status)?.label ?? status;
}

export function getPaymentStatusLabel(status: string) {
  return paymentStatusOptions.find((item) => item.value === status)?.label ?? status;
}

export function getStatusTone(status: string) {
  if (["COMPLETED", "PAID", "CONFIRMED"].includes(status)) return "green";
  if (["NEW", "PROCESSING", "PENDING"].includes(status)) return "blue";
  if (["SHIPPED", "UPON_RECEIPT"].includes(status)) return "amber";
  if (["CANCELLED", "false"].includes(status)) return "red";
  return "gray";
}

export function formatPrice(value: number | string | null | undefined) {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(number) ? number : 0);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatShortDate(value: string | Date | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}
