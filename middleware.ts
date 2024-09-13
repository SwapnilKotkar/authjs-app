// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";
// // import { auth } from "./auth";

// export async function middleware(request: NextRequest) {
// 	// const session = await auth();
// 	const url = request.nextUrl;

// 	// console.log("Session middleware", session);
// 	console.log("url middleware", url);

// 	const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "";
// 	const NEXTAUTH_SALT = process.env.NEXTAUTH_SALT || ""; // Add default or handle missing salt

// 	if (!NEXTAUTH_SECRET || !NEXTAUTH_SALT) {
// 		throw new Error("NEXTAUTH_SECRET or NEXTAUTH_SALT is not defined");
// 	}

// 	const token = await getToken({
// 		req: request,
// 		secret: NEXTAUTH_SECRET,
// 		salt: NEXTAUTH_SALT, // Include salt here
// 	});

// 	console.log("Token in middleware:", token);

// 	if (token) {
// 		// User is authenticated
// 		return NextResponse.next();
// 	} else {
// 		// Redirect to sign-in if not authenticated
// 		return NextResponse.redirect(new URL("/signin", request.url));
// 	}

// 	return NextResponse.next();
// }

// export const config = {
// 	matcher: [
// 		"/((?!api|signup|signin|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
// 	],
// };

import { auth } from "@/auth";
// import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export default auth(async (request) => {
	const session = await auth();
	const url = request.nextUrl;

	// const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "";
	// const NEXTAUTH_SALT = process.env.NEXTAUTH_SALT || ""; // Add default or handle missing salt

	// if (!NEXTAUTH_SECRET || !NEXTAUTH_SALT) {
	// 	throw new Error("NEXTAUTH_SECRET or NEXTAUTH_SALT is not defined");
	// }

	// const token = await getToken({
	// 	req: request,
	// 	secret: NEXTAUTH_SECRET,
	// 	salt: NEXTAUTH_SALT, // Include salt here
	// });

	// console.log("Token in middleware:", token);

	console.log("Session middleware^^^^^^^^^^^^^^", session);
	console.log("url middleware", url);

	if (!session && url.pathname === "/signup") {
		return NextResponse.next();
	} else if (!session && url.pathname !== "/signin") {
		return NextResponse.redirect(new URL(`/signin`, request.url));
	} else if (
		session &&
		session?.user.onboarding === false &&
		url.pathname !== "/onboarding"
	) {
		return NextResponse.redirect(new URL(`/onboarding`, request.url));
	} else if (
		session &&
		url.pathname === "/onboarding" &&
		session?.user.onboarding === false
	) {
		return NextResponse.next();
	} else if (session && url.pathname !== "/") {
		return NextResponse.redirect(new URL(`/`, request.url));
	} else {
		return NextResponse.next();
	}
});

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
