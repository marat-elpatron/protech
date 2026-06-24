export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      message: "Вы неавторизованы"
    });
  }

  const user = session.user;
  const productId = Number(getRouterParam(event, "productId"));

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: {
          userId: user.id
        },
        create: {
          userId: user.id
        },
        update: {},
        select: {
          id: true
        }
      });

      const cartItem = await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId
          }
        },
        create: {
          cartId: cart.id,
          productId,
          quantity: 1
        },
        update: {
          quantity: {
            increment: 1
          }
        },
        include: {
          product: true
        }
      });

      return cartItem;
    });

    return {
      success: true,
      cartItem: result
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при добавлении товара в корзину"
    });
  }
});
