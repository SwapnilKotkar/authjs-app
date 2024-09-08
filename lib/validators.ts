import * as z from "zod";

export const signUpSchema = z
	.object({
		firstName: z
			.string()
			.min(3, { message: "First name must be at least 3 characters." }),
		lastName: z
			.string()
			.min(3, { message: "Last name must be at least 3 characters." }),
		// username: z
		// 	.string()
		// 	.min(3, { message: "username must be at least 3 characters." }),
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
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters." }),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email({ message: "Invalid email address." }),
});

// export const onboardingSchema = z.object({
// 	username: z
// 		.string()
// 		.min(2, { message: "Username must be at least 2 characters." })
// 		.max(30, { message: "Username must be less than 30 characters." }),
// 	email: z.string().email({ message: "Invalid email address." }),
// 	// firstname: z
// 	// 	.string()
// 	// 	.min(2, { message: "First name must be at least 2 characters." }),
// 	// lastname: z
// 	// 	.string()
// 	// 	.min(2, { message: "Last name must be at least 2 characters." }),
// 	photo: z
// 		.instanceof(FileList)
// 		.refine((files) => files.length > 0, { message: "Please upload a photo." }) // Check if the file is uploaded
// 		.refine(
// 			(files) => files[0]?.type.startsWith("image/"),
// 			{ message: "File must be an image." } // Validate file type
// 		)
// 		.refine(
// 			(files) => files[0]?.size <= 5 * 1024 * 1024, // 5 MB max size
// 			{ message: "File size must be less than 5MB." } // Validate file size
// 		),
// });

export const onboardingSchema = z.object({
	username: z
		.string()
		.min(2, { message: "Username must be at least 2 characters." })
		.max(30, { message: "Username must be less than 30 characters." }),
	email: z.string().email({ message: "Invalid email address." }),
	photo: z.string().optional(), // Change photo to a string that will hold the base64 data
});
