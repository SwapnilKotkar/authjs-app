export const runtime = "nodejs";

import { otpParams } from "@/types";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

export const sendPasswordResetEmail = async (
	email: string,
	resetToken: string
) => {
	const resetUrl = `https://your-domain.com/reset-password?token=${resetToken}`;
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Password Reset Request",
		text: `You requested a password reset. Please visit the following link to reset your password: ${resetUrl}`,
	};

	return transporter.sendMail(mailOptions);
};

export const sendOTPEmail = async ({ email, enteredOTP }: otpParams) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Nextjs  Auth.js OTP verification",
		text: `You requested a password reset. Please use this otp to verify your email ${enteredOTP}`,
	};

	return transporter.sendMail(mailOptions);
};
