const isEdge = process.env.NEXT_RUNTIME === "edge";

// Conditionally import mongoose only in Node.js environment
let mongoose;
if (!isEdge) {
  mongoose = require("mongoose");
}

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (isEdge) {
    throw new Error("MongoDB connections are not supported in the Edge runtime.");
  }

  if (cached.conn) {
    // If already connected, return the existing connection
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }
  if (!DB_NAME) {
    throw new Error("DB_NAME is missing");
  }

  if (!cached.promise) {
    // If no existing promise, create a new connection
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: DB_NAME,
        bufferCommands: false, // Make sure to disable command buffering
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

  // Wait for the connection to resolve
  cached.conn = await cached.promise;
  return cached.conn;
};
