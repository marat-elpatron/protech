import z from "zod";

export const createCategorySchema = z.object({
	name: z
		.string('Название категории необходимо')
		.max(50, 'Название категории не более 50 символов')
		.min(1, "Название категории необходимо")
		.trim()
}).strict()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
