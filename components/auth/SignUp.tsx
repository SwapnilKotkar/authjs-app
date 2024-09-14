"use client";

import React, { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import Link from "next/link";
import { signUpSchema } from "@/lib/validators";
import { createUser } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";

const SignUp = () => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [signupError, setSignupError] = useState("");

	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(data: z.infer<typeof signUpSchema>) {
		setSignupError("");
		console.log("user signup data", data);
		startTransition(async () => {
			try {
				const newUser = await createUser({
					email: data.email,
					password: data.password,
					path: "/users",
				});

				console.log("newUser created data---", newUser);

				switch (newUser?.status) {
					case 500:
						setSignupError("Something went wrong. Please try again!");
						break;
					case 400:
						setSignupError(newUser.message);
					case 409:
						setSignupError(newUser.message);
						break;
					case 201:
						const result = await signIn("credentials", {
							redirect: false,
							email: data.email,
							password: data.password,
						});

						console.log("sign_up_then_signin_result", result);
						if (!newUser.data.onboarding) {
							router.push(`/onboarding`);
						} else {
							router.push(`/`);
						}
						break;
					default:
						setSignupError(
							"An error occurred while creating user. Please try again!"
						);
						break;
				}
			} catch (error: any) {
				console.log("Error while creating user", error);
			}
		});
	}

	useEffect(() => {
		console.log("sign_up form errors", form.formState.errors); // Log form errors
	}, [form.formState.errors]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="z-10 space-y-3 max-w-md"
			>
				{signupError && (
					<Alert variant="destructive">
						<ExclamationTriangleIcon className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{signupError}</AlertDescription>
					</Alert>
				)}
				<Card className="mx-auto max-w-md">
					<CardHeader>
						<CardTitle className="text-xl">Sign Up</CardTitle>
						<CardDescription>
							Enter your information to create an account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Email <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="max@example.com"
												{...field}
											/>
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
										<FormLabel>
											Password <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Confirm Password <span className="text-red-500">*</span>
										</FormLabel>
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
									Create an account
								</Button>
							)}

							<div className="space-y-3 my-4">
								<div className="flex items-center space-x-3">
									<div className="h-[1px] flex-1 bg-foreground/50"></div>
									<small className="text-muted-foreground text-xs">
										OR CONTINUE WITH
									</small>
									<div className="h-[1px] flex-1 bg-foreground/50"></div>
								</div>
								<div className="space-y-3">
									<Button
										type="button"
										variant="outline"
										disabled={isPending ? true : false}
										onClick={() => signIn("google")}
										className="w-full space-x-2 flex items-center"
									>
										<FaGoogle size={15} color="#DB4437" />
										<span>Sign up with Google</span>
									</Button>
									<Button
										type="button"
										variant="outline"
										disabled={isPending ? true : false}
										onClick={() => signIn("github")}
										className="w-full space-x-2 flex items-center"
									>
										<FaGithub size={15} color="#333" />
										<span>Sign up with GitHub</span>
									</Button>
								</div>
							</div>
						</div>
						<div className="mt-4 text-center text-sm">
							Already have an account?{" "}
							<Link href="/signin" className="underline text-blue-500">
								Sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</form>
		</Form>
	);
};

export default SignUp;
