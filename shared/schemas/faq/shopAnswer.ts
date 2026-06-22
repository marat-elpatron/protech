import z from "zod";

export const createShopAnswerSchema = z.object({
	shopQuestionId: z
		.coerce
		.number("ID вопроса необходимо")
		.int("ID вопроса должно быть целым числом")
		.positive("ID вопроса должно быть больше нуля"),

	comment: z
		.string("Комментарий необходим")
		.trim()
		.min(1, "Комментарий необходим")
		.max(1000, "Комментарий должен быть не более 1000 символов")
})

export type CreateShopAnswerInput = z.infer<typeof createShopAnswerSchema>
