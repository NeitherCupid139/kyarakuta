import { useState, useEffect, useCallback } from "react";
import { query, getById, insert, update, remove } from "@/app/db";
import type { WorldSetting, InsertWorldSetting } from "@/app/db/schema";

/**
 * 世界观设定管理钩子
 * 提供世界观设定的增删改查功能
 */
export function useWorldSettings(workId: string) {
	// 状态管理
	const [worldSettings, setWorldSettings] = useState<WorldSetting[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// 获取指定作品的所有世界观设定
	const fetchWorldSettings = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await query<WorldSetting>("world_settings", {
				work_id: workId,
			});
			if (error) throw error;
			setWorldSettings(data || []);
		} catch (err) {
			console.error("获取世界观设定列表失败:", err);
			setError(
				err instanceof Error ? err : new Error("获取世界观设定列表失败")
			);
		} finally {
			setLoading(false);
		}
	}, [workId]);

	// 获取单个世界观设定详情
	const getWorldSetting = useCallback(async (id: string) => {
		try {
			const { data, error } = await getById<WorldSetting>("world_settings", id);
			if (error) throw error;
			return data;
		} catch (err) {
			console.error(`获取世界观设定ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 创建新世界观设定
	const createWorldSetting = useCallback(
		async (
			worldSettingData: Omit<
				InsertWorldSetting,
				"id" | "workId" | "createdAt" | "updatedAt"
			>
		) => {
			try {
				const { data, error } = await insert<WorldSetting>("world_settings", {
					...worldSettingData,
					work_id: workId,
				});

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setWorldSettings((prev) => [...prev, data]);
				}

				return data;
			} catch (err) {
				console.error("创建世界观设定失败:", err);
				throw err;
			}
		},
		[workId]
	);

	// 更新世界观设定
	const updateWorldSetting = useCallback(
		async (
			id: string,
			worldSettingData: Partial<
				Omit<InsertWorldSetting, "id" | "workId" | "createdAt" | "updatedAt">
			>
		) => {
			try {
				const { data, error } = await update<WorldSetting>(
					"world_settings",
					id,
					worldSettingData
				);

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setWorldSettings((prev) =>
						prev.map((worldSetting) =>
							worldSetting.id === id ? data : worldSetting
						)
					);
				}

				return data;
			} catch (err) {
				console.error(`更新世界观设定ID:${id}失败:`, err);
				throw err;
			}
		},
		[]
	);

	// 删除世界观设定
	const deleteWorldSetting = useCallback(async (id: string) => {
		try {
			const { error } = await remove("world_settings", id);
			if (error) throw error;

			// 更新本地状态
			setWorldSettings((prev) =>
				prev.filter((worldSetting) => worldSetting.id !== id)
			);

			return true;
		} catch (err) {
			console.error(`删除世界观设定ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 根据分类获取世界观设定
	const getWorldSettingsByCategory = useCallback(
		(category: string) => {
			return worldSettings.filter(
				(worldSetting) => worldSetting.category === category
			);
		},
		[worldSettings]
	);

	// 获取所有可用的分类
	const getAllCategories = useCallback(() => {
		const categories = new Set<string>();
		worldSettings.forEach((worldSetting) => {
			categories.add(worldSetting.category);
		});
		return Array.from(categories);
	}, [worldSettings]);

	// 初始加载
	useEffect(() => {
		if (workId) {
			fetchWorldSettings();
		}
	}, [workId, fetchWorldSettings]);

	return {
		worldSettings,
		loading,
		error,
		fetchWorldSettings,
		getWorldSetting,
		createWorldSetting,
		updateWorldSetting,
		deleteWorldSetting,
		getWorldSettingsByCategory,
		getAllCategories,
	};
}
