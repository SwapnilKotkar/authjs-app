import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (request) => {
	const session = await auth();
	const url = request.nextUrl;

	console.log("Session middleware^^^^^^^^^^^^^^", session);
	console.log("url middleware", url);

	if (!session && url.pathname === "/signup") {
		return NextResponse.next();
	} else if (!session && url.pathname === "/forgotpassword") {
		return NextResponse.next();
	} else if (!session && url.pathname === "/verifyotp") {
		return NextResponse.next();
	} else if (!session && url.pathname !== "/signin") {
		return NextResponse.redirect(new URL(`/signin`, request.url));
	} else if (!session && url.pathname !== "/forgotpassword") {
		return NextResponse.next();
	} else if (!session && url.pathname !== "/verifyotp") {
		return NextResponse.next();
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
