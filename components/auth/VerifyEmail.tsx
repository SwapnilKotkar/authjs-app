"use client";

import React, { useState, useTransition } from "react";
import { Check } from "lucide-react";

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { verifyEmailToken } from "@/lib/actions/user.actions";
import { signIn, useSession } from "next-auth/react";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useRouter, useSearchParams } from "next/navigation";

const VerifyEmail = () => {
	const { toast } = useToast();
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email");
	const token = searchParams.get("token");

	const [isPending, startTransition] = useTransition();
	const [emailError, setemailError] = useState("");
	const [emailSuccess, setEmailSuccess] = useState("");
	const { data: session } = useSession();

	async function onSubmit() {
		setemailError("");
		setEmailSuccess("");

		startTransition(async () => {
			if (!email || !token) {
				setemailError("Something went wrong. Please go back and signup again.");
				return;
			}
			try {
				let response = await verifyEmailToken({
					email: email,
					emailToken: token,
				});

				console.log("verify_otp_res", response);

				if (response.status !== 200) {
					setemailError(response.message);
					return;
				}

				setEmailSuccess("Email verified successfully");

				router.push("/signin");

				// const result = await signIn("credentials", {
				// 	redirect: false,
				// 	email: email,
				// 	password: "qwerty",
				// 	token: "blah",
				// 	// callbackUrl: "http://localhost:3000/api/auth/callback/emailonly",
				// });

				// console.log("res123", result);
			} catch (error) {
				console.error("�� Error while verifying email---", error);
			}
		});
	}

	return (
		<div className="z-10 space-y-3 max-w-sm">
			{emailError && (
				<Alert variant="destructive">
					<ExclamationTriangleIcon className="h-4 w-4" />
					<AlertTitle>Verify error</AlertTitle>
					<AlertDescription>{emailError}</AlertDescription>
				</Alert>
			)}
			{emailSuccess && (
				<Alert variant="default" className="border-green-500">
					<Check className="h-4 w-4" color="green" />
					<AlertTitle className="text-green-500 font-medium">
						Success
					</AlertTitle>
					<AlertDescription className="text-green-500">
						{emailSuccess}
					</AlertDescription>
				</Alert>
			)}
			<Card className="mx-auto max-w-sm shadow-none border-none">
				<CardContent>
					{!emailSuccess && isPending ? (
						<Button disabled className="w-full mt-4">
							<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
							Verifying email...
						</Button>
					) : !emailSuccess ? (
						<Button type="submit" onClick={onSubmit} className="w-full mt-4">
							Verify email
						</Button>
					) : (
						""
					)}
					{emailSuccess && (
						<Button disabled className="w-full mt-4">
							<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
							Redirecting to signin page...
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default VerifyEmail;
