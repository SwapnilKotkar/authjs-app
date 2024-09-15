// export const runtime = "nodejs";

// const MONGODB_URI = process.env.MONGODB_URI;
// const DB_NAME = process.env.DB_NAME;

// let cached = (global as any).mongoose || { conn: null, promise: null };

// export const connectToDatabase = async () => {
// 	if (cached.conn) {
// 		return cached.conn;
// 	}

// 	if (!MONGODB_URI) {
// 		throw new Error("MONGODB_URI is missing");
// 	}

// 	if (!DB_NAME) {
// 		throw new Error("DB_NAME is missing");
// 	}

// 	if (!cached.promise) {
// 		// Dynamically import mongoose only when the environment allows it
// 		const mongoose = await import("mongoose");

// 		cached.promise = mongoose
// 			.connect(MONGODB_URI, {
// 				dbName: DB_NAME,
// 				bufferCommands: false,
// 			})
// 			.then((mongooseConnection) => {
// 				console.log(`Connected to MongoDB: ${MONGODB_URI}`);
// 				return mongooseConnection;
// 			})
// 			.catch((error) => {
// 				console.error("Error connecting to MongoDB:", error);
// 				throw error;
// 			});
// 	}

// 	cached.conn = await cached.promise;
// 	return cached.conn;
// };

// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;
// const DB_NAME = process.env.DB_NAME;

// let cached = (global as any).mongoose || { conn: null, promise: null };

// export const connectToDatabase = async () => {
// 	if (cached.conn) return cached.conn;

// 	if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

// 	cached.promise =
// 		cached.promise ||
// 		mongoose.connect(MONGODB_URI, {
// 			dbName: DB_NAME,
// 			bufferCommands: false,
// 		});

// 	cached.conn = await cached.promise;

// 	return cached.conn;
// };

import mongoose from "mongoose";

let isConnected = false; // Variable to track the connection status

export const connectToDatabase = async () => {
	// Set strict query mode for Mongoose to prevent unknown field queries.
	mongoose.set("strictQuery", true);

	const MONGODB_URI = process.env.MONGODB_URI;
	const DB_NAME = process.env.DB_NAME;

	if (!MONGODB_URI) return console.log("Missing MongoDB URL");

	// If the connection is already established, return without creating a new connection.
	if (isConnected) {
		console.log("MongoDB connection already established");
		return;
	}

	try {
		await mongoose.connect(MONGODB_URI, {
			dbName: DB_NAME,
		});

		isConnected = true; // Set the connection status to true
		console.log("MongoDB connected");
	} catch (error: any) {
		console.log(`Error connecting to Mongo: ${error.message}`);
	}
};
