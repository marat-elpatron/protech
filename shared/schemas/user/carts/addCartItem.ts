import z from "zod";

export const addCartItemSchema = z.strictObject({
	productId: z
		.coerce
		.number("ID продукта необходимо")
		.int("ID продукта должно быть целым числом")
		.positive("ID продукта должно быть больше нуля"),

	quantity: z
		.coerce
		.number("Количество товара необходимо")
		.int("Количество товара должно быть целым числом")
		.positive("Количество товара должно быть больше нуля")
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
