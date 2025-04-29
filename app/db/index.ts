"use server"; // 添加服务器指令标记

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import supabase from "@/app/lib/supabase";
import * as schema from "./schema";

/**
 * 获取数据库连接实例
 * 使用Supabase的PostgreSQL连接
 * 仅在服务器端使用
 */
const getDbClient = () => {
	// 确保只在服务器端运行
	if (typeof window !== "undefined") {
		throw new Error("Postgres客户端只能在服务器端使用");
	}

	// 使用默认连接字符串，这样即使环境变量未设置也不会抛出错误
	const connectionString =
		process.env.NEXT_PUBLIC_SUPABASE_POSTGRES_URL ||
		process.env.DATABASE_URL ||
		"postgres://postgres:postgres@localhost:5432/postgres";

	try {
		const client = postgres(connectionString);
		return drizzle(client, { schema });
	} catch (error) {
		console.error("数据库连接失败:", error);
		throw error;
	}
};

// 导出异步函数来获取数据库实例
export async function getDb() {
	if (typeof window === "undefined") {
		return getDbClient();
	}
	throw new Error("数据库操作只能在服务器端执行");
}

/**
 * 提供基本的数据库操作函数
 * 这些函数使用Supabase客户端而非直接使用postgres
 * 可以在客户端安全使用
 */
export async function query<T>(
	tableName: string,
	query: Record<string, unknown> = {}
) {
	try {
		let supabaseQuery = supabase.from(tableName).select();

		// 只有当查询条件不为空时才添加 match 条件
		if (Object.keys(query).length > 0) {
			supabaseQuery = supabaseQuery.match(query);
		}

		const { data, error } = await supabaseQuery;

		if (error) throw error;
		return { data: data as T[], error: null };
	} catch (error) {
		console.error(`查询表${tableName}时出错:`, error);
		return { data: null, error };
	}
}

export async function getById<T>(tableName: string, id: string) {
	try {
		const { data, error } = await supabase
			.from(tableName)
			.select()
			.eq("id", id)
			.single();

		if (error) throw error;
		return { data: data as T, error: null };
	} catch (error) {
		console.error(`获取表${tableName}中ID为${id}的记录时出错:`, error);
		return { data: null, error };
	}
}

export async function insert<T>(
	tableName: string,
	data: Record<string, unknown>
) {
	try {
		const { data: result, error } = await supabase
			.from(tableName)
			.insert(data)
			.select()
			.single();

		if (error) throw error;
		return { data: result as T, error: null };
	} catch (error) {
		console.error(`向表${tableName}插入数据时出错:`, error);
		return { data: null, error };
	}
}

export async function update<T>(
	tableName: string,
	id: string,
	data: Record<string, unknown>
) {
	try {
		const { data: result, error } = await supabase
			.from(tableName)
			.update(data)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return { data: result as T, error: null };
	} catch (error) {
		console.error(`更新表${tableName}中ID为${id}的记录时出错:`, error);
		return { data: null, error };
	}
}

export async function remove(tableName: string, id: string) {
	try {
		const { error } = await supabase.from(tableName).delete().eq("id", id);

		if (error) throw error;
		return { error: null };
	} catch (error) {
		console.error(`从表${tableName}中删除ID为${id}的记录时出错:`, error);
		return { error };
	}
}
