import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		config.resolve.alias = {
			...config.resolve.alias,
			mongoose: path.resolve("node_modules/mongoose"), // Define alias for mongoose
		};
		return config;
	},
};

export default nextConfig;
