"use client";
import React from "react";
import ThemeToggle from "../ThemeToggle";
// import { auth } from "@/auth";
import { Button } from "../ui/button";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
	const { data: session } = useSession();
	console.log("navbar session", session);
	return (
		<div className="py-4 px-4 flex items-center justify-between border-b shadow-sm">
			<div>
				<p>Auth UI</p>
			</div>
			<div className="flex items-center space-x-2">
				{session && (
					<Button
						onClick={() => {
							signOut();
						}}
					>
						Sign out
					</Button>
				)}
				<ThemeToggle />
			</div>
		</div>
	);
};

export default Navbar;
