export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const [
    productsTotal,
    productsActive,
    ordersTotal,
    ordersNew,
    reviewsPending,
    faqPending,
    lowStock,
    revenuePaid
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "NEW" } }),
    prisma.review.count({ where: { OR: [{ isAnswered: false }, { isAnswered: null }] } }),
    prisma.shopQuestion.count({ where: { OR: [{ isAnswered: false }, { isAnswered: null }] } }),
    prisma.productStock.count({ where: { quantity: { lte: 5 } } }),
    prisma.payment.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { amount: true }
    })
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      payment: { select: { amount: true, paymentStatus: true } },
      user: { select: { name: true, email: true } },
      _count: { select: { orderItems: true } }
    }
  });

  return {
    stats: {
      productsTotal,
      productsActive,
      ordersTotal,
      ordersNew,
      reviewsPending,
      faqPending,
      lowStock,
      revenuePaid: revenuePaid._sum.amount ?? 0
    },
    recentOrders
  };
});
