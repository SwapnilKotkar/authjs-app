"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, MoveLeft } from "lucide-react";
import { z } from "zod";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { otpSchema } from "@/lib/validators";
import Link from "next/link";
import {
	createAndSendOTP,
	createOTP,
	verifyOTP,
} from "@/lib/actions/user.actions";
import { useSession } from "next-auth/react";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useRouter, useSearchParams } from "next/navigation";

const VerifyOTP = () => {
	const { toast } = useToast();
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email");
	const [isPending, startTransition] = useTransition();
	const [otpError, setOtpError] = useState("");
	const [otpSuccess, setOtpSuccess] = useState("");
	const { data: session } = useSession();

	const form = useForm<z.infer<typeof otpSchema>>({
		resolver: zodResolver(otpSchema),
		defaultValues: {
			otp: "",
		},
	});

	async function onSubmit(data: z.infer<typeof otpSchema>) {
		setOtpError("");
		setOtpSuccess("");

		startTransition(async () => {
			if (!email) {
				setOtpError(
					"Something went wrong. Please go back and generate OTP again."
				);
				return;
			}
			try {
				let response = await verifyOTP({ email: email, enteredOTP: data.otp });

				console.log("verify_otp_res", response);

				if (response.status !== 200) {
					setOtpError(response.message);
					return;
				}

				setOtpSuccess("OTP verified successfully");

				setTimeout(() => {
					router.push(`/signin`);
				}, 1500);
			} catch (error) {
				console.error("�� Error while sending OTP ---", error);
			}
		});
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="z-10 space-y-3 max-w-sm"
			>
				{otpError && (
					<Alert variant="destructive">
						<ExclamationTriangleIcon className="h-4 w-4" />
						<AlertTitle>Verify error</AlertTitle>
						<AlertDescription>{otpError}</AlertDescription>
					</Alert>
				)}
				{otpSuccess && (
					<Alert variant="default" className="border-green-500">
						<Check className="h-4 w-4" color="green" />
						<AlertTitle className="text-green-500 font-medium">
							Verified successfully
						</AlertTitle>
						<AlertDescription className="text-green-500">
							{otpSuccess}
						</AlertDescription>
					</Alert>
				)}
				<Card className="mx-auto max-w-sm">
					<CardHeader>
						<div className="mb-2">
							<Link
								href="/forgotpassword"
								className="flex items-center space-x-2 text-xs text-primary hover:underline"
							>
								<MoveLeft className="mr-2 h-4 w-4" /> back
							</Link>
						</div>
						<CardTitle className="text-2xl">Verify OTP</CardTitle>
						<CardDescription>Please enter your 6-digit OTP.</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name="otp"
							render={({ field }) => (
								<FormItem>
									<FormLabel>OTP</FormLabel>
									<FormControl>
										<Input type="text" placeholder="123456" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{!otpSuccess && isPending ? (
							<Button disabled className="w-full mt-4">
								<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
								Verifying OTP...
							</Button>
						) : (
							<Button type="submit" className="w-full mt-4">
								Verify OTP
							</Button>
						)}
						{otpSuccess && (
							<Button disabled className="w-full mt-4">
								<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
								Redirecting to signin page...
							</Button>
						)}
					</CardContent>
				</Card>
			</form>
		</Form>
	);
};

export default VerifyOTP;
