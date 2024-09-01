// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "./auth";

// export async function middleware(request: NextRequest) {
// 	const session = await auth();
// 	const url = request.nextUrl;

// 	console.log("Session middleware", session);
// 	console.log("url middleware", url);

// 	if (session && (url.pathname === "/signin" || url.pathname === "/signup")) {
// 		return NextResponse.redirect(new URL("/", request.url));
// 	}

// 	if (!session) {
// 		return NextResponse.redirect(new URL("/signin", request.url));
// 	}

// 	return NextResponse.next();
// }

// export const config = {
// 	matcher: ["/signin", "/signup", "/"],
// };

// export { auth as middleware } from "@/auth";

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { auth } from "@/auth";

// const protectedRoutes = ["/"];

// export default async function middleware(request: NextRequest) {
// 	const session = await auth();

// 	const isProtected = protectedRoutes.some((route) =>
// 		request.nextUrl.pathname.startsWith(route)
// 	);

// 	if (!session && isProtected) {
// 		const absoluteURL = new URL("/", request.nextUrl.origin);
// 		return NextResponse.redirect(absoluteURL.toString());
// 	}

// 	return NextResponse.next();
// }

// export const config = {
// 	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
	const session = await auth();
	const url = request.nextUrl;

	console.log("Session middleware", session);
	console.log("url middleware", url);

	return NextResponse.next();
}

export const config = {
	matcher: ["/signup", "/"],
	// matcher: ["/"],
};
