export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      message: "Вы неавторизованы"
    })
  }

  const user = session.user;
  const productId = Number(getRouterParam(event, "productId"));

  try {
    await prisma.favoriteProduct.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId
        }
      }
    });

    return { success: true };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при удалении товара из избранного"
    })
  }
});
