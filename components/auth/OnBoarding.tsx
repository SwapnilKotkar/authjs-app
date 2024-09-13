"use client";

import React, { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { onboardingSchema } from "@/lib/validators";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { updateUser } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

// Define the Zod schema

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
	const router = useRouter();

	const { data: session, update, status } = useSession();
	console.log("session_onboarding", session);
	const { toast } = useToast();
	const [onBoardingError, setOnboardingError] = useState("");
	const [isPending, startTransition] = useTransition();
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoError, setPhotoError] = useState("");

	const form = useForm<OnboardingFormData>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			username: "",
			email: "",
			// firstname: "",
			// lastname: "",
			photo: null as any,
		},
	});

	// async function onSubmit(data: OnboardingFormData) {
	// 	console.log("onboarding_data", data);

	// 	startTransition(async () => {
	// 		try {
	// 			const updateUserData = await updateUser({
	// 				//PASS required params here to save username and photo
	// 			});

	// 			console.log("updateUserData created data---", updateUserData);
	// 		} catch (error: any) {
	// 			console.log("Error while onboarding user", error);

	// 		}
	// 	})

	// 	// toast({
	// 	// 	title: "Onboarding Data Submitted",
	// 	// 	description: (
	// 	// 		<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
	// 	// 			<code className="text-white">{JSON.stringify(data, null, 2)}</code>
	// 	// 		</pre>
	// 	// 	),
	// 	// });
	// }

	async function onSubmit(data: OnboardingFormData) {
		setOnboardingError("");
		startTransition(async () => {
			try {
				if (photoFile) {
					const reader = new FileReader();
					reader.onloadend = async () => {
						const base64Photo = reader.result as string;
						const updateUserData = await updateUser({
							username: data.username,
							photo: base64Photo,
							path: "/",
						});

						console.log("updateUserData created data---", updateUserData);

						switch (updateUserData?.status) {
							case 500:
								setOnboardingError("Something went wrong. Please try again!");
								break;
							case 400:
								setOnboardingError(updateUserData.message);
								break;
							case 409:
								setOnboardingError(updateUserData.message);
								break;
							case 200:
								await update({
									...session,
									user: {
										// ...session?.user,
										username: updateUserData.data.username, // Update session with new username
										photo: updateUserData.data.photo, // Update session with new photo URL
										// onboarding: false,
									},
								});

								console.log("session_after_onboarding", session);

								router.push(`/`);
								break;
							default:
								setOnboardingError(
									"An error occurred while updating user. Please try again!"
								);
								break;
						}
					};
					reader.readAsDataURL(photoFile);
				}
			} catch (error: any) {
				console.log("Error while onboarding user", error);
				setOnboardingError("Error while onboarding user");
			}
		});
	}

	// function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
	// 	const file = event.target.files?.[0];
	// 	if (file) {
	// 		const reader = new FileReader();
	// 		reader.onloadend = () => {
	// 			setPhotoPreview(reader.result as string);
	// 		};
	// 		reader.readAsDataURL(file);
	// 	}
	// 	form.setValue("photo", event.target.files as FileList);
	// }

	function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 1 * 1024 * 1024) {
				// 5 MB max size
				setPhotoError("File size must be less than 1MB.");
				return;
			}
			if (!file.type.startsWith("image/")) {
				setPhotoError("File must be an image.");
				return;
			} else {
				setPhotoFile(file);
				setPhotoPreview(URL.createObjectURL(file)); // Use URL.createObjectURL for preview
				form.setValue("photo", file ? file.name : "");
			}
		}
	}

	useEffect(() => {
		console.log("form errors", form.formState.errors); // Log form errors
	}, [form.formState.errors]);

	useEffect(() => {
		if (session?.user?.email) {
			form.setValue("email", session.user.email); // Dynamically set the email
		}
	}, [session, form]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="z-10 space-y-3 max-w-sm"
			>
				{onBoardingError && (
					<Alert variant="destructive">
						<ExclamationTriangleIcon className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{onBoardingError}</AlertDescription>
					</Alert>
				)}
				{photoError && (
					<Alert variant="destructive">
						<ExclamationTriangleIcon className="h-4 w-4" />
						<AlertTitle>Upload error</AlertTitle>
						<AlertDescription>{photoError}</AlertDescription>
					</Alert>
				)}
				<Card className="mx-auto max-w-lg">
					<CardHeader>
						<CardTitle className="text-2xl">Onboarding</CardTitle>
						<CardDescription>
							Complete your profile by filling in the details below
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Username <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input placeholder="Enter your username" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
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
												placeholder="m@example.com"
												{...field}
												readOnly={true}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* <div className="grid grid-cols-2 gap-2">
								<FormField
									control={form.control}
									name="firstname"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First name</FormLabel>
											<FormControl>
												<Input placeholder="Enter your first name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="lastname"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Last name</FormLabel>
											<FormControl>
												<Input placeholder="Enter your last name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div> */}

							<FormItem>
								<FormLabel>
									Upload Photo <span className="text-red-500">*</span>
								</FormLabel>
								<FormControl>
									<Input
										type="file"
										accept="image/*"
										onChange={handlePhotoChange}
									/>
								</FormControl>
								{photoPreview && (
									<div className="mt-2">
										<Image
											src={photoPreview}
											alt="Profile Preview"
											height={100}
											width={100}
											className="h-20 w-20 rounded-full object-cover"
										/>
									</div>
								)}
								<FormMessage />
							</FormItem>
							{isPending ? (
								<Button disabled>
									<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
									Please wait
								</Button>
							) : (
								<Button
									type="submit"
									disabled={photoError ? true : false}
									className="w-full"
								>
									Complete Onboarding
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</form>
		</Form>
	);
};

export default Onboarding;
