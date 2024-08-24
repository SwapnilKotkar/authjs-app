import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	username: { type: String, unique: true },
	password: { type: String, required: true },
	photo: { type: String },
	onboarding: { type: Boolean, default: false },
});

const User = models.User || model("User", UserSchema);

export default User;
