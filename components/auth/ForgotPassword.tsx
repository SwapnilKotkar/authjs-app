"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MoveLeft } from "lucide-react";
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
import { forgotPasswordSchema } from "@/lib/validators";
import Link from "next/link";
import { createAndSendOTP, createOTP } from "@/lib/actions/user.actions";
import { useSession } from "next-auth/react";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
	const { toast } = useToast();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [otpError, setOtpError] = useState("");
	const { data: session } = useSession();

	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(data: z.infer<typeof forgotPasswordSchema>) {
		startTransition(async () => {
			try {
				let response = await createAndSendOTP({ email: data.email });

				console.log("res_ent_otp", response);

				if (response.status !== 200) {
					setOtpError(response.message);
					return;
				}

				router.push(`/verifyotp?email=${data.email}`);
			} catch (error) {
				console.error("�� Error while sending OTP ---", error);
			}
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="z-10">
				{otpError && (
					<Alert variant="destructive">
						<ExclamationTriangleIcon className="h-4 w-4" />
						<AlertTitle>OTP error</AlertTitle>
						<AlertDescription>{otpError}</AlertDescription>
					</Alert>
				)}
				<Card className="mx-auto max-w-sm">
					<CardHeader>
						<div className="mb-2">
							<Link
								href="/signin"
								className="flex items-center space-x-2 text-xs text-primary hover:underline"
							>
								<MoveLeft className="mr-2 h-4 w-4" /> back
							</Link>
						</div>
						<CardTitle className="text-2xl">Forgot Password</CardTitle>
						<CardDescription>
							Enter your email to receive a password reset link.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="m@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{isPending ? (
							<Button disabled className="w-full mt-4">
								<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
								Sending OTP...
							</Button>
						) : (
							<Button type="submit" className="w-full mt-4">
								Send OTP
							</Button>
						)}
					</CardContent>
				</Card>
			</form>
		</Form>
	);
};

export default ForgotPassword;
