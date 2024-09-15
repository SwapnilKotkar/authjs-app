import type { NextAuthConfig } from "next-auth";
import { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { verifyUserLogin } from "./lib/actions/user.actions";
import { getUserLoginParams } from "./types";

const authConfig: NextAuthConfig = {
	providers: [
		Credentials({
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials): Promise<User | null> => {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Username/email and password are required.");
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
						// throw new Error("User not found.");
						return null;
					}

					console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooo");

					return user.data;
				} catch (error) {
					throw new Error("User not found.");
				}
			},
		}),
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			// authorization: {
			// 	params: {
			// 		prompt: "consent",
			// 		access_type: "offline",
			// 		response_type: "code",
			// 	},
			// },
		}),
		GitHub({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		}),
	],
};

export default authConfig;
