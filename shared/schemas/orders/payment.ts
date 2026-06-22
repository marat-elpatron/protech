import z from "zod";

export const createPaymentSchema = z.object({
	orderId: z
		.coerce
		.number("ID заказа необходим")
		.int("ID заказа должен быть целым числом")
		.positive("ID заказа должен быть больше нуля"),

	paymentMethod: z
		.enum(
			["OFFLINE", "ONLINE"],
			"Способ оплаты необходим"
		),

	paymentStatus: z
		.enum(
			["UPON_RECEIPT", "PAID"],
			"Статус оплаты необходим"
		),

	amount: z
		.coerce
		.number("Сумма оплаты необходима")
		.positive("Сумма оплаты должна быть больше нуля"),

	transactionId: z
		.string()
		.trim()
		.max(255, "ID транзакции должен быть не более 255 символов")
		.optional(),

	paidAt: z
		.coerce
		.date("Дата оплаты должна быть корректной")
		.optional()
}).strict();

export type UpdatePaymentInput = z.infer<typeof createPaymentSchema>;
