import z from "zod";

export const createProductAttributeSchema = z.object({
	productId: z
		.coerce
		.number("ID продукта необходим")
		.int("ID продукта должен быть целым числом")
		.positive("ID продукта должен быть больше нуля"),

	attributeId: z
		.coerce
		.number("ID характеристики необходим")
		.int("ID характеристики должен быть целым числом")
		.positive("ID характеристики должен быть больше нуля"),

	value: z
		.string("Значение характеристики необходимо")
		.trim()
		.min(1, "Значение характеристики необходимо")
		.max(255, "Значение характеристики должно быть не более 255 символов")
}).strict();

export type CreateProductAttributeInput = z.infer<typeof createProductAttributeSchema>;
