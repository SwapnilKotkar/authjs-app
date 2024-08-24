"use client";

import React from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { forgotPasswordSchema } from "@/lib/validators";
import Link from "next/link";

const ForgotPassword = () => {
	const { toast } = useToast();

	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	function onSubmit(data: z.infer<typeof forgotPasswordSchema>) {
		toast({
			title: "Password reset email sent",
			description: `If an account with the email ${data.email} exists, you will receive a password reset email shortly.`,
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="z-10">
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
						<Button type="submit" className="w-full mt-4">
							Send Reset Link
						</Button>
					</CardContent>
				</Card>
			</form>
		</Form>
	);
};

export default ForgotPassword;
