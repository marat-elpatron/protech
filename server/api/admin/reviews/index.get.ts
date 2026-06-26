import { Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);
  const page = Math.max(1, Number(query.page ?? 1));
  const pending = query.pending === "true";
  const limit = 20;

  const where: Prisma.ReviewWhereInput = pending
    ? { OR: [{ isAnswered: false }, { isAnswered: null }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, mainImage: true } },
        reviewPhotos: true,
        reviewAnswers: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    }),
    prisma.review.count({ where })
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
});
