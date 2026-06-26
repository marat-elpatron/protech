import { PaymentStatus } from "@prisma/client";
import { updatePaymentStatusSchema } from "~~/shared/schemas/admin/orders/updatePaymentStatus";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const result = await readValidatedBody(event, (body) => updatePaymentStatusSchema.safeParse(body));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Ошибка валидации данных",
      data: result.error.flatten((issue) => issue.message).fieldErrors,
    });
  }

  const body = result.data;

  const payment = await prisma.payment.findUnique({
    where: { orderId: body.orderId }
  });

  if (!payment) {
    throw createError({
      statusCode: 404,
      message: "Платёж для заказа не найден"
    });
  }

  const paymentStatus = body.paymentMethod as PaymentStatus;

  const updatedPayment = await prisma.payment.update({
    where: { orderId: body.orderId },
    data: {
      paymentStatus,
      ...(paymentStatus === PaymentStatus.PAID ? { paidAt: new Date() } : {})
    }
  });

  return { success: true, payment: updatedPayment };
});
