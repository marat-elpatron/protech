import z from "zod";

export const createShopQuestionImageSchema = z.object({
	shopQuestionId: z
		.coerce
		.number("ID вопроса необходимо")
		.int("ID вопроса должно быть целым числом")
		.positive("ID вопроса должно быть больше нуля"),

	url: z
		.string("Ссылка на изображение необходима")
		.trim()
		.min(1, "Ссылка на изображение необходима")
		.max(1000, "Ссылка на изображение должна быть не более 1000 символов")
})

export type CreateShopQuestionImageInput = z.infer<typeof createShopQuestionImageSchema>
