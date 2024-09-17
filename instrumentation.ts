import { connectToDatabase } from "./lib/database";

export function register() {
	connectToDatabase();
}
