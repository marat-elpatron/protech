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
    await prisma.productSubscription.create({
      data: {
        userId: user.id,
        productId: productId
      }
    })

    return { success: true };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при добавлении товара в подписку"
    })
  }
});
