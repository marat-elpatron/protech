import z from "zod";

export const updatePaymentStatusSchema = z.strictObject({
	orderId: z
		.number("ID заказа обязтально должно быть")
		.int("ID заказа должно быть целым числом")
		.positive("ID заказа должно быть больше нуля"),

	paymentMethod: z
		.enum(
			["UPON_RECEIPT", "PAID"],
			"Способ оплаты необходим"
		)
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
