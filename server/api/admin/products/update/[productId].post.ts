import { Prisma } from "@prisma/client";
import { updateProductSchema } from "~~/shared/schemas/admin/products/updateProduct";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const productId = Number(getRouterParam(event, "productId"));

  const result = await readValidatedBody(event, (body) => updateProductSchema.safeParse(body));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Ошибка валидации данных",
      data: result.error.flatten((issue) => issue.message).fieldErrors,
    });
  }

  const body = result.data;

  if (body.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId }
    });

    if (!category) {
      throw createError({
        statusCode: 400,
        message: "Категория не найдена"
      });
    }
  }

  const data: Prisma.ProductUpdateInput = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.currentPrice !== undefined) data.currentPrice = body.currentPrice;
  if (body.oldPrice !== undefined) data.oldPrice = body.oldPrice;
  if (body.article !== undefined) data.article = body.article;
  if (body.mainImage !== undefined) data.mainImage = body.mainImage;
  if (body.ozonLink !== undefined) data.ozonLink = body.ozonLink;
  if (body.categoryId !== undefined) data.category = { connect: { id: body.categoryId } };
  if (body.isActive !== undefined) data.isActive = body.isActive;

  if (body.productImages !== undefined) {
    data.productImages = {
      deleteMany: {},
      create: body.productImages.map((image) => ({ url: image.url }))
    };
  }

  if (body.productAttributes !== undefined) {
    data.productAttributes = {
      deleteMany: {},
      create: body.productAttributes.map((attr) => ({
        attributeId: attr.attributeId,
        value: attr.value
      }))
    };
  }

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: true,
        productImages: true,
        productAttributes: {
          include: { attribute: true }
        },
        productStocks: true
      }
    });

    return { success: true, product };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw createError({
        statusCode: 404,
        message: "Товар не найден"
      });
    }

    if (error.code === "P2002") {
      throw createError({
        statusCode: 409,
        message: "Товар с таким артикулом уже существует"
      });
    }

    throw createError({
      statusCode: 500,
      message: "Ошибка сервера при обновлении товара"
    });
  }
});
