import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (request) => {
	const session = await auth();
	const url = request.nextUrl;
	const publicRoutes = [
		"/signin",
		"/signup",
		"/forgotpassword",
		"/resetpassword",
		"/verifyotp",
		"/verifyemail",
	];
	const emailParam = url.searchParams.get("email");
	const emailToken = url.searchParams.get("token");
	const resetPasswordToken = url.searchParams.get("resetpasswordtoken");

	console.log("Session middleware^^^^^^^^^^^^^^", session);
	console.log("url middleware", url);

	// Check if the current path is a public route
	if (!session && publicRoutes.includes(url.pathname)) {
		// Additional check for the /verifyotp route to ensure the email query parameter exists
		if (
			url.pathname === "/verifyotp" &&
			(!emailParam || emailParam.trim() === "")
		) {
			return NextResponse.redirect(new URL(`/signin`, request.url)); // Redirect to signin if email is missing or empty
		} else if (
			url.pathname === "/verifyemail" &&
			(!emailParam || emailParam.trim() === "") &&
			(!emailToken || emailToken.trim() === "")
		) {
			return NextResponse.redirect(new URL(`/signin`, request.url)); // Redirect to signin if email is missing or empty
		} else if (
			url.pathname === "/resetpassword" &&
			(!emailParam || emailParam.trim() === "") &&
			(!resetPasswordToken || resetPasswordToken.trim() === "")
		) {
			return NextResponse.redirect(new URL(`/signin`, request.url)); // Redirect to signin if email is missing or empty
		}
		return NextResponse.next();
	}

	// Redirect unauthenticated users to signin if they are not on a public route
	if (!session && !publicRoutes.includes(url.pathname)) {
		return NextResponse.redirect(new URL(`/signin`, request.url));
	}

	// Redirect users who haven't completed onboarding to /onboarding
	if (
		session &&
		session.user.onboarding === false &&
		url.pathname !== "/onboarding"
	) {
		return NextResponse.redirect(new URL(`/onboarding`, request.url));
	}

	// Allow users to access /onboarding if they haven't completed it
	if (
		session &&
		url.pathname === "/onboarding" &&
		session.user.onboarding === false
	) {
		return NextResponse.next();
	}

	// Redirect authenticated users to home if trying to access other pages
	if (session && url.pathname !== "/") {
		return NextResponse.redirect(new URL(`/`, request.url));
	}

	// Allow all other requests to proceed
	return NextResponse.next();
});

export const config = {
	unstable_allowDynamic: ["/lib/database/index.ts", "/models/**"],
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
