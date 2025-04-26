import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env" });

export default {
	schema: "./app/lib/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
	},
	// 设置严格模式，确保迁移安全
	strict: true,
	// 记录详细日志
	verbose: true,
	// 指定迁移文件名格式
	breakpoints: true,
} satisfies Config;
