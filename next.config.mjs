/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		instrumentationHook: true,
		serverComponentsExternalPackages: ["mongoose"],
		runtime: 'nodejs',
	},
};

export default nextConfig;
