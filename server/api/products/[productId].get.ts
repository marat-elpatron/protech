export default defineEventHandler(async (event) => {
  const productId = Number(getRouterParam(event, "productId"));

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        currentPrice: true,
        oldPrice: true,
        article: true,
        mainImage: true,
        ozonLink: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,

        category: {
          select: {
            name: true,
          },
        },

        productImages: {
          select: {
            id: true,
            url: true,
          },
        },

        productAttributes: {
          select: {
            id: true,
            value: true,
            attribute: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        },

        productPrices: {
          select: {
            id: true,
            value: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },

        productStocks: {
          select: {
            id: true,
            quantity: true,
            updatedAt: true,
          },
        },

        reviews: true,
      },
    });

    if (!product) {
      throw createError({
        statusCode: 404,
        message: "Товар не найден",
      });
    }

    return product;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при получении деталей товара",
    });
  }
});
