// app/api/send-otp/route.ts
import { connectToDatabase } from "@/lib/database";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import User from "@/models/user.model";
import { otpTemplate } from "@/lib/email_templates/otpTemplate";

export async function POST(request: Request) {
	const { email } = await request.json();

	console.log("sendotp_payload_____", email);

	const transporter = nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	try {
		await connectToDatabase();

		const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
		const hashedOTP = CryptoJS.SHA256(otp).toString(); // Generate a SHA256 hash

		console.log("otp123", otp);
		console.log("hashedOTP", hashedOTP);

		let res = await User.findOneAndUpdate(
			{ email: email },
			{
				$set: {
					otp: hashedOTP,
					otpExpires: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
				},
			},
			{
				new: true,
			}
		);

		console.log("res_update", res);

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "Next.js Auth.js OTP verification",
			html: otpTemplate({
				email: email,
				otp: otp,
				backgroundColor: "#000000",
				titleTextColor: "#fff",
			}),
			text: `You requested a password reset. Please use this OTP to verify your email: ${otp}`,
		};

		await transporter.sendMail(mailOptions);
		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.log("error in /sendotp", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
