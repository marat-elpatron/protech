import z from "zod";

export const updateProductStockSchema = z.strictObject({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля"),

	quantity: z
		.coerce
		.number("Количество товара необходимо")
		.int("Количество товара должно быть целым числом")
		.nonnegative("Количество товара не может быть отрицательным")
		.default(0)
})

export type UpdateProductStockInput = z.infer<typeof updateProductStockSchema>;
