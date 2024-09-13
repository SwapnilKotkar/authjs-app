import NextAuth, { NextAuthConfig, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyUserLogin } from "./lib/actions/user.actions";
import { getUserLoginParams } from "./types";
import { connectToDatabase } from "./lib/database";

const authOptions: NextAuthConfig = {
	providers: [
		Credentials({
			credentials: {
				usernameOrEmail: {},
				password: {},
			},
			authorize: async (credentials): Promise<User | null> => {
				if (!credentials?.usernameOrEmail || !credentials?.password) {
					throw new Error("Username/email and password are required.");
				}

				try {
					connectToDatabase();
					let user = null;

					console.log("creds1234", credentials);

					user = await verifyUserLogin({
						usernameOrEmail: credentials.usernameOrEmail,
						password: credentials.password,
					} as getUserLoginParams);

					console.log("findUser auth********", user);

					if (!user.data) {
						// throw new Error("User not found.");
						return null;
					}

					console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooo");

					return user.data;
				} catch (error) {
					throw new Error("User not found.");
				}
			},
			// credentials: {
			// 	username: { label: "Username", type: "text", placeholder: "jsmith" },
			// 	email: { label: "Email", type: "email" },
			// 	password: { label: "Password", type: "password" },
			// },
			// async authorize(credentials): Promise<User | null> {
			// 	const users = [
			// 		{
			// 			id: "test-user-1",
			// 			userName: "test1",
			// 			name: "Test 1",
			// 			password: "123456",
			// 			email: "john@gmail.com",
			// 		},
			// 		{
			// 			id: "test-user-2",
			// 			userName: "test2",
			// 			name: "Test 2",
			// 			password: "pass",
			// 			email: "test2@donotreply.com",
			// 		},
			// 	];
			// 	const user = users.find(
			// 		(user) =>
			// 			user.email === credentials.email &&
			// 			user.password === credentials.password
			// 	);
			// 	return user
			// 		? { id: user.id, name: user.name, email: user.email }
			// 		: null;
			// },
		}),
	],
	callbacks: {
		async jwt({ token, user, account, profile, session, trigger }) {
			console.log(
				"***************************************************************"
			);
			console.log("jwt_token******************", token);
			console.log("jwt_user******************", user);
			console.log("jwt_account******************", account);
			console.log("jwt_profile******************", profile);
			console.log("jwt_session******************", session);
			console.log("jwt_trigger******************", trigger);

			if (trigger === "signUp" || trigger === "signIn") {
				if (user) {
					token._id = user._id?.toString();
					token.username = user.username;

					// Only add onboarding if it exists on the user object
					if (typeof user.onboarding !== undefined) {
						token.onboarding = user.onboarding;
					} else {
						// If onboarding is undefined or removed, delete it from the token
						delete token.onboarding;
					}
				}
			} else if (trigger == "update") {
				token = {
					...token,
					username: session.user.username,
					photo: session.user.photo,
				};

				delete token.onboarding;
			}

			console.log("final_token!!!!!!!!!!!!!!!!!!!!!!!", token);
			return token;
		},
		async session({ session, token, newSession, user, trigger }) {
			console.log(
				"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
			);
			console.log("session_session^^^^^^^^^^^^^^^^^^^^", session);
			console.log("session_token^^^^^^^^^^^^^^^^^^^^", token);
			console.log("session_newSession^^^^^^^^^^^^^^^^^^^^", newSession);
			console.log("session_user^^^^^^^^^^^^^^^^^^^^", user);
			console.log("session_trigger^^^^^^^^^^^^^^^^^^^^", trigger);

			session.user._id = token._id as string;
			session.user.username = token.username as string;

			// Only add onboarding if it exists in the token
			if (typeof token.onboarding !== undefined) {
				session.user.onboarding = token.onboarding as boolean;
			} else {
				// If onboarding is not in the token, remove it from the session
				delete session.user.onboarding;
			}

			// console.log("session_after11111", session);
			return session;
		},
		async signIn(props) {
			// Handle the sign-in process here
			// Example: return true to allow sign-in or false to deny
			console.log("signIn_props11111", props);
			return true; // or false based on your sign-in logic
		},
	},
	pages: {
		// signIn: "/signin",
		// signOut: "/signin",
		// error: "/error",
		// newUser: "/newuser",
		// verifyRequest: "/verify-request",
	},
	// debug: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
