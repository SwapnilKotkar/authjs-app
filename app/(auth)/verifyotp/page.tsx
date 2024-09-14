import VerifyOTP from "@/components/auth/VerifyOTP";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import React from "react";

const page = () => {
	return (
		<div className="h-[100vh] flex items-center justify-center">
			<BackgroundBeamsWithCollision>
				<VerifyOTP />
			</BackgroundBeamsWithCollision>
		</div>
	);
};

export default page;
