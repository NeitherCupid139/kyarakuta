import { useState, useEffect, useCallback } from "react";
import { query, getById, insert, update, remove } from "@/app/db";
import type {
	CharacterRelation,
	InsertCharacterRelation,
	Character,
} from "@/app/db/schema";

/**
 * 角色关系管理钩子
 * 提供角色关系的增删改查功能
 */
export function useCharacterRelations(workId: string) {
	// 状态管理
	const [relations, setRelations] = useState<CharacterRelation[]>([]);
	const [characters, setCharacters] = useState<Character[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// 获取指定作品的所有角色关系
	const fetchRelations = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await query<CharacterRelation>(
				"character_relations",
				{ work_id: workId }
			);
			if (error) throw error;
			setRelations(data || []);
		} catch (err) {
			console.error("获取角色关系列表失败:", err);
			setError(err instanceof Error ? err : new Error("获取角色关系列表失败"));
		} finally {
			setLoading(false);
		}
	}, [workId]);

	// 获取指定作品的所有角色
	const fetchCharacters = useCallback(async () => {
		try {
			const { data, error } = await query<Character>("characters", {
				work_id: workId,
			});
			if (error) throw error;
			setCharacters(data || []);
		} catch (err) {
			console.error("获取角色列表失败:", err);
		}
	}, [workId]);

	// 获取单个角色关系详情
	const getRelation = useCallback(async (id: string) => {
		try {
			const { data, error } = await getById<CharacterRelation>(
				"character_relations",
				id
			);
			if (error) throw error;
			return data;
		} catch (err) {
			console.error(`获取角色关系ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 创建新角色关系
	const createRelation = useCallback(
		async (
			relationData: Omit<
				InsertCharacterRelation,
				"id" | "workId" | "createdAt" | "updatedAt"
			>
		) => {
			try {
				// 检查关系是否已存在
				const { data: existingRelations } = await query<CharacterRelation>(
					"character_relations",
					{
						work_id: workId,
						character_id_a: relationData.characterIdA,
						character_id_b: relationData.characterIdB,
					}
				);

				if (existingRelations && existingRelations.length > 0) {
					throw new Error("这两个角色之间的关系已经存在");
				}

				// 创建新关系
				const { data, error } = await insert<CharacterRelation>(
					"character_relations",
					{
						...relationData,
						work_id: workId,
					}
				);

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setRelations((prev) => [...prev, data]);
				}

				return data;
			} catch (err) {
				console.error("创建角色关系失败:", err);
				throw err;
			}
		},
		[workId]
	);

	// 更新角色关系
	const updateRelation = useCallback(
		async (
			id: string,
			relationData: Partial<
				Omit<
					InsertCharacterRelation,
					"id" | "workId" | "createdAt" | "updatedAt"
				>
			>
		) => {
			try {
				const { data, error } = await update<CharacterRelation>(
					"character_relations",
					id,
					relationData
				);
				if (error) throw error;

				// 更新本地状态
				if (data) {
					setRelations((prev) =>
						prev.map((relation) => (relation.id === id ? data : relation))
					);
				}

				return data;
			} catch (err) {
				console.error(`更新角色关系ID:${id}失败:`, err);
				throw err;
			}
		},
		[]
	);

	// 删除角色关系
	const deleteRelation = useCallback(async (id: string) => {
		try {
			const { error } = await remove("character_relations", id);
			if (error) throw error;

			// 更新本地状态
			setRelations((prev) => prev.filter((relation) => relation.id !== id));

			return true;
		} catch (err) {
			console.error(`删除角色关系ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 获取角色的所有关系
	const getCharacterRelations = useCallback(
		(characterId: string) => {
			return relations.filter(
				(relation) =>
					relation.characterIdA === characterId ||
					relation.characterIdB === characterId
			);
		},
		[relations]
	);

	// 检查两个角色之间是否已有关系
	const hasRelation = useCallback(
		(characterIdA: string, characterIdB: string) => {
			return relations.some(
				(relation) =>
					(relation.characterIdA === characterIdA &&
						relation.characterIdB === characterIdB) ||
					(relation.characterIdA === characterIdB &&
						relation.characterIdB === characterIdA)
			);
		},
		[relations]
	);

	// 获取关系数据，用于生成关系图
	const getRelationGraphData = useCallback(() => {
		const nodes = characters.map((character) => ({
			id: character.id,
			name: character.name,
			avatar: character.avatar,
		}));

		const edges = relations.map((relation) => ({
			source: relation.characterIdA,
			target: relation.characterIdB,
			type: relation.relationType,
			description: relation.description,
			id: relation.id,
		}));

		return { nodes, edges };
	}, [characters, relations]);

	// 初始加载
	useEffect(() => {
		if (workId) {
			fetchRelations();
			fetchCharacters();
		}
	}, [workId, fetchRelations, fetchCharacters]);

	return {
		relations,
		characters,
		loading,
		error,
		fetchRelations,
		fetchCharacters,
		getRelation,
		createRelation,
		updateRelation,
		deleteRelation,
		getCharacterRelations,
		hasRelation,
		getRelationGraphData,
	};
}
