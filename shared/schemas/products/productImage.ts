import z from "zod";

export const createProductImageSchema = z.object({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля"),

	url: z
		.string("Ссылка на изображение необходима")
		.trim()
		.min(1, "Ссылка на изображение необходима")
		.max(1000, "Ссылка на изображение должна быть не более 1000 символов")
}).strict();

export type CreateProductImageInput = z.infer<typeof createProductImageSchema>;
