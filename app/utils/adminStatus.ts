export type StatusOption = {
  value: string;
  label: string;
};

export const orderStatusOptions: StatusOption[] = [
  { value: "NEW", label: "Новый" },
  { value: "CONFIRMED", label: "Подтверждён" },
  { value: "PROCESSING", label: "В обработке" },
  { value: "SHIPPED", label: "Отправлен" },
  { value: "COMPLETED", label: "Завершён" },
  { value: "CANCELLED", label: "Отменён" },
];

export const paymentStatusOptions: StatusOption[] = [
  { value: "PENDING", label: "Ожидает" },
  { value: "UPON_RECEIPT", label: "При получении" },
  { value: "PAID", label: "Оплачен" },
  { value: "CANCELLED", label: "Отменён" },
];

export const obtainingMethodOptions: StatusOption[] = [
  { value: "DELIVERY", label: "Доставка" },
  { value: "PICKUP", label: "Самовывоз" },
];

export const paymentMethodOptions: StatusOption[] = [
  { value: "OFFLINE", label: "При получении" },
  { value: "ONLINE", label: "Онлайн" },
];

function getLabel(options: StatusOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function getOrderStatusLabel(status: string) {
  return getLabel(orderStatusOptions, status);
}

export function getPaymentStatusLabel(status: string) {
  return getLabel(paymentStatusOptions, status);
}

export function getObtainingMethodLabel(method: string) {
  return getLabel(obtainingMethodOptions, method);
}

export function getPaymentMethodLabel(method: string) {
  return getLabel(paymentMethodOptions, method);
}
