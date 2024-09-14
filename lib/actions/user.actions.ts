"use server";

import {
	CreateUserParams,
	getUserLoginParams,
	providersLoginParams,
	UpdateUserParams,
} from "@/types";
import { connectToDatabase } from "../database";
import User from "@/models/user.model";
import { revalidatePath } from "next/cache";
import CryptoJS from "crypto-js";
import { auth } from "@/auth";

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
		console.log("user data to create mongo doc---", user);
		await connectToDatabase();

		user.password = await hashPassword(user.password);

		console.log("user_after____", user);

		const newUser = await User.create({
			email: user.email,
			password: user.password,
			onboarding: false,
		});

		console.log("✅ NEW user created", newUser);

		revalidatePath(user.path);

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
				$unset: { onboarding: "" },
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

export async function getUserbyId(userId: string) {
	try {
		console.log("get userId doc999999999999", userId);
		await connectToDatabase();

		let findUser = await User.findById(userId);

		if (!findUser) {
			return JSON.parse(
				JSON.stringify({
					error: "User not found",
					message: "User not found",
					status: 404,
				})
			);
		}

		console.log("✅User found---", findUser);

		return JSON.parse(
			JSON.stringify({
				data: findUser,
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

		let findUser = await User.findOne(
			{
				$or: [{ email: user.email }, { username: user.email }],
			},
			{
				password: 0,
				__v: 0,
			}
		);

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
