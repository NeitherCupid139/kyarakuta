import { useState, useEffect, useCallback } from "react";
import { query, getById, insert, update, remove } from "@/app/db";
import type { Work, InsertWork } from "@/app/db/schema";

/**
 * 作品管理钩子
 * 提供作品的增删改查功能
 */
export function useWorks() {
	// 状态管理
	const [works, setWorks] = useState<Work[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// 获取所有作品列表
	const fetchWorks = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await query<Work>("works", {});
			if (error) throw error;
			setWorks(data || []);
		} catch (err) {
			console.error("获取作品列表失败:", err);
			setError(err instanceof Error ? err : new Error("获取作品列表失败"));
		} finally {
			setLoading(false);
		}
	}, []);

	// 获取单个作品详情
	const getWork = useCallback(async (id: string) => {
		try {
			const { data, error } = await getById<Work>("works", id);
			if (error) throw error;
			return data;
		} catch (err) {
			console.error(`获取作品ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 创建新作品
	const createWork = useCallback(
		async (workData: Omit<InsertWork, "id" | "createdAt" | "updatedAt">) => {
			try {
				const { data, error } = await insert<Work>("works", workData);
				if (error) throw error;

				// 更新本地状态
				if (data) {
					setWorks((prev) => [...prev, data]);
				}
				return data;
			} catch (err) {
				console.error("创建作品失败:", err);
				throw err;
			}
		},
		[]
	);

	// 更新作品
	const updateWork = useCallback(
		async (
			id: string,
			workData: Partial<Omit<InsertWork, "id" | "createdAt" | "updatedAt">>
		) => {
			try {
				const { data, error } = await update<Work>("works", id, workData);
				if (error) throw error;

				// 更新本地状态
				if (data) {
					setWorks((prev) =>
						prev.map((work) => (work.id === id ? data : work))
					);
				}
				return data;
			} catch (err) {
				console.error(`更新作品ID:${id}失败:`, err);
				throw err;
			}
		},
		[]
	);

	// 删除作品
	const deleteWork = useCallback(async (id: string) => {
		try {
			const { error } = await remove("works", id);
			if (error) throw error;

			// 更新本地状态
			setWorks((prev) => prev.filter((work) => work.id !== id));
			return true;
		} catch (err) {
			console.error(`删除作品ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 初始加载
	useEffect(() => {
		fetchWorks();
	}, [fetchWorks]);

	return {
		works,
		loading,
		error,
		fetchWorks,
		getWork,
		createWork,
		updateWork,
		deleteWork,
	};
}
