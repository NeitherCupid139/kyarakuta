import supabase from "@/app/lib/supabase";

/**
 * 角色关系类型定义
 */
export type Relationship = {
	id?: number;
	name: string;
	description?: string;
	type: string;
	sourceCharacterId: number;
	targetCharacterId: number;
	workId: number;
	createdAt?: string;
	updatedAt?: string;
};

/**
 * 获取所有角色关系
 * @returns 所有角色关系数据
 */
export async function getAllRelationships() {
	const { data, error } = await supabase
		.from("relationships")
		.select(
			`
      *, 
      works(title), 
      sourceCharacter:source_character_id(id, name),
      targetCharacter:target_character_id(id, name)
    `
		)
		.order("workId")
		.order("name");

	if (error) {
		console.error("获取角色关系列表失败:", error);
		throw new Error("获取角色关系列表失败");
	}

	return data.map((relationship) => ({
		...relationship,
		workTitle: relationship.works?.title,
		sourceCharacterName: relationship.sourceCharacter?.name,
		targetCharacterName: relationship.targetCharacter?.name,
	}));
}

/**
 * 获取某作品的所有角色关系
 * @param workId 作品ID
 * @returns 作品的角色关系数据
 */
export async function getRelationshipsByWorkId(workId: number) {
	const { data, error } = await supabase
		.from("relationships")
		.select(
			`
      *, 
      works(title), 
      sourceCharacter:source_character_id(id, name),
      targetCharacter:target_character_id(id, name)
    `
		)
		.eq("workId", workId)
		.order("name");

	if (error) {
		console.error(`获取作品ID:${workId}的角色关系列表失败:`, error);
		throw new Error("获取作品角色关系列表失败");
	}

	return data.map((relationship) => ({
		...relationship,
		workTitle: relationship.works?.title,
		sourceCharacterName: relationship.sourceCharacter?.name,
		targetCharacterName: relationship.targetCharacter?.name,
	}));
}

/**
 * 获取某角色的所有关系
 * @param characterId 角色ID
 * @returns 角色的关系数据
 */
export async function getRelationshipsByCharacterId(characterId: number) {
	const { data, error } = await supabase
		.from("relationships")
		.select(
			`
      *, 
      works(title), 
      sourceCharacter:source_character_id(id, name),
      targetCharacter:target_character_id(id, name)
    `
		)
		.or(
			`source_character_id.eq.${characterId},target_character_id.eq.${characterId}`
		)
		.order("name");

	if (error) {
		console.error(`获取角色ID:${characterId}的关系列表失败:`, error);
		throw new Error("获取角色关系列表失败");
	}

	return data.map((relationship) => ({
		...relationship,
		workTitle: relationship.works?.title,
		sourceCharacterName: relationship.sourceCharacter?.name,
		targetCharacterName: relationship.targetCharacter?.name,
	}));
}

/**
 * 获取单个角色关系
 * @param id 关系ID
 * @returns 关系数据
 */
export async function getRelationshipById(id: number) {
	const { data, error } = await supabase
		.from("relationships")
		.select(
			`
      *, 
      works(title), 
      sourceCharacter:source_character_id(id, name),
      targetCharacter:target_character_id(id, name)
    `
		)
		.eq("id", id)
		.single();

	if (error) {
		console.error(`获取关系ID:${id}失败:`, error);
		throw new Error("获取关系详情失败");
	}

	return {
		...data,
		workTitle: data.works?.title,
		sourceCharacterName: data.sourceCharacter?.name,
		targetCharacterName: data.targetCharacter?.name,
	};
}

/**
 * 创建新角色关系
 * @param relationship 关系数据
 * @returns 创建的关系
 */
export async function createRelationship(relationship: Relationship) {
	const { data, error } = await supabase
		.from("relationships")
		.insert([
			{
				name: relationship.name,
				description: relationship.description,
				type: relationship.type,
				source_character_id: relationship.sourceCharacterId,
				target_character_id: relationship.targetCharacterId,
				workId: relationship.workId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		])
		.select()
		.single();

	if (error) {
		console.error("创建角色关系失败:", error);
		throw new Error("创建角色关系失败");
	}

	return data;
}

/**
 * 更新角色关系
 * @param id 关系ID
 * @param relationship 关系数据
 * @returns 更新后的关系
 */
export async function updateRelationship(
	id: number,
	relationship: Partial<Relationship>
) {
	const updateData: Record<string, unknown> = {
		...relationship,
		updatedAt: new Date().toISOString(),
	};

	// 处理字段名称转换
	if (relationship.sourceCharacterId !== undefined) {
		updateData.source_character_id = relationship.sourceCharacterId;
		delete updateData.sourceCharacterId;
	}

	if (relationship.targetCharacterId !== undefined) {
		updateData.target_character_id = relationship.targetCharacterId;
		delete updateData.targetCharacterId;
	}

	const { data, error } = await supabase
		.from("relationships")
		.update(updateData)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error(`更新关系ID:${id}失败:`, error);
		throw new Error("更新角色关系失败");
	}

	return data;
}

/**
 * 删除角色关系
 * @param id 关系ID
 * @returns 删除结果
 */
export async function deleteRelationship(id: number) {
	const { error } = await supabase.from("relationships").delete().eq("id", id);

	if (error) {
		console.error(`删除关系ID:${id}失败:`, error);
		throw new Error("删除角色关系失败");
	}

	return { success: true, id };
}
