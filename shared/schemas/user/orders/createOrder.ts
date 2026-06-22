import z from "zod";

const orderItemSchema = z.strictObject({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля"),

	quantity: z
		.coerce
		.number("Количество товара необходимо")
		.int("Количество товара должно быть целым числом")
		.positive("Количество товара должно быть больше нуля")
});

const deliveryDetailsSchema = z.strictObject({
	address: z
		.string("Адрес доставки необходим")
		.trim()
		.min(1, "Адрес доставки необходим")
		.max(500, "Адрес доставки должен быть не более 500 символов"),

	apartment: z
		.string()
		.trim()
		.max(50, "Квартира должна быть не более 50 символов")
		.optional(),

	entrance: z
		.string()
		.trim()
		.max(50, "Подъезд должен быть не более 50 символов")
		.optional(),

	floor: z
		.string()
		.trim()
		.max(50, "Этаж должен быть не более 50 символов")
		.optional(),

	intercom: z
		.string()
		.trim()
		.max(50, "Домофон должен быть не более 50 символов")
		.optional(),

	comment: z
		.string()
		.trim()
		.max(1000, "Комментарий должен быть не более 1000 символов")
		.optional(),

	deliveryMethod: z
		.enum(["OZON"])
		.default("OZON")
});

export const createOrderSchema = z.discriminatedUnion("obtainingMethod", [
	z.strictObject({
		obtainingMethod: z
			.literal("PICKUP"),

		paymentMethod: z
			.enum(
				["OFFLINE", "ONLINE"],
				"Способ оплаты необходим"
			),

		orderItems: z
			.array(orderItemSchema)
			.min(1, "Заказ должен содержать хотя бы один товар"),

		delivery: z
			.never("Данные доставки не нужны для самовывоза")
			.optional()
	}),

	z.strictObject({
		obtainingMethod: z
			.literal("DELIVERY"),

		paymentMethod: z
			.enum(
				["OFFLINE", "ONLINE"],
				"Способ оплаты необходим"
			),

		orderItems: z
			.array(orderItemSchema)
			.min(1, "Заказ должен содержать хотя бы один товар"),

		delivery: deliveryDetailsSchema
	})
]);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
