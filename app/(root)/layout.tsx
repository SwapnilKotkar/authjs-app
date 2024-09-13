import type { Metadata } from "next";
import "../globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
// import { auth } from "@/auth";

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// const session = await auth();
	return (
		// session={session}
		<SessionProvider>
			<html lang="en">
				<body
					className={cn(
						"min-h-screen bg-background font-sans antialiased",
						fontSans.variable
					)}
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="light-rose"
						enableSystem
						disableTransitionOnChange
						themes={[
							"light",
							"dark",
							"light-green",
							"dark-green",
							"light-rose",
							"dark-rose",
							"light-yellow",
							"dark-yellow",
							"light-blue",
							"dark-blue",
						]}
					>
						{children}
					</ThemeProvider>
				</body>
			</html>
		</SessionProvider>
	);
}
