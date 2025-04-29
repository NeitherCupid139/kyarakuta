import { createClient } from "@supabase/supabase-js";

// 创建Supabase客户端实例
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * 配置Supabase客户端
 * 用于与Supabase数据库交互
 * 使用默认值确保开发环境中即使没有环境变量也能正常运行
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
	},
});

export default supabase;
