import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUser } from "./lib/actions/user.actions";
import { getUserParams } from "./types";
// import { connectToDatabase } from "./lib/database";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required.");
				}

				// await connectToDatabase();

				let user = null;

				console.log("creds1234", credentials);

				// logic to salt and hash password
				//   const pwHash = saltAndHashPassword(credentials.password)

				// logic to verify if the user exists
				//   user = await getUserFromDb(credentials.email, pwHash)

				user = await getUser({
					credentials: {
						email: credentials.email,
						password: credentials.password,
					},
				} as getUserParams);

				console.log("findUser auth********", user);

				if (!user) {
					// No user found, so this is their first attempt to login
					// meaning this is also the place you could do registration
					throw new Error("User not found.");
				}

				console.log(
					"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
				);

				// return user object with their profile data
				return user;
			},
		}),
	],
	callbacks: {
		jwt({ token, user }) {
			console.log("jwt_token******", token);
			console.log("jwt_user******", user);
			if (user) {
				token.id = user.id;
			}
			return { ...token, ...user };
		},
		session({ session, token }) {
			console.log("session_session******", session);
			console.log("session_token******", token);
			if (session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
		signIn: async (props) => {
			// Handle the sign-in process here
			// Example: return true to allow sign-in or false to deny
			console.log("signIn_props******", props);
			return true; // or false based on your sign-in logic
		},
	},
	pages: {
		signIn: "/signin",
		signOut: "/signin",
		// error: "/error",
		// newUser: "/newuser",
		// verifyRequest: "/verify-request",
	},
});
