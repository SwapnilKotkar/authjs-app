import NextAuth, { NextAuthConfig, User } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient, ServerApiVersion } from "mongodb";
import { connectToDatabase } from "./lib/database"; // Your Mongoose connection logic
import {
	createProviderUser,
	getUser,
	isUserProviderLoggedIn,
} from "./lib/actions/user.actions";
import authConfig from "./auth.config";

const MONGODB_URI = process.env.MONGODB_URI!;
const clientPromise = MongoClient.connect(MONGODB_URI, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

const authOptions: NextAuthConfig = {
	// @ts-ignore
	adapter: MongoDBAdapter(clientPromise),
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

			if (!session.user._id) {
				const userData = await getUser({ email: session.user.email });
				// console.log("provider_user_data", userData);

				session.user._id = userData?.data._id.toString();
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

				if (!user.isEmailVerified) {
					return "/signin?error=EmailNotVerified";
				}

				let res = await isUserProviderLoggedIn({
					email: credentials?.email,
				} as { email: string });

				console.log("res_final", res);

				if (res.status !== 200) {
					return `/signin?error=${res.error}`;
				}
				return true;
			} else if (account?.provider === "emailonly") {
				console.log("inside_emailonly");

				return true;
			} else if (account?.provider === "google") {
				if (!user?.email) {
					return "/signin?error=Email is required for Google login";
				}

				if (!profile?.email_verified) {
					return "/signin?error=Email is not verified. Please contact google support.";
				}

				const newUser = await createProviderUser({
					email: user.email,
					username: profile.name || user.email.split("@")[0],
					providerAccountId: account.providerAccountId,
					providerType: account.provider,
					image: profile.picture,
				});

				return true;
			} else if (account?.provider === "github") {
				if (!user?.email) {
					return "/signin?error=Email is required for GitHub login";
				}
				const newUser = await createProviderUser({
					email: user.email,
					username: user.name || user.email.split("@")[0],
					providerAccountId: account.providerAccountId,
					providerType: account.provider,
					image: user.image || "",
				});

				return true;
			}

			return true;
		},
	},
	session: { strategy: "jwt" },
	...authConfig,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
