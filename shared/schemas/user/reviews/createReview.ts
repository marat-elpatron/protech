import z from "zod";

const reviewPhotoSchema = z.strictObject({
	url: z
		.url("Некорректная ссылка на изображение")
		.trim()
		.min(1, "Ссылка на изображение необходима")
		.max(1000, "Ссылка на изображение должна быть не более 1000 символов")
});

export const createReviewSchema = z.strictObject({
	rating: z
		.coerce
		.number("Рейтинг товара необходим")
		.int("Рейтинг должен быть целым числом")
		.min(1, "Минимальное значение рейтинга - 1")
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
		.max(500, "Максимальное количество символов коммента - 500")
		.optional(),

	reviewPhotos: z
		.array(reviewPhotoSchema)
		.max(10, "Максимальное количество фото - 10")
		.optional(),

	isAnswered: z
		.coerce
		.boolean()
		.optional()
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
