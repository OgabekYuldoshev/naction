import { ZodError, type z } from "zod";

type ActionResult<Result> =
	| { success: true; data: Result }
	| { success: false; error: string };

function schema<Schema extends z.ZodSchema>(schema: Schema) {
	return {
		action<Fn extends (values: z.infer<typeof schema>) => Promise<any>>(
			fn: Fn,
		) {
			return async (values: z.infer<typeof schema>) => {
				try {
					const parsedValues = await schema.parseAsync(values);
					const result = await fn(parsedValues);
					return {
						success: true,
						data: result,
					};
				} catch (error) {
					let errorMessage = "An error occurred";

					if (error instanceof Error) {
						errorMessage = error.message;
					}

					if (error instanceof ZodError) {
						let validationError = "";
						const fieldErrors = error.flatten().fieldErrors;
						for (const key of Object.keys(fieldErrors)) {
							const errors = fieldErrors[key]?.reduce((acc, value) => {
								if (acc) {
									return `${acc}, ${value}`;
								}

								return value;
							}, "");

							if (validationError) {
								validationError = `${validationError} \n ${key}: ${errors}`;
							} else {
								validationError = `${key}: ${errors}`;
							}
							console.log(fieldErrors[key]);
						}
						errorMessage = validationError;
					}

					return {
						success: false,
						error: errorMessage,
					};
				}
			};
		},
	};
}

function action<Fn extends () => Promise<any>>(fn: Fn) {
	return async (): Promise<ActionResult<Awaited<ReturnType<typeof fn>>>> => {
		try {
			const result = await fn();
			return {
				success: true,
				data: result,
			};
		} catch (error) {
			let errorMessage = "An error occurred";

			if (error instanceof Error) {
				errorMessage = error.message;
			}

			return {
				success: false,
				error: errorMessage,
			};
		}
	};
}

export default { action, schema };
