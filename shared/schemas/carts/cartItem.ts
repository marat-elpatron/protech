import z from "zod";

export const createCartItemSchema = z.object({
	cartId: z
		.coerce
		.number("ID козины необходимо")
		.int("ID корзины должено быть целым числом")
		.positive("ID корзины должено быть больше нуля"),

	productId: z
		.coerce
		.number("ID продукта необходимо")
		.int("ID продукта должено быть целым числом")
		.positive("ID продукта должено быть больше нуля"),

	quantity: z
		.coerce
		.number("Количество товара необходимо")
		.int("Количество товара должно быть целым числом")
		.positive("Количество товара должно быть больше нуля")
})

export type CreateCartItemInput = z.infer<typeof createCartItemSchema>
