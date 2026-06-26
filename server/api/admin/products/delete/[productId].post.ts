export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const productId = Number(getRouterParam(event, "productId"));

  try {
    await prisma.product.delete({
      where: { id: productId }
    });

    return { success: true };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw createError({
        statusCode: 404,
        message: "Товар не найден"
      });
    }

    if (error.code === "P2003") {
      throw createError({
        statusCode: 409,
        message: "Невозможно удалить товар, связанный с заказами"
      });
    }

    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при удалении товара"
    });
  }
});
