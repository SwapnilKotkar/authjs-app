import { connectToDatabase } from "./lib/database";

export function register() {
	console.log("invoked instrumentation.ts^^^^^^^^^^^^^^^");
	connectToDatabase();
}
