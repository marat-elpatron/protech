import z from "zod";

export const createProductPriceSchema = z.object({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля"),

	value: z
		.coerce
		.number("Цена продукта необходима")
		.positive("Цена должна быть больше нуля")
}).strict();

export type CreateProductPriceInput = z.infer<typeof createProductPriceSchema>;
