import { useState, useEffect, useCallback } from "react";
import { query, getById, insert, update, remove } from "@/app/db";
import type { Chapter, InsertChapter } from "@/app/db/schema";

/**
 * 章节管理钩子
 * 提供章节的增删改查和排序功能
 */
export function useChapters(workId: string) {
	// 状态管理
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// 获取指定作品的所有章节
	const fetchChapters = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await query<Chapter>("chapters", {
				work_id: workId,
			});
			if (error) throw error;

			// 按章节顺序排序
			const sortedChapters = [...(data || [])].sort(
				(a, b) => a.order - b.order
			);
			setChapters(sortedChapters);
		} catch (err) {
			console.error("获取章节列表失败:", err);
			setError(err instanceof Error ? err : new Error("获取章节列表失败"));
		} finally {
			setLoading(false);
		}
	}, [workId]);

	// 获取单个章节详情
	const getChapter = useCallback(async (id: string) => {
		try {
			const { data, error } = await getById<Chapter>("chapters", id);
			if (error) throw error;
			return data;
		} catch (err) {
			console.error(`获取章节ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 创建新章节
	const createChapter = useCallback(
		async (
			chapterData: Omit<
				InsertChapter,
				"id" | "workId" | "createdAt" | "updatedAt"
			>
		) => {
			try {
				// 计算新章节的顺序值
				const order =
					chapters.length > 0
						? Math.max(...chapters.map((chapter) => chapter.order)) + 1
						: 0;

				const { data, error } = await insert<Chapter>("chapters", {
					...chapterData,
					work_id: workId,
					order,
				});

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setChapters((prev) => [...prev, data]);
				}

				return data;
			} catch (err) {
				console.error("创建章节失败:", err);
				throw err;
			}
		},
		[chapters, workId]
	);

	// 更新章节
	const updateChapter = useCallback(
		async (
			id: string,
			chapterData: Partial<
				Omit<InsertChapter, "id" | "workId" | "createdAt" | "updatedAt">
			>
		) => {
			try {
				const { data, error } = await update<Chapter>(
					"chapters",
					id,
					chapterData
				);
				if (error) throw error;

				// 更新本地状态
				if (data) {
					setChapters((prev) =>
						prev.map((chapter) => (chapter.id === id ? data : chapter))
					);
				}

				return data;
			} catch (err) {
				console.error(`更新章节ID:${id}失败:`, err);
				throw err;
			}
		},
		[]
	);

	// 删除章节
	const deleteChapter = useCallback(async (id: string) => {
		try {
			const { error } = await remove("chapters", id);
			if (error) throw error;

			// 更新本地状态
			setChapters((prev) => prev.filter((chapter) => chapter.id !== id));

			return true;
		} catch (err) {
			console.error(`删除章节ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 更新章节顺序
	const reorderChapters = useCallback(async (reorderedChapters: Chapter[]) => {
		try {
			// 更新每个章节的order值
			const updatePromises = reorderedChapters.map((chapter, index) =>
				update<Chapter>("chapters", chapter.id, { order: index })
			);

			await Promise.all(updatePromises);

			// 更新本地状态
			setChapters(reorderedChapters);

			return true;
		} catch (err) {
			console.error("更新章节顺序失败:", err);
			throw err;
		}
	}, []);

	// 设置章节关联关系
	const setNextChapter = useCallback(
		async (chapterId: string, nextChapterId: string | null) => {
			try {
				const { data, error } = await update<Chapter>("chapters", chapterId, {
					next_chapter_id: nextChapterId,
				});

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setChapters((prev) =>
						prev.map((chapter) => (chapter.id === chapterId ? data : chapter))
					);
				}

				return data;
			} catch (err) {
				console.error(`设置章节关联关系失败:`, err);
				throw err;
			}
		},
		[]
	);

	// 初始加载
	useEffect(() => {
		if (workId) {
			fetchChapters();
		}
	}, [workId, fetchChapters]);

	return {
		chapters,
		loading,
		error,
		fetchChapters,
		getChapter,
		createChapter,
		updateChapter,
		deleteChapter,
		reorderChapters,
		setNextChapter,
	};
}
