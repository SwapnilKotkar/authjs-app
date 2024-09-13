import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface User {
		_id?: string;
		username?: string;
		onboarding?: boolean;
	}
	interface Session {
		user: {
			_id?: string;
			username?: string;
			onboarding?: boolean;
		} & DefaultSession["user"];
	}
	interface JWT {
		user: {
			_id?: string;
			username?: string;
			onboarding?: boolean;
		} & DefaultSession["user"];
	}
}
