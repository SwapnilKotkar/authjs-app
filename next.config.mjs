/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		esmExternals: "loose", // Enable loose mode for ESM externals
		serverComponentsExternalPackages: ["mongoose"], // Ensure mongoose is treated as an external package in server components
	},
};

export default nextConfig;
