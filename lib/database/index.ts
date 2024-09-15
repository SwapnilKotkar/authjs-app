export const runtime = "nodejs";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
	if (cached.conn) {
		return cached.conn;
	}

	if (!MONGODB_URI) {
		throw new Error("MONGODB_URI is missing");
	}

	if (!DB_NAME) {
		throw new Error("DB_NAME is missing");
	}

	if (!cached.promise) {
		// Dynamically import mongoose only when the environment allows it
		const mongoose = await import("mongoose");

		cached.promise = mongoose
			.connect(MONGODB_URI, {
				dbName: DB_NAME,
				bufferCommands: false,
			})
			.then((mongooseConnection) => {
				console.log(`Connected to MongoDB: ${MONGODB_URI}`);
				return mongooseConnection;
			})
			.catch((error) => {
				console.error("Error connecting to MongoDB:", error);
				throw error;
			});
	}

	cached.conn = await cached.promise;
	return cached.conn;
};
