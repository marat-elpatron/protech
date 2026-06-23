import z from "zod";

export const addCartItemSchema = z.strictObject({
	quantity: z
		.coerce
		.number("Количество товара необходимо")
		.int("Количество товара должно быть целым числом")
		.positive("Количество товара должно быть больше нуля")
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
