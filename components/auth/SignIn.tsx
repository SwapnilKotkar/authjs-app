"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "../ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { loginSchema } from "@/lib/validators";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";

const SignIn = () => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [signinError, setSigninError] = useState("");

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			usernameOrEmail: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof loginSchema>) {
		setSigninError("");
		console.log("signin data", data);
		startTransition(async () => {
			try {
				const result = await signIn("credentials", {
					redirect: false,
					usernameOrEmail: data.usernameOrEmail,
					password: data.password,
				});

				console.log("signin_result", result);

				if (result?.error) {
					switch (result?.error) {
						case "CredentialsSignin":
							setSigninError("Invalid email or password");
							break;
						default:
							setSigninError("An error occurred while signing in");
							break;
					}

					return;
				}

				router.push("/");
			} catch (error) {
				console.log("signin error", error);
			}
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="z-10 space-y-3">
				{signinError && (
					<Alert variant="destructive">
						<ExclamationTriangleIcon className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{signinError}</AlertDescription>
					</Alert>
				)}
				<Card className="mx-auto max-w-sm">
					<CardHeader>
						<CardTitle className="text-2xl">Login</CardTitle>
						<CardDescription>
							Enter your email below to login to your account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="usernameOrEmail"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Username or Email <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input type="text" placeholder="" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center">
											<FormLabel>
												Password <span className="text-red-500">*</span>
											</FormLabel>
											<Link
												href="/forgotpassword"
												className="ml-auto inline-block text-sm underline"
											>
												Forgot your password?
											</Link>
										</div>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{isPending ? (
								<Button disabled>
									<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
									Please wait
								</Button>
							) : (
								<Button type="submit" className="w-full">
									Login
								</Button>
							)}
							<Button
								variant="outline"
								disabled={isPending ? true : false}
								className="w-full"
							>
								Login with Google
							</Button>
						</div>
						<div className="mt-4 text-center text-sm">
							Don&apos;t have an account?{" "}
							<Link href="/signup" className="underline">
								Sign up
							</Link>
						</div>
					</CardContent>
				</Card>
			</form>
		</Form>
	);
};

export default SignIn;
