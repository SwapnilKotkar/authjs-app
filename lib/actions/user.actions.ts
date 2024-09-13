"use server";

import {
	CreateUserParams,
	getUserLoginParams,
	UpdateUserParams,
} from "@/types";
import { connectToDatabase } from "../database";
import User from "@/models/user.model";
import { revalidatePath } from "next/cache";
import CryptoJS from "crypto-js";
import { auth } from "@/auth";

const salt = process.env.PASSWORD_SECRET!; // Use an environment variable for security

// Encrypt function
export async function hashPassword(password: string): Promise<string> {
	// Combine password and salt
	const combined = password + salt;
	// Hash the combined string
	return CryptoJS.SHA256(combined).toString();
}

// Verify password against hashed password
export async function verifyPassword(
	password: string,
	hashedPassword: string
): Promise<boolean> {
	// Hash the input password
	const hash = await hashPassword(password);
	// Compare the hashed input password with the stored hashed password
	return hash === hashedPassword;
}

export async function createUser(user: CreateUserParams) {
	try {
		console.log("user data to create mongo doc---", user);
		await connectToDatabase();

		// const isUserExists = await User.findOne({ email: user.email });

		// if (isUserExists) {
		// 	console.log("user already exists", isUserExists);
		// 	return JSON.parse(
		// 		JSON.stringify({ message: "User already exists", status: 409 })
		// 	);
		// }

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
			// Handle the duplicate username error
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

// export async function updateUser(user: UpdateUserParams) {}

// Update an existing user
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
				photo: user.photo,
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
		await connectToDatabase();

		let encryptedPassword = await hashPassword(user.password);
		console.log("encryptedPassword---", encryptedPassword);

		let findUser = await User.findOne(
			{
				$or: [
					{ email: user.usernameOrEmail },
					{ username: user.usernameOrEmail },
				],
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
