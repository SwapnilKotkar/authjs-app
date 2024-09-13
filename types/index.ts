// ====== USER PARAMS
export type CreateUserParams = {
	// firstName: string;
	// lastName: string;
	email: string;
	// username: string;
	password: string;
	// image?: string;
	path: string;
};

// export type getUserParams = {
// 	_id?: string;
// 	credentials?: {
// 		email: string;
// 		password: string;
// 	};
// };

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
	image: string;
};
