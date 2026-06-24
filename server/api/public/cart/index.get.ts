export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      message: "Вы не авторизованы"
    });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: {
        cart: {
          userId: session.user.id
        }
      },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            currentPrice: true,
            oldPrice: true,
            mainImage: true,

            _count: {
              select: {
                reviews: true
              }
            }
          }
        }
      }
    });

    return cartItems;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при получении товаров корзины"
    });
  }
});
