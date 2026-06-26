import { Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);
  const page = Math.max(1, Number(query.page ?? 1));
  const status = query.status ? String(query.status) : undefined;
  const limit = 20;

  const where: Prisma.OrderWhereInput = status
    ? { orderStatus: status as Prisma.EnumOrderStatusFilter["equals"] }
    : {};

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: true,
        delivery: true,
        orderItems: {
          include: {
            product: { select: { id: true, name: true, mainImage: true } }
          }
        }
      }
    }),
    prisma.order.count({ where })
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
