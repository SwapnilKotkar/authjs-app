import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
	if (cached.conn) return cached.conn;

	if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");
	if (!DB_NAME) throw new Error("DB_NAME is missing");

	cached.promise = mongoose.connect(MONGODB_URI, {
		dbName: DB_NAME,
		bufferCommands: false,
	});

	cached.conn = await cached.promise;

	console.log(`Connected to MongoDB: ${MONGODB_URI}`);

	return cached.conn;
};
