import {
  OrderStatus,
  PaymentStatus
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
      message: 'Ошибка валидации данных',
      data: result.error.flatten((issue) => issue.message).fieldErrors,
    })
  }

  const body = result.data

  const payment = await getYooKassaPayment(event, body.object.id);

  const orderIdFromMetadata = Number(payment.metadata?.orderId);

  const existingPayment = await prisma.payment.findFirst({
    where: {
      OR: [
        {
          transactionId: payment.id
        },
        ...(Number.isInteger(orderIdFromMetadata)
          ? [
            {
              orderId: orderIdFromMetadata
            }
          ]
          : [])
      ]
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
    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: existingPayment.id
        },
        data: {
          transactionId: payment.id,
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
          amount: payment.amount.value
        }
      }),

      prisma.order.update({
        where: {
          id: existingPayment.orderId
        },
        data: {
          orderStatus: OrderStatus.CONFIRMED
        }
      })
    ]);

    return {
      ok: true
    };
  }

  if (payment.status === "canceled") {
    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: existingPayment.id
        },
        data: {
          transactionId: payment.id,
          paymentStatus: PaymentStatus.CANCELLED
        }
      }),

      prisma.order.update({
        where: {
          id: existingPayment.orderId
        },
        data: {
          orderStatus: OrderStatus.CANCELLED
        }
      })
    ]);

    return {
      ok: true
    };
  }

  return {
    ok: true,
    status: payment.status
  };
});
