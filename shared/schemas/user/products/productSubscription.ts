import z from "zod";

export const productSubscriptionSchema = z.strictObject({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля")
})

export type ProductSubscriptionInput = z.infer<typeof productSubscriptionSchema>;
