import * as z from "zod";

export const signUpSchema = z
	.object({
		email: z.string().email({ message: "Invalid email address." }),
		password: z
			.string()
			.min(6, { message: "Password must be at least 6 characters." }),
		confirmPassword: z
			.string()
			.min(6, { message: "Confirm password must be at least 6 characters." }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match.",
		path: ["confirmPassword"], // Optional: The field where the error message will appear
	});

export const loginSchema = z.object({
	email: z.string().email({ message: "Invalid email address." }),
	password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email({ message: "Invalid email address." }),
});

export const newPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(6, { message: "Password must be at least 6 characters." }),
		confirmNewPassword: z
			.string()
			.min(6, { message: "Confirm password must be at least 6 characters." }),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords do not match.",
		path: ["confirmNewPassword"], // Optional: The field where the error message will appear
	});

export const onboardingSchema = z.object({
	username: z
		.string()
		.min(2, { message: "Username must be at least 2 characters." })
		.max(30, { message: "Username must be less than 30 characters." }),
	email: z.string().email({ message: "Invalid email address." }),
	image: z.string().optional(), // Change image to a string that will hold the base64 data
});

export const otpSchema = z.object({
	otp: z
		.string()
		.length(6, "OTP must be exactly 6 digits")
		.regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});
