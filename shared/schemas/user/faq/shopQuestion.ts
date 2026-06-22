import z from "zod";

const shopQuestionImageSchema = z.strictObject({
	url: z
		.url("Некорректная ссылка на изображение")
		.trim()
		.min(1, "Ссылка на изображение необходима")
		.max(1000, "Ссылка на изображение должна быть не более 1000 символов")
});

export const shopQuestionSchema = z.strictObject({
	title: z
		.string("Заголовок необходим")
		.trim()
		.min(1, "Заголовок необходим")
		.max(255, "Заголовок должен быть не более 255 символов"),

	comment: z
		.string("Комментарий необходим")
		.trim()
		.min(1, "Комментарий необходим")
		.max(1000, "Комментарий должен быть не более 1000 символов"),

	shopQuestionImages: z
		.array(shopQuestionImageSchema)
		.max(10, "Максимальное количество фото - 10")
		.optional()
});

export type ShopQuestionInput = z.infer<typeof shopQuestionSchema>;
