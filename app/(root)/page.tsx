import { auth } from "@/auth";
import Navbar from "@/components/shared/Navbar";
import React from "react";

const page = async () => {
	const session = await auth();
	return (
		<div className="h-[100vh]">
			<Navbar />
			<div>hello</div>
			<pre className="py-6 px-4 whitespace-pre-wrap break-all">
				{JSON.stringify(session, null, 2)}
			</pre>
		</div>
	);
};

export default page;
