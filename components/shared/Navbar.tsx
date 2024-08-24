import React from "react";
import ThemeToggle from "../ThemeToggle";

const Navbar = () => {
	return (
		<div className="py-4 px-4 flex items-center justify-between border-b shadow-sm">
			<div>
				<p>Auth UI</p>
			</div>
			<ThemeToggle />
		</div>
	);
};

export default Navbar;
