import NextAuth, { NextAuthConfig, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import {
	createGoogleUser,
	isUserProviderLoggedIn,
	verifyUserLogin,
} from "./lib/actions/user.actions";
import { getUserLoginParams } from "./types";

const authOptions: NextAuthConfig = {
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
					token.username = user.username || user.name;
					token.image = user.image;

					if (typeof user.onboarding !== undefined) {
						token.onboarding = user.onboarding;
					} else {
						delete token.onboarding;
					}
				}
			} else if (trigger == "update") {
				token = {
					...token,
					username: session.user.username,
					image: session.user.image,
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
			session.user.username = (token.username || token.name) as string;
			session.user.image = token.image as string;

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
		async signIn({ account, email, user, credentials, profile }) {
			// Handle the sign-in process here
			// Example: return true to allow sign-in or false to deny
			console.log("signIn_account", account);
			console.log("signIn_email", email);
			console.log("signIn_user", user);
			console.log("signIn_credentials", credentials);
			console.log("signIn_profile", profile);

			if (account?.provider === "credentials") {
				console.log("1234****");
				let res = await isUserProviderLoggedIn({
					email: credentials?.email,
				} as { email: string });

				console.log("res_final", res);

				if (res.status !== 200) {
					return `/signin?error=${res.error}`;
				}
				return true;
			} else if (account?.provider === "google") {
				if (!user?.email) {
					return "/signin?error=Email is required for Google login";
				}

				if (!profile?.email_verified) {
					return "/signin?error=Email is not verified. Please contact google support.";
				}

				const newUser = await createGoogleUser({
					email: user.email,
					username: profile.name || user.email.split("@")[0],
					providerAccountId: account.providerAccountId,
					providerType: account.provider,
					image: profile.picture,
				});

				return true;
			}

			return true; // or false based on your sign-in logic
		},
	},
	// pages: {
	// 	// signIn: "/signin",
	// 	// signOut: "/signin",
	// 	// error: "/error",
	// 	// newUser: "/newuser",
	// 	// verifyRequest: "/verify-request",
	// },
	// debug: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
