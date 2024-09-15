export type CreateUserParams = {
	email: string;
	password: string;
	path: string;
};

export type getUserLoginParams = {
	email: string;
	password: string;
};

export type UpdateUserParams = {
	username: string;
	image: string;
	path: string;
};

export type providersLoginParams = {
	email: string;
	username: string;
	providerAccountId: string;
	providerType: string;
	image?: string;
};

export type otpParams = {
	email: string;
	enteredOTP?: string;
};

export type emailVerifyParams = {
	email: string;
	emailToken?: string;
};

export type resetPasswordParams = {
	email: string;
	newPassword: string;
};

export type verifyEmailTemplateParams = {
	email: string;
	verificationLink: string;
};

export type resetPasswordTemplateParams = {
	email: string;
	resetPasswordLink: string;
};

export type otpTemplateParams = {
	email: string;
	otp: string;
};

export type templateThemeParams = {
	backgroundColor: string;
	titleTextColor: string;
	linkColor?: string;
};
