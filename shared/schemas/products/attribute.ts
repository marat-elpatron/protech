import z from "zod";

export const createAttributeSchema = z.object({
	name: z
		.string("Название характеристики необходимо")
		.trim()
		.min(1, "Название характеристики необходимо")
		.max(100, "Название характеристики должно быть не более 100 символов"),

	unit: z
		.string()
		.trim()
		.max(30, "Единица измерения должна быть не более 30 символов")
		.optional()
}).strict();

export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
