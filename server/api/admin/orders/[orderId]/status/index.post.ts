import { updateOrderStatusSchema } from "~~/shared/schemas/admin/orders/updateOrderStatus";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const orderId = Number(getRouterParam(event, "orderId"));

  const result = await readValidatedBody(event, (body) => updateOrderStatusSchema.safeParse(body));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Ошибка валидации данных",
      data: result.error.flatten((issue) => issue.message).fieldErrors,
    });
  }

  const body = result.data;

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: body.orderStatus },
      include: {
        orderItems: true,
        delivery: true,
        payment: true
      }
    });

    return { success: true, order };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw createError({
        statusCode: 404,
        message: "Заказ не найден"
      });
    }

    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при обновлении статуса заказа"
    });
  }
});
