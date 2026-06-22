import z from "zod";

export const createShopQuestionSchema = z.object({
	title: z
		.string("Заголовок необходим")
		.trim()
		.min(1, "Заголовок необходим")
		.max(255, "Заголовок должен быть не более 255 символов"),

	comment: z
		.string("Комментарий необходим")
		.trim()
		.min(1, "Комментарий необходим")
		.max(1000, "Комментарий должен быть не более 1000 символов")
})

export type CreateShopQuestionInput = z.infer<typeof createShopQuestionSchema>
