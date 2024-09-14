// app/api/send-otp/route.ts
import { connectToDatabase } from "@/lib/database";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import User from "@/models/user.model";

export async function POST(request: Request) {
	const { email } = await request.json();

	console.log("emailverify_payload_____", email);

	const transporter = nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	try {
		await connectToDatabase();

		const verifyEmailToken = CryptoJS.lib.WordArray.random(16).toString();
		const hashedVerifyEmailToken = CryptoJS.SHA256(verifyEmailToken).toString(
			CryptoJS.enc.Hex
		);

		await User.findOneAndUpdate(
			{ email: email },
			{
				$set: {
					isEmailVerified: false,
					emailVerifyResetToken: hashedVerifyEmailToken,
					emailVerifyResetExpires: Date.now() + 3600000, // Token expires in 1 hour
				},
			}
		);

		const emailVerifyUrl = `${process.env.NEXTAUTH_URL}/verifyemail?email=${email}&token=${verifyEmailToken}`;
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "Email Verification Request",
			text: `You requested a email verification. Please visit the following link to verify your email: ${emailVerifyUrl}`,
		};

		await transporter.sendMail(mailOptions);
		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.log("error in /verifyemail", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
