import z from "zod";

export const createReviewSchema = z.object({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля"),

	rating: z
		.coerce
		.number("Рейтинг товара необходим")
		.int("Рейтинг должен быть целым числом")
		.min(1, "Минимально значение рейтинга - 1")
		.max(5, "Максимальное значение рейтинга - 5"),

	advantages: z
		.string()
		.trim()
		.max(500, "Максимальное количество символов преимуществ - 500")
		.optional(),

	disadvantages: z
		.string()
		.trim()
		.max(500, "Максимальное количество символов недостатков - 500")
		.optional(),

	comment: z
		.string()
		.trim()
		.max(500, "Максимальное количество символов коммента- 500")
		.optional()
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
