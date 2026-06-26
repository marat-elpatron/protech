import {
  OrderStatus,
  PaymentStatus,
  Prisma
} from "@prisma/client";
import { defineEventHandler } from "h3";
import { z } from "zod";
import { getYooKassaPayment } from "~~/server/utils/yookassa";

const yookassaWebhookSchema = z
  .object({
    type: z.literal("notification"),
    event: z.enum([
      "payment.succeeded",
      "payment.canceled",
      "payment.waiting_for_capture"
    ]),
    object: z
      .object({
        id: z.string().min(1),
        status: z.enum([
          "pending",
          "waiting_for_capture",
          "succeeded",
          "canceled"
        ]),
        paid: z.boolean().optional(),
        metadata: z.record(z.string(), z.string()).optional()
      })
      .passthrough()
  })
  .passthrough();

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) => yookassaWebhookSchema.safeParse(body));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Ошибка валидации данных",
      data: result.error.flatten((issue) => issue.message).fieldErrors,
    });
  }

  const body = result.data;

  const payment = await getYooKassaPayment(event, body.object.id);

  const orderIdFromMetadata = Number(payment.metadata?.orderId);

  const existingPayment = await prisma.payment.findFirst({
    where: {
      OR: [
        { transactionId: payment.id },
        ...(Number.isInteger(orderIdFromMetadata)
          ? [{ orderId: orderIdFromMetadata }]
          : [])
      ]
    },
    include: {
      order: {
        select: { orderItems: true }
      }
    }
  });

  if (!existingPayment) {
    return {
      ok: true,
      ignored: true,
      reason: "Payment not found"
    };
  }

  if (payment.status === "succeeded" && payment.paid) {
    if (existingPayment.paymentStatus === PaymentStatus.PAID) {
      return { ok: true, alreadyProcessed: true };
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          transactionId: payment.id,
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
          amount: new Prisma.Decimal(payment.amount.value)
        }
      });

      await tx.order.update({
        where: { id: existingPayment.orderId },
        data: { orderStatus: OrderStatus.CONFIRMED }
      });

      const orderItems = await tx.orderItem.findMany({
        where: { orderId: existingPayment.orderId },
        select: { productId: true, quantity: true }
      });

      for (const item of orderItems) {
        await tx.productStock.updateMany({
          where: {
            productId: item.productId,
            quantity: { gte: item.quantity }
          },
          data: {
            quantity: { decrement: item.quantity }
          }
        });
      }
    });

    return { ok: true };
  }

  if (payment.status === "canceled") {
    if (existingPayment.paymentStatus === PaymentStatus.CANCELLED) {
      return { ok: true, alreadyProcessed: true };
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          transactionId: payment.id,
          paymentStatus: PaymentStatus.CANCELLED
        }
      }),
      prisma.order.update({
        where: { id: existingPayment.orderId },
        data: { orderStatus: OrderStatus.CANCELLED }
      })
    ]);

    return { ok: true };
  }

  return {
    ok: true,
    status: payment.status
  };
});
