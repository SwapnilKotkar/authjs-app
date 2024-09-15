"use server";

import {
	CreateUserParams,
	emailVerifyParams,
	getUserLoginParams,
	otpParams,
	providersLoginParams,
	resetPasswordParams,
	UpdateUserParams,
} from "@/types";
import { connectToDatabase } from "../database";
import User from "@/models/user.model";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import { auth } from "@/auth";
// import { sendOTPEmail, sendPasswordResetEmail } from "../mailer";

const salt = process.env.PASSWORD_SECRET!;

export async function hashPassword(password: string): Promise<string> {
	const combined = password + salt;
	return CryptoJS.SHA256(combined).toString();
}

export async function verifyPassword(
	password: string,
	hashedPassword: string
): Promise<boolean> {
	const hash = await hashPassword(password);
	return hash === hashedPassword;
}

export async function createUser(user: CreateUserParams) {
	try {
		await connectToDatabase();

		const isUserExists = await User.findOne({ email: user.email });

		if (isUserExists && !isUserExists.isEmailVerified) {
			let response = await createEmailVerificationToken(user.email);

			if (response.status !== 200) {
				return JSON.parse(
					JSON.stringify({
						error: "Failed",
						message: "Something went wrong",
						status: 500,
					})
				);
			}

			return JSON.stringify({
				data: isUserExists,
				message:
					"User already registered. Email verification link sent your email address, please check your inbox.",
				status: 200,
			});
		}

		user.password = await hashPassword(user.password);

		const newUser = await User.create({
			email: user.email,
			password: user.password,
			onboarding: false,
		});

		console.log("✅ NEW user created", newUser);

		// revalidatePath(user.path);

		return JSON.parse(
			JSON.stringify({
				data: newUser,
				message: "User created successfully",
				status: 201,
			})
		);
	} catch (error: any) {
		console.log("❌Error while creating user ---", error);

		if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
			return JSON.parse(
				JSON.stringify({
					error: "Email already exists",
					message:
						"Email already exists. Please login or create account with different email id.",
					status: 409,
				})
			);
		}

		return JSON.parse(
			JSON.stringify({
				error: error,
				message: "Something went wrong",
				status: 500,
			})
		);
	}
}

export async function updateUser(user: UpdateUserParams) {
	try {
		console.log("Updating user with data ---", user);
		await connectToDatabase();
		const session = await auth();
		console.log("user_action_session", session);

		const updatedUser = await User.findOneAndUpdate(
			{ email: session?.user.email }, // Use the session email as the filter
			{
				username: user.username,
				image: user.image,
				$unset: { onboarding: 1 },
			},
			{
				new: true, // Return the updated document
				projection: { password: 0 }, // Exclude the password field
			}
		);

		console.log(updatedUser);

		if (!updatedUser) {
			return JSON.parse(
				JSON.stringify({
					error: "User not found",
					message: "User not found",
					status: 404,
				})
			);
		}

		console.log("✅ User updated ---", updatedUser);

		return JSON.parse(
			JSON.stringify({
				data: updatedUser,
				message: "User updated successfully.",
				status: 200,
			})
		);
	} catch (error: any) {
		console.log("❌ Error while updating user ---", error);

		if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
			// Handle the duplicate username error
			return JSON.parse(
				JSON.stringify({
					error: "Username already exists",
					message:
						"The username you are trying to update already exists. Please choose a different username.",
					status: 409,
				})
			);
		}

		return JSON.parse(
			JSON.stringify({
				error: error,
				message: "Something went wrong",
				status: 500,
			})
		);
	}
}

export async function getUser({
	userId,
	email,
}: {
	userId?: string;
	email?: string;
}) {
	try {
		await connectToDatabase();

		let foundUser = await User.findOne({
			$or: [{ _id: userId }, { email: email }],
		});

		if (!foundUser) {
			return JSON.parse(
				JSON.stringify({
					error: "User not found",
					message: "User not found",
					status: 404,
				})
			);
		}

		console.log("✅User found---", foundUser);

		return JSON.parse(
			JSON.stringify({
				data: foundUser,
				message: "User found.",
				status: 200,
			})
		);
	} catch (error) {
		console.log("❌Error while getting user ---", error);
	}
}

export async function verifyUserLogin(user: getUserLoginParams) {
	try {
		let encryptedPassword = await hashPassword(user.password);
		console.log("encryptedPassword---", encryptedPassword);

		let findUser = await User.findOne({
			email: user.email,
			password: encryptedPassword,
		});

		console.log("✅findUser---", findUser);

		if (!findUser) {
			return JSON.parse(
				JSON.stringify({
					error: "User not found",
					message: "User not found",
					status: 404,
				})
			);
		}

		return JSON.parse(
			JSON.stringify({
				data: findUser,
				message: "User found.",
				status: 200,
			})
		);
	} catch (error) {
		console.log("❌Error while verifying user login ---", error);
		throw new Error("Error while verifying user login");
	}
}

export async function createProviderUser(user: providersLoginParams) {
	try {
		await connectToDatabase();

		console.log("createProviderUser_params", user);

		const existingUser = await User.findOne({ email: user.email });

		console.log("existingUser_data", existingUser);

		if (existingUser) {
			console.log(
				"existingUser.providers?.[user.providerType]",
				existingUser.providers?.[user.providerType]
			);
		}

		if (
			existingUser &&
			existingUser.providers?.[user.providerType] === user.providerAccountId
		) {
			console.log("here 1");

			const providerUser = await User.findOneAndUpdate(
				{ email: user.email },
				{
					$set: {
						username: user.username,
						email: user.email,
						image: user.image,
						isEmailVerified: true,
					},
				},
				{ new: true }
			);

			return true;
		} else {
			console.log("here 2");

			let existingProviders = existingUser?.providers || {};
			existingProviders = {
				...existingProviders,
				[user.providerType]: user.providerAccountId,
			};

			const providerUser = await User.findOneAndUpdate(
				{ email: user.email },
				{
					$set: {
						username: user.username,
						email: user.email,
						image: user.image,
						providers: existingProviders,
						isEmailVerified: true,
					},
				},
				{ upsert: true, new: true }
			);

			return true;
		}
	} catch (error) {
		console.log("❌❌Error while creating provider-user ---", error);
	}
}

export async function isUserProviderLoggedIn({ email }: { email: string }) {
	try {
		await connectToDatabase();

		const isUserExists = await User.findOne({ email: email });

		if (
			isUserExists &&
			isUserExists.providers &&
			Object.keys(isUserExists.providers).length > 0
		) {
			let keys = Object.keys(isUserExists.providers);

			return JSON.parse(
				JSON.stringify({
					error: "EmailLinkedWithProvider",
					// message: `The email you're trying to sign in with is already linked with the following providers as ${keys.join(
					// 	","
					// )}. Please sign in using the respective provider.`,
					status: 409,
				})
			);
		} else {
			return JSON.parse(
				JSON.stringify({
					message: "No linked providers found.",
					status: 200,
				})
			);
		}
	} catch (error) {
		console.log("❌Error while checking user provider login ---", error);

		return JSON.parse(
			JSON.stringify({
				error: "ServerError",
				message:
					"An error occurred while processing your request. Please try again later.",
				status: 500,
			})
		);
	}
}
export async function createPasswordResetToken(email: string) {
	try {
		await connectToDatabase();

		const isUserExists = await User.findOne({ email: email });

		if (
			isUserExists &&
			isUserExists.providers &&
			Object.keys(isUserExists.providers).length > 0
		) {
			let keys = Object.keys(isUserExists.providers);

			return JSON.parse(
				JSON.stringify({
					error: "EmailLinkedWithProvider",
					// message: `The email you're trying to sign in with is already linked with the following providers as ${keys.join(
					// 	","
					// )}. Please sign in using the respective provider.`,
					status: 409,
				})
			);
		}

		const response = await fetch(
			`${process.env.NEXTAUTH_URL}/api/resetpassword`,
			{
				method: "POST",
				body: JSON.stringify({ email }),
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const result = await response.json();

		console.log("reset_token_sent", result);

		if (!result.success) {
			return JSON.parse(
				JSON.stringify({
					error: "ResetPasswordSentFailed",
					message: "Failed to send reset password email. Please try again.",
					status: 500,
				})
			);
		}

		return JSON.parse(
			JSON.stringify({
				message: `Reset password email sent succesfully to ${email}. Please check your inbox or spam folder.`,
				status: 200,
			})
		);
	} catch (error) {
		console.log("❌ Error while sending reset password email---", error);

		return JSON.parse(
			JSON.stringify({
				error: "ResetPasswordEmailSentError",
				message: "Please try again.",
				status: 500,
			})
		);
	}
}

export async function createEmailVerificationToken(email: string) {
	try {
		const response = await fetch(
			`${process.env.NEXTAUTH_URL}/api/verifyemail`,
			{
				method: "POST",
				body: JSON.stringify({ email }),
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const result = await response.json();

		console.log("ver_token_sent", result);

		if (!result.success) {
			return JSON.parse(
				JSON.stringify({
					error: "EmailSentFailed",
					message: "Failed to send email. Please try to ssignup again.",
					status: 500,
				})
			);
		}

		return JSON.parse(
			JSON.stringify({
				message: `Verification email sent succesfully to ${email}. Please check your inbox or spam folder.`,
				status: 200,
			})
		);
	} catch (error) {
		console.log("❌ Error while sending verification email---", error);

		return JSON.parse(
			JSON.stringify({
				error: "EmailSentError",
				message: "Please try again.",
				status: 500,
			})
		);
	}
}

export async function verifyResetPasswordToken({
	email,
	newPassword,
}: resetPasswordParams) {
	try {
		await connectToDatabase();
		const existingUser = await User.findOne({ email: email });

		if (!existingUser) {
			return JSON.parse(
				JSON.stringify({
					error: "UserError",
					message: "Failed. Email address doesn't exists.",
					status: 404,
				})
			);
		}

		if (
			!existingUser ||
			!existingUser.passwordResetToken ||
			Date.now() > existingUser.passwordResetExpires
		) {
			return JSON.parse(
				JSON.stringify({
					error: "Invalidtoken",
					message: "Token is invalid or expired",
					status: 404,
				})
			);
		}

		if (!newPassword) {
			throw new Error("OTP is missing");
		}

		const hashedPassword = await hashPassword(newPassword);

		await User.findOneAndUpdate(
			{ email: email },
			{
				$set: {
					password: hashedPassword,
				},
				$unset: { passwordResetToken: 1, passwordResetExpires: 1 },
			}
		);

		return JSON.parse(
			JSON.stringify({
				message: "New password updated successfully",
				status: 200,
			})
		);
	} catch (error) {
		console.log("❌ Error while updating new password---", error);
	}
}

export async function verifyEmailToken({
	email,
	emailToken,
}: emailVerifyParams) {
	try {
		await connectToDatabase();
		const existingUser = await User.findOne({ email: email });

		if (!existingUser) {
			return JSON.parse(
				JSON.stringify({
					error: "UserError",
					message: "Failed. Email address doesn't exists.",
					status: 404,
				})
			);
		}

		if (
			!existingUser ||
			!existingUser.emailVerifyResetToken ||
			Date.now() > existingUser.emailVerifyResetExpires
		) {
			// throw new Error('OTP is invalid or expired');

			return JSON.parse(
				JSON.stringify({
					error: "InvalidorExpiredToken",
					message: "Token is invalid or expired",
					status: 404,
				})
			);
		}

		if (!emailToken) {
			throw new Error("Email token is missing");
		}

		const hashedEmailToken = CryptoJS.SHA256(emailToken).toString();

		if (hashedEmailToken !== existingUser.emailVerifyResetToken) {
			return JSON.parse(
				JSON.stringify({
					error: "InvalidEmailToken",
					message: "Email token is incorrect",
					status: 404,
				})
			);
		}

		await User.findOneAndUpdate(
			{ email: email },
			{
				$set: { isEmailVerified: true },
				$unset: { emailVerifyResetToken: 1, emailVerifyResetExpires: 1 },
			}
		);

		return JSON.parse(
			JSON.stringify({
				message: "Email is verified successfully",
				status: 200,
			})
		);
	} catch (error) {
		console.log("❌ Error while verifying OTP ---", error);
	}
}

export async function createAndSendOTP({ email }: otpParams) {
	try {
		await connectToDatabase();
		const existingUser = await User.findOne({ email: email });

		if (!existingUser) {
			return JSON.parse(
				JSON.stringify({
					error: "UserError",
					message: "Failed. Email address doesn't exists.",
					status: 404,
				})
			);
		}

		const response = await fetch(`${process.env.NEXTAUTH_URL}/api/sendotp`, {
			method: "POST",
			body: JSON.stringify({ email }),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const result = await response.json();

		console.log("otp_sent_res", result);

		if (!result.success) {
			return JSON.parse(
				JSON.stringify({
					error: "OTPSentFailed",
					message: "Failed to send. Please try to resend OTP.",
					status: 500,
				})
			);
		}

		return JSON.parse(
			JSON.stringify({
				message: `OTP sent succesfully to ${email}. Please check your inbox or spam folder.`,
				status: 200,
			})
		);
	} catch (error) {
		console.log("❌ Error while creating and sending OTP ---", error);

		return JSON.parse(
			JSON.stringify({
				error: "OTPSentError",
				message: "Please try again.",
				status: 500,
			})
		);
	}
}

export async function verifyOTP({ email, enteredOTP }: otpParams) {
	try {
		await connectToDatabase();
		const existingUser = await User.findOne({ email: email });

		if (!existingUser) {
			return JSON.parse(
				JSON.stringify({
					error: "UserError",
					message: "Failed. Email address doesn't exists.",
					status: 404,
				})
			);
		}

		if (
			!existingUser ||
			!existingUser.otp ||
			Date.now() > existingUser.otpExpires
		) {
			// throw new Error('OTP is invalid or expired');

			return JSON.parse(
				JSON.stringify({
					error: "InvalidorExpiredOTP",
					message: "OTP is invalid or expired",
					status: 404,
				})
			);
		}

		if (!enteredOTP) {
			throw new Error("OTP is missing");
		}

		const hashedEnteredOTP = CryptoJS.SHA256(enteredOTP).toString();

		if (hashedEnteredOTP !== existingUser.otp) {
			return JSON.parse(
				JSON.stringify({
					error: "InvalidOTP",
					message: "OTP is incorrect",
					status: 404,
				})
			);
		}

		await User.findOneAndUpdate(
			{ email: email },
			{ $unset: { otp: 1, otpExpires: 1 } }
		);

		return JSON.parse(
			JSON.stringify({
				message: "OTP is verified successfully",
				status: 200,
			})
		);
	} catch (error) {
		console.log("❌ Error while verifying OTP ---", error);
	}
}
