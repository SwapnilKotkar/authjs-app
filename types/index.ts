// ====== USER PARAMS
export type CreateUserParams = {
	// firstName: string;
	// lastName: string;
	email: string;
	// username: string;
	password: string;
	// photo?: string;
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
	photo: string;
	path: string;
};
