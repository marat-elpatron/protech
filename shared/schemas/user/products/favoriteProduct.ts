import z from "zod";

export const favoriteProductSchema = z.strictObject({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля")
})

export type FavoriteProductInput = z.infer<typeof favoriteProductSchema>;
