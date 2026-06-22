import z from "zod";

export const addDeliveredAtTimeSchema = z.strictObject({
	orderId: z
		.number("ID заказа обязтально должно быть")
		.int("ID заказа должно быть целым числом")
		.positive("ID заказа должно быть больше нуля"),
});

export type AddDeliveredAtTimeInput = z.infer<typeof addDeliveredAtTimeSchema>;
