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
  const reviewId = Number(getRouterParam(event, "reviewId"));

  try {
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId
      }
    });

    if (review?.userId != user.id) {
      throw createError({
        statusCode: 402,
        message: "Это не ваш отзыв!"
      })
    }

    await prisma.review.delete({
      where: {
        id: reviewId
      }
    });

    return { success: true };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при удалении отзыва"
    })
  }
});
