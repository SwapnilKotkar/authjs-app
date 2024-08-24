import SignIn from "@/components/auth/SignIn";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import React from "react";

const page = () => {
	return (
		<div className="h-[100vh] flex items-center justify-center">
			<BackgroundBeamsWithCollision>
				<SignIn />
			</BackgroundBeamsWithCollision>
		</div>
	);
};

export default page;
