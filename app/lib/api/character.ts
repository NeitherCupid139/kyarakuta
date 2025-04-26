import supabase from "@/app/lib/supabase";

/**
 * 角色类型定义
 */
export type Character = {
	id?: number;
	name: string;
	description?: string;
	workId: number;
	attributes?: Record<string, unknown>;
	createdAt?: string;
	updatedAt?: string;
};

/**
 * 获取所有角色
 * @returns 所有角色数据
 */
export async function getAllCharacters() {
	const { data, error } = await supabase
		.from("characters")
		.select("*, works(title)")
		.order("workId")
		.order("name");

	if (error) {
		console.error("获取角色列表失败:", error);
		throw new Error("获取角色列表失败");
	}

	return data.map((character) => ({
		...character,
		workTitle: character.works?.title,
	}));
}

/**
 * 获取某作品的所有角色
 * @param workId 作品ID
 * @returns 作品的角色数据
 */
export async function getCharactersByWorkId(workId: number) {
	const { data, error } = await supabase
		.from("characters")
		.select("*, works(title)")
		.eq("workId", workId)
		.order("name");

	if (error) {
		console.error(`获取作品ID:${workId}的角色列表失败:`, error);
		throw new Error("获取作品角色列表失败");
	}

	return data.map((character) => ({
		...character,
		workTitle: character.works?.title,
	}));
}

/**
 * 获取单个角色
 * @param id 角色ID
 * @returns 角色数据
 */
export async function getCharacterById(id: number) {
	const { data, error } = await supabase
		.from("characters")
		.select("*, works(title)")
		.eq("id", id)
		.single();

	if (error) {
		console.error(`获取角色ID:${id}失败:`, error);
		throw new Error("获取角色详情失败");
	}

	return {
		...data,
		workTitle: data.works?.title,
	};
}

/**
 * 创建新角色
 * @param character 角色数据
 * @returns 创建的角色
 */
export async function createCharacter(character: Character) {
	const { data, error } = await supabase
		.from("characters")
		.insert([
			{
				name: character.name,
				description: character.description,
				workId: character.workId,
				attributes: character.attributes || {},
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		])
		.select()
		.single();

	if (error) {
		console.error("创建角色失败:", error);
		throw new Error("创建角色失败");
	}

	return data;
}

/**
 * 更新角色
 * @param id 角色ID
 * @param character 角色数据
 * @returns 更新后的角色
 */
export async function updateCharacter(
	id: number,
	character: Partial<Character>
) {
	const { data, error } = await supabase
		.from("characters")
		.update({
			...character,
			updatedAt: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error(`更新角色ID:${id}失败:`, error);
		throw new Error("更新角色失败");
	}

	return data;
}

/**
 * 删除角色
 * @param id 角色ID
 * @returns 删除结果
 */
export async function deleteCharacter(id: number) {
	// 先删除相关联的事件角色关系
	const { error: relationError } = await supabase
		.from("event_characters")
		.delete()
		.eq("characterId", id);

	if (relationError) {
		console.error(`删除角色ID:${id}的事件关联失败:`, relationError);
		throw new Error("删除角色关联失败");
	}

	// 再删除角色关系表中的数据
	const { error: relationshipError } = await supabase
		.from("relationships")
		.delete()
		.or(`sourceCharacterId.eq.${id},targetCharacterId.eq.${id}`);

	if (relationshipError) {
		console.error(`删除角色ID:${id}的关系失败:`, relationshipError);
		throw new Error("删除角色关系失败");
	}

	// 最后删除角色本身
	const { error } = await supabase.from("characters").delete().eq("id", id);

	if (error) {
		console.error(`删除角色ID:${id}失败:`, error);
		throw new Error("删除角色失败");
	}

	return { success: true, id };
}
