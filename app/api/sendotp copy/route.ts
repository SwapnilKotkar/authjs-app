// app/api/send-otp/route.ts
import { connectToDatabase } from "@/lib/database";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import User from "@/models/user.model";
import { verifyEmailTemplate } from "@/lib/email_templates/verifyEmailTemplate";
import { resetPasswordTemplate } from "@/lib/email_templates/newPasswordTemplate";

export async function POST(request: Request) {
	const { email } = await request.json();

	console.log("password_reset_payload_____", email);

	const transporter = nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	try {
		await connectToDatabase();

		const resetToken = CryptoJS.lib.WordArray.random(16).toString();

		const hashedToken = CryptoJS.SHA256(resetToken).toString(CryptoJS.enc.Hex);

		await User.findOneAndUpdate(
			{ email: email },
			{
				$set: {
					passwordResetToken: hashedToken,
					passwordResetExpires: Date.now() + 10 * 60 * 1000, // Token expires in 10 minutes
				},
			}
		);

		const emailVerifyUrl = `${process.env.NEXTAUTH_URL}/resetpassword?email=${email}&resetpasswordtoken=${resetToken}`;
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "Email Verification Request",
			html: resetPasswordTemplate({
				email: email,
				resetPasswordLink: emailVerifyUrl,
				backgroundColor: "#000000",
				titleTextColor: "#fff",
				linkColor: "#3b82f6",
			}),
			text: `You requested a email verification. Please visit the following link to verify your email: ${emailVerifyUrl}`,
		};

		await transporter.sendMail(mailOptions);
		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.log("error in /resetpassword", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
