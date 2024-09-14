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
