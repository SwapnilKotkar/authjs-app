import ResetPassword from "@/components/auth/ResetPassword";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import React from "react";

const page = () => {
	return (
		<div className="h-[100vh] flex items-center justify-center">
			<BackgroundBeamsWithCollision>
				<ResetPassword />
			</BackgroundBeamsWithCollision>
		</div>
	);
};

export default page;
