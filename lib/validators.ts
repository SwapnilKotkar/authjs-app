import * as z from "zod";

export const signUpSchema = z.object({
	firstName: z
		.string()
		.min(3, { message: "First name must be at least 3 characters." }),
	lastName: z
		.string()
		.min(3, { message: "Last name must be at least 3 characters." }),
	username: z
		.string()
		.min(3, { message: "username must be at least 3 characters." }),
	email: z.string().email({ message: "Invalid email address." }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters." }),
});

export const loginSchema = z.object({
	email: z.string().email({ message: "Invalid email address." }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters." }),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email({ message: "Invalid email address." }),
});

export const onboardingSchema = z.object({
	username: z
		.string()
		.min(2, { message: "Username must be at least 2 characters." })
		.max(30, { message: "Username must be less than 30 characters." }),
	firstname: z
		.string()
		.min(2, { message: "First name must be at least 2 characters." }),
	lastname: z
		.string()
		.min(2, { message: "Last name must be at least 2 characters." }),
	photo: z.string().url().nonempty(),
	// .instanceof(FileList)
	// .refine((files) => files.length === 1, "Please upload a photo"),
});
