export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page ?? 1);
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const limit = 20;

  const questions = await prisma.shopQuestion.findMany({
    skip: (currentPage - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      shopQuestionImages: true,
      shopAnswers: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      },
      user: {
        select: { id: true, name: true }
      }
    }
  });

  return questions;
});
