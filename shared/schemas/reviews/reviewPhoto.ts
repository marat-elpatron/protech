import z from "zod";

export const createReviewPhotoSchema = z.object({
	reviewId: z
		.coerce
		.number("ID отзыва необходимо")
		.int("ID отзыва должно быть целым числом")
		.positive("ID отзыва должно быть больше нуля"),

	url: z
		.string("Ссылка на изображение необходима")
		.trim()
		.min(1, "Ссылка на изображение необходима")
		.max(1000, "Ссылка на изображение должна быть не более 1000 символов")
})

export type CreateReviewPhotoInput = z.infer<typeof createReviewPhotoSchema>
