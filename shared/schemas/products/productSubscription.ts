import z from "zod";

export const createProductSubscriptionSchema = z.object({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля")
}).strict();

export type CreateProductSubscriptionInput = z.infer<typeof createProductSubscriptionSchema>;
