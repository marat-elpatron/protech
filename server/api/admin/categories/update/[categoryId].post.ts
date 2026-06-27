import { categorySchema } from "~~/shared/schemas/admin/products/category";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const categoryId = Number(getRouterParam(event, "categoryId"));

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw createError({
      statusCode: 400,
      message: "Некорректный ID категории",
    });
  }

  const result = await readValidatedBody(event, (body) => categorySchema.safeParse(body));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Ошибка валидации данных",
      data: result.error.flatten((issue) => issue.message).fieldErrors,
    });
  }

  try {
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { name: result.data.name },
    });

    return { success: true, category };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw createError({
        statusCode: 404,
        message: "Категория не найдена",
      });
    }

    if (error.code === "P2002") {
      throw createError({
        statusCode: 409,
        message: "Категория с таким названием уже существует",
      });
    }

    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при обновлении категории",
    });
  }
});
