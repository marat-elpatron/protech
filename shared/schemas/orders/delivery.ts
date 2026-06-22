import z from "zod";

export const createDeliverySchema = z.object({
	orderId: z
		.coerce
		.number("ID заказа необходим")
		.int("ID заказа должен быть целым числом")
		.positive("ID заказа должен быть больше нуля"),

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
		.default("OZON"),

	deliveredAt: z
		.coerce
		.date("Дата доставки должна быть корректной")
		.optional()
}).strict();

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
