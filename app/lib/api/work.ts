import supabase from "@/app/lib/supabase";

/**
 * 作品类型定义
 */
export type Work = {
	id?: number;
	title: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
};

/**
 * 获取所有作品
 * @returns 所有作品数据
 */
export async function getAllWorks() {
	const { data, error } = await supabase
		.from("works")
		.select("*")
		.order("updatedAt", { ascending: false });

	if (error) {
		console.error("获取作品列表失败:", error);
		throw new Error("获取作品列表失败");
	}

	return data;
}

/**
 * 获取单个作品
 * @param id 作品ID
 * @returns 作品数据
 */
export async function getWorkById(id: number) {
	const { data, error } = await supabase
		.from("works")
		.select("*")
		.eq("id", id)
		.single();

	if (error) {
		console.error(`获取作品ID:${id}失败:`, error);
		throw new Error("获取作品详情失败");
	}

	return data;
}

/**
 * 创建新作品
 * @param work 作品数据
 * @returns 创建的作品
 */
export async function createWork(work: Work) {
	const { data, error } = await supabase
		.from("works")
		.insert([
			{
				title: work.title,
				description: work.description,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		])
		.select()
		.single();

	if (error) {
		console.error("创建作品失败:", error);
		throw new Error("创建作品失败");
	}

	return data;
}

/**
 * 更新作品
 * @param id 作品ID
 * @param work 作品数据
 * @returns 更新后的作品
 */
export async function updateWork(id: number, work: Partial<Work>) {
	const { data, error } = await supabase
		.from("works")
		.update({
			...work,
			updatedAt: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error(`更新作品ID:${id}失败:`, error);
		throw new Error("更新作品失败");
	}

	return data;
}

/**
 * 删除作品
 * @param id 作品ID
 * @returns 删除结果
 */
export async function deleteWork(id: number) {
	const { error } = await supabase.from("works").delete().eq("id", id);

	if (error) {
		console.error(`删除作品ID:${id}失败:`, error);
		throw new Error("删除作品失败");
	}

	return { success: true, id };
}
