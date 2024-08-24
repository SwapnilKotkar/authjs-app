"use client";

import React, { useState } from "react";
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

// Define the Zod schema

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
	const { toast } = useToast();
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);

	const form = useForm<OnboardingFormData>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			username: "",
			firstname: "",
			lastname: "",
			photo: null as any, // Initial value for file input
		},
	});

	function onSubmit(data: OnboardingFormData) {
		toast({
			title: "Onboarding Data Submitted",
			description: (
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
		});
	}

	function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPhotoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
		form.setValue("photo", event.target.files as FileList);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="z-10">
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
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input placeholder="Enter your username" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-2 gap-2">
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
							</div>

							<FormItem>
								<FormLabel>Upload Photo</FormLabel>
								<FormControl>
									<Input
										type="file"
										accept="image/*"
										onChange={handlePhotoChange}
									/>
								</FormControl>
								{photoPreview && (
									<div className="mt-2">
										<img
											src={photoPreview}
											alt="Profile Preview"
											className="h-20 w-20 rounded-full object-cover"
										/>
									</div>
								)}
								<FormMessage />
							</FormItem>
							<Button type="submit" className="w-full">
								Complete Onboarding
							</Button>
						</div>
					</CardContent>
				</Card>
			</form>
		</Form>
	);
};

export default Onboarding;
