import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// 客户端打包配置
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				os: false,
				path: false,
				net: false,
				tls: false,
				child_process: false,
				dns: false,
				crypto: false,
				stream: false,
				http: false,
				https: false,
				zlib: false,
				util: false,
			};
		}

		// 将数据库相关模块标记为外部模块，仅在服务器端使用
		if (!isServer) {
			config.externals = [
				...(config.externals || []),
				"postgres",
				"pg",
				"pg-native",
				"drizzle-orm/postgres-js",
				"drizzle-orm/pg-core",
			];
		}

		return config;
	},
};

export default nextConfig;
