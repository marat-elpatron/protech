export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const categoryId = Number(getRouterParam(event, "categoryId"));

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw createError({
      statusCode: 400,
      message: "Некорректный ID категории",
    });
  }

  const productsCount = await prisma.product.count({
    where: { categoryId },
  });

  if (productsCount > 0) {
    throw createError({
      statusCode: 409,
      message: "Невозможно удалить категорию, к которой привязаны товары",
    });
  }

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { success: true };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw createError({
        statusCode: 404,
        message: "Категория не найдена",
      });
    }

    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при удалении категории",
    });
  }
});
