import z from "zod";

export const createOrderSchema = z.object({
	obtainingMethod: z
		.enum(
			["DELIVERY", "PICKUP"],
			"Способ доставки необходим"
		),

	orderStatus: z
		.enum(
			["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"],
			"Статус доставки необходим"
		)
}).strict()

export type CreateOrderInput = z.infer<typeof createOrderSchema>
