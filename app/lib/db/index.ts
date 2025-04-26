import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 使用环境变量中的数据库连接字符串
const connectionString = process.env.DATABASE_URL || "";

// 在开发环境中使用单例模式避免热重载时创建多个连接
const globalForPostgres = globalThis as unknown as {
	postgres: postgres.Sql<Record<string, unknown>>;
};

// 创建 postgres 客户端
export const client =
	globalForPostgres.postgres || postgres(connectionString, { max: 1 });

// 在开发环境中保存客户端实例
if (process.env.NODE_ENV === "development") globalForPostgres.postgres = client;

// 创建 drizzle 实例
export const db = drizzle(client, { schema });
