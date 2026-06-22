import z from "zod";

export const createOrderItemSchema = z.object({
	orderId: z
		.coerce
		.number("ID заказа необходим")
		.int("ID заказа должен быть целым числом")
		.positive("ID заказа должен быть больше нуля"),

	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля"),

	price: z
		.coerce
		.number("Цена товара необходима")
		.positive("Цена товара должна быть больше нуля"),

	quantity: z
		.coerce
		.number("Количество товара необходимо")
		.int("Количество товара должно быть целым числом")
		.positive("Количество товара должно быть больше нуля")
}).strict();

export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
