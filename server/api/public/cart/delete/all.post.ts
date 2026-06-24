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

  try {
    await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: {
          userId: user.id
        }
      });

      const cartItem = await tx.cartItem.deleteMany({
        where: {
          cartId: cart?.id
        }
      });
    });

    return { success: true }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при удалении всех избранных товаров"
    })
  }
});
