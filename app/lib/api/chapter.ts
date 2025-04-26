import supabase from "@/app/lib/supabase";

/**
 * 章节类型定义
 */
export type Chapter = {
	id?: number;
	title: string;
	content: string;
	order: number;
	workId: number;
	createdAt?: string;
	updatedAt?: string;
};

/**
 * 获取所有章节
 * @returns 所有章节数据
 */
export async function getAllChapters() {
	const { data, error } = await supabase
		.from("chapters")
		.select("*, works(title)")
		.order("workId")
		.order("order");

	if (error) {
		console.error("获取章节列表失败:", error);
		throw new Error("获取章节列表失败");
	}

	return data.map((chapter) => ({
		...chapter,
		workTitle: chapter.works?.title,
	}));
}

/**
 * 获取某作品的所有章节
 * @param workId 作品ID
 * @returns 作品的章节数据
 */
export async function getChaptersByWorkId(workId: number) {
	const { data, error } = await supabase
		.from("chapters")
		.select("*, works(title)")
		.eq("workId", workId)
		.order("order");

	if (error) {
		console.error(`获取作品ID:${workId}的章节列表失败:`, error);
		throw new Error("获取作品章节列表失败");
	}

	return data.map((chapter) => ({
		...chapter,
		workTitle: chapter.works?.title,
	}));
}

/**
 * 获取单个章节
 * @param id 章节ID
 * @returns 章节数据
 */
export async function getChapterById(id: number) {
	const { data, error } = await supabase
		.from("chapters")
		.select("*, works(title)")
		.eq("id", id)
		.single();

	if (error) {
		console.error(`获取章节ID:${id}失败:`, error);
		throw new Error("获取章节详情失败");
	}

	return {
		...data,
		workTitle: data.works?.title,
	};
}

/**
 * 创建新章节
 * @param chapter 章节数据
 * @returns 创建的章节
 */
export async function createChapter(chapter: Chapter) {
	const { data, error } = await supabase
		.from("chapters")
		.insert([
			{
				title: chapter.title,
				content: chapter.content,
				order: chapter.order,
				workId: chapter.workId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		])
		.select()
		.single();

	if (error) {
		console.error("创建章节失败:", error);
		throw new Error("创建章节失败");
	}

	return data;
}

/**
 * 更新章节
 * @param id 章节ID
 * @param chapter 章节数据
 * @returns 更新后的章节
 */
export async function updateChapter(id: number, chapter: Partial<Chapter>) {
	const { data, error } = await supabase
		.from("chapters")
		.update({
			...chapter,
			updatedAt: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error(`更新章节ID:${id}失败:`, error);
		throw new Error("更新章节失败");
	}

	return data;
}

/**
 * 删除章节
 * @param id 章节ID
 * @returns 删除结果
 */
export async function deleteChapter(id: number) {
	const { error } = await supabase.from("chapters").delete().eq("id", id);

	if (error) {
		console.error(`删除章节ID:${id}失败:`, error);
		throw new Error("删除章节失败");
	}

	return { success: true, id };
}
