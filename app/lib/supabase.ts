import { createClient } from "@supabase/supabase-js";

// 创建Supabase客户端实例
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * 配置Supabase客户端
 * 用于与Supabase数据库交互
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
