import z from "zod";

const productImageSchema = z.strictObject({
	url: z
		.url("Некорректная ссылка на изображение")
		.trim()
		.min(1, "Ссылка на изображение необходима")
		.max(1000, "Ссылка на изображение должна быть не более 1000 символов")
});

const productAttributeSchema = z.strictObject({
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
});

export const createProductSchema = z.strictObject({
	name: z
		.string('Название продукта необходимо')
		.trim()
		.max(255, 'Название должно быть не более 255 символов')
		.min(1, "Название продукта необходимо"),

	description: z
		.string('Описание продукта необходимо')
		.trim()
		.max(1000, 'Описание должно быть не больше 1000 символов')
		.min(1, "Описание продукта необходимо"),

	currentPrice: z
		.coerce
		.number("Цена продукта необходима")
		.positive("Цена должна быть больше нуля"),

	oldPrice: z
		.coerce
		.number()
		.positive("Старая цена должна быть больше нуля")
		.optional(),

	article: z
		.string("Артикул продукта необходим")
		.trim()
		.min(1, "Артикул продукта необходим")
		.max(50, "Артикул должен быть не более 50 символов"),

	mainImage: z
		.string("Обязательно должно быть главное изображение")
		.trim()
		.min(1, "Обязательно должно быть главное изображение"),

	ozonLink: z
		.url("Ссылка должна иметь корректный формат адреса")
		.max(500, "Ссылка не должна быть более 500 символов")
		.includes("ozon", { message: "Укажите ссылку с сайта OZON" })
		.optional(),

	categoryId: z
		.coerce
		.number("У товара должна быть категория")
		.int("ID категории должен быть целым числом")
		.positive("ID категории должен быть больше нуля"),

	isActive: z
		.boolean()
		.default(true),

	productAttributes: z
		.array(productAttributeSchema)
		.optional(),

	productImages: z
		.array(productImageSchema)
		.optional()
})

export type CreateProductInput = z.infer<typeof createProductSchema>
