import type {
	Mongoose,
	Schema as MongooseSchema,
	Model,
	Models,
} from "mongoose";

let mongoose: Mongoose | undefined;
let Schema: MongooseSchema;
let model: Model<any>;
let models: Models;

export const loadMongoose = async () => {
	if (!mongoose) {
		const mongooseModule = await import("mongoose");
		mongoose = mongooseModule.default;
		Schema = Schema;
		model = model;
		models = mongoose.models;
	}

	return { mongoose, Schema, model, models };
};
