import supabase from "@/app/lib/supabase";

/**
 * 世界观设定类型定义
 */
export type Worldbuilding = {
	id?: number;
	title: string;
	content: string;
	category: string;
	workId: number;
	createdAt?: string;
	updatedAt?: string;
};

/**
 * 获取所有世界观设定
 * @returns 所有世界观设定数据
 */
export async function getAllWorldbuildings() {
	const { data, error } = await supabase
		.from("worldbuildings")
		.select("*, works(title)")
		.order("workId")
		.order("category")
		.order("title");

	if (error) {
		console.error("获取世界观设定列表失败:", error);
		throw new Error("获取世界观设定列表失败");
	}

	return data.map((worldbuilding) => ({
		...worldbuilding,
		workTitle: worldbuilding.works?.title,
	}));
}

/**
 * 获取某作品的所有世界观设定
 * @param workId 作品ID
 * @returns 作品的世界观设定数据
 */
export async function getWorldbuildingsByWorkId(workId: number) {
	const { data, error } = await supabase
		.from("worldbuildings")
		.select("*, works(title)")
		.eq("workId", workId)
		.order("category")
		.order("title");

	if (error) {
		console.error(`获取作品ID:${workId}的世界观设定列表失败:`, error);
		throw new Error("获取作品世界观设定列表失败");
	}

	return data.map((worldbuilding) => ({
		...worldbuilding,
		workTitle: worldbuilding.works?.title,
	}));
}

/**
 * 获取单个世界观设定
 * @param id 世界观设定ID
 * @returns 世界观设定数据
 */
export async function getWorldbuildingById(id: number) {
	const { data, error } = await supabase
		.from("worldbuildings")
		.select("*, works(title)")
		.eq("id", id)
		.single();

	if (error) {
		console.error(`获取世界观设定ID:${id}失败:`, error);
		throw new Error("获取世界观设定详情失败");
	}

	return {
		...data,
		workTitle: data.works?.title,
	};
}

/**
 * 创建新世界观设定
 * @param worldbuilding 世界观设定数据
 * @returns 创建的世界观设定
 */
export async function createWorldbuilding(worldbuilding: Worldbuilding) {
	const { data, error } = await supabase
		.from("worldbuildings")
		.insert([
			{
				title: worldbuilding.title,
				content: worldbuilding.content,
				category: worldbuilding.category,
				workId: worldbuilding.workId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		])
		.select()
		.single();

	if (error) {
		console.error("创建世界观设定失败:", error);
		throw new Error("创建世界观设定失败");
	}

	return data;
}

/**
 * 更新世界观设定
 * @param id 世界观设定ID
 * @param worldbuilding 世界观设定数据
 * @returns 更新后的世界观设定
 */
export async function updateWorldbuilding(
	id: number,
	worldbuilding: Partial<Worldbuilding>
) {
	const { data, error } = await supabase
		.from("worldbuildings")
		.update({
			...worldbuilding,
			updatedAt: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error(`更新世界观设定ID:${id}失败:`, error);
		throw new Error("更新世界观设定失败");
	}

	return data;
}

/**
 * 删除世界观设定
 * @param id 世界观设定ID
 * @returns 删除结果
 */
export async function deleteWorldbuilding(id: number) {
	const { error } = await supabase.from("worldbuildings").delete().eq("id", id);

	if (error) {
		console.error(`删除世界观设定ID:${id}失败:`, error);
		throw new Error("删除世界观设定失败");
	}

	return { success: true, id };
}
