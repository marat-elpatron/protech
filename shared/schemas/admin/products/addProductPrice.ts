import z from "zod";

export const addProductPriceSchema = z.strictObject({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля"),

	value: z
		.coerce
		.number("Цена продукта необходима")
		.positive("Цена должна быть больше нуля")
})

export type AddProductPriceInput = z.infer<typeof addProductPriceSchema>;
