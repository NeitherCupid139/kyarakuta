import { useState, useEffect, useCallback } from "react";
import { query, getById, insert, update, remove } from "@/app/db";
import type { Character, InsertCharacter } from "@/app/db/schema";

/**
 * 角色管理钩子
 * 提供角色的增删改查功能
 */
export function useCharacters(workId: string) {
	// 状态管理
	const [characters, setCharacters] = useState<Character[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// 获取指定作品的所有角色
	const fetchCharacters = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await query<Character>("characters", {
				work_id: workId,
			});
			if (error) throw error;
			setCharacters(data || []);
		} catch (err) {
			console.error("获取角色列表失败:", err);
			setError(err instanceof Error ? err : new Error("获取角色列表失败"));
		} finally {
			setLoading(false);
		}
	}, [workId]);

	// 获取单个角色详情
	const getCharacter = useCallback(async (id: string) => {
		try {
			const { data, error } = await getById<Character>("characters", id);
			if (error) throw error;
			return data;
		} catch (err) {
			console.error(`获取角色ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 创建新角色
	const createCharacter = useCallback(
		async (
			characterData: Omit<
				InsertCharacter,
				"id" | "workId" | "createdAt" | "updatedAt" | "attributes"
			>
		) => {
			try {
				const { data, error } = await insert<Character>("characters", {
					...characterData,
					work_id: workId,
					attributes: {},
				});

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setCharacters((prev) => [...prev, data]);
				}

				return data;
			} catch (err) {
				console.error("创建角色失败:", err);
				throw err;
			}
		},
		[workId]
	);

	// 更新角色
	const updateCharacter = useCallback(
		async (
			id: string,
			characterData: Partial<
				Omit<InsertCharacter, "id" | "workId" | "createdAt" | "updatedAt">
			>
		) => {
			try {
				const { data, error } = await update<Character>(
					"characters",
					id,
					characterData
				);
				if (error) throw error;

				// 更新本地状态
				if (data) {
					setCharacters((prev) =>
						prev.map((character) => (character.id === id ? data : character))
					);
				}

				return data;
			} catch (err) {
				console.error(`更新角色ID:${id}失败:`, err);
				throw err;
			}
		},
		[]
	);

	// 删除角色
	const deleteCharacter = useCallback(async (id: string) => {
		try {
			const { error } = await remove("characters", id);
			if (error) throw error;

			// 更新本地状态
			setCharacters((prev) => prev.filter((character) => character.id !== id));

			return true;
		} catch (err) {
			console.error(`删除角色ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 更新角色的自定义属性
	const updateCharacterAttributes = useCallback(
		async (id: string, attributeUpdates: Record<string, unknown>) => {
			try {
				// 获取当前角色信息
				const currentCharacter = characters.find((c) => c.id === id);
				if (!currentCharacter) throw new Error("角色不存在");

				// 合并属性
				const currentAttributes = currentCharacter.attributes || {};
				const updatedAttributes = { ...currentAttributes, ...attributeUpdates };

				// 更新角色
				const { data, error } = await update<Character>("characters", id, {
					attributes: updatedAttributes,
				});

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setCharacters((prev) =>
						prev.map((character) => (character.id === id ? data : character))
					);
				}

				return data;
			} catch (err) {
				console.error(`更新角色属性失败:`, err);
				throw err;
			}
		},
		[characters]
	);

	// 删除角色的自定义属性
	const removeCharacterAttribute = useCallback(
		async (id: string, attributeKey: string) => {
			try {
				// 获取当前角色信息
				const currentCharacter = characters.find((c) => c.id === id);
				if (!currentCharacter) throw new Error("角色不存在");

				// 复制当前属性并移除指定的属性
				const currentAttributes = { ...(currentCharacter.attributes || {}) };
				delete currentAttributes[attributeKey];

				// 更新角色
				const { data, error } = await update<Character>("characters", id, {
					attributes: currentAttributes,
				});

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setCharacters((prev) =>
						prev.map((character) => (character.id === id ? data : character))
					);
				}

				return data;
			} catch (err) {
				console.error(`删除角色属性失败:`, err);
				throw err;
			}
		},
		[characters]
	);

	// 初始加载
	useEffect(() => {
		if (workId) {
			fetchCharacters();
		}
	}, [workId, fetchCharacters]);

	return {
		characters,
		loading,
		error,
		fetchCharacters,
		getCharacter,
		createCharacter,
		updateCharacter,
		deleteCharacter,
		updateCharacterAttributes,
		removeCharacterAttribute,
	};
}
