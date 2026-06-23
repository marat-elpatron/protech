import z from "zod";

export const idParamsSchema = z.strictObject({
	id: z
		.coerce
		.number("ID необходим")
		.int("ID должен быть целым числом")
		.positive("ID должен быть больше нуля"),
});

export type IdParamsInput = z.infer<typeof idParamsSchema>;
