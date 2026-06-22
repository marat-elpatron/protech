import z from "zod";

export const createFavoriteProductSchema = z.object({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля")
}).strict();

export type CreateFavoriteProductInput = z.infer<typeof createFavoriteProductSchema>;
