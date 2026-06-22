import z from "zod";

export const deleteCartItemSchema = z.strictObject({
	productId: z
		.coerce
		.number("ID продукта необходимо")
		.int("ID продукта должно быть целым числом")
		.positive("ID продукта должно быть больше нуля"),
});

export type DeleteCartItemInput = z.infer<typeof deleteCartItemSchema>;
