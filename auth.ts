import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyUserLogin } from "./lib/actions/user.actions";
import { getUserLoginParams } from "./types";
import { connectToDatabase } from "./lib/database";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required.");
				}

				try {
					let user = null;

					console.log("creds1234", credentials);

					user = await verifyUserLogin({
						email: credentials.email,
						password: credentials.password,
					} as getUserLoginParams);

					console.log("findUser auth********", user);

					if (!user.data) {
						throw new Error("User not found.");
					}

					console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooo");

					return user.data;
				} catch (error) {
					throw new Error("User not found.");
				}
			},
		}),
	],
	callbacks: {
		jwt({ token, user }) {
			console.log("jwt_token11111111", token);
			console.log("jwt_user11111111", user);
			if (user) {
				token._id = user._id?.toString();
				token.username = user.username;
				token.onboarding = user.onboarding;
			}
			return token;
		},
		session({ session, token }) {
			console.log("session_session11111111", session);
			console.log("session_token11111111", token);
			// if (session.user) {
			// 	session.user.id = token.id as string;
			// }

			if (token) {
				session.user._id = token._id as string;
				session.user.username = token.username as string;
				session.user.onboarding = token.onboarding as boolean;
			}

			console.log("22222222222222222222222222");

			console.log("session_after11111", session);

			return session;
		},
		signIn: async (props) => {
			// Handle the sign-in process here
			// Example: return true to allow sign-in or false to deny
			console.log("signIn_props11111", props);
			return true; // or false based on your sign-in logic
		},
	},
	pages: {
		signIn: "/signin",
		// signOut: "/signin",
		// error: "/error",
		// newUser: "/newuser",
		// verifyRequest: "/verify-request",
	},
} satisfies NextAuthConfig);
